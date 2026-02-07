import type { Response } from "express";
import User, { Role } from "../models/User.js";
import bcrypt from "bcryptjs";
import type { AuthRequest } from "../middlewares/auth.js";

export const createUser = async (req: AuthRequest, res: Response) => {
  const { password, name, role, email, phone, managedBy } = req.body;
  const currentUser = req.user!;

  if (!password || !name || !email || !role) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  try {
    const emailUser = await User.findOne({ email });
    if (emailUser) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    if (phone) {
      const phoneUser = await User.findOne({ phone });
      if (phoneUser) {
        res.status(400).json({ message: "Phone already used by another user" });
        return;
      }
    }

    // Determine managedBy based on role and current user
    let finalManagedBy = managedBy || undefined;

    // If current user is Sales Manager creating a Sales Agent, auto-assign
    if (role === Role.SalesAgent && currentUser.role === Role.SalesManager) {
      finalManagedBy = currentUser.id;
    }

    // If current user is Business Head creating an Onboarding Agent, auto-assign
    if (role === Role.OnboardingAgent && currentUser.role === Role.BusinessHead) {
      finalManagedBy = currentUser.id;
    }

    // Validate managedBy for agents
    if (role === Role.SalesAgent) {
      if (!finalManagedBy) {
        res.status(400).json({ message: "Sales Agent must be assigned to a Sales Manager" });
        return;
      }
      const manager = await User.findById(finalManagedBy);
      if (!manager || manager.role !== Role.SalesManager) {
        res.status(400).json({ message: "Invalid Sales Manager" });
        return;
      }
    }

    if (role === Role.OnboardingAgent) {
      if (!finalManagedBy) {
        res.status(400).json({ message: "Onboarding Agent must be assigned to a Business Head" });
        return;
      }
      const manager = await User.findById(finalManagedBy);
      if (!manager || manager.role !== Role.BusinessHead) {
        res.status(400).json({ message: "Invalid Business Head" });
        return;
      }
    }

    const user = await User.create({
      name,
      role,
      email,
      phone,
      password,
      managedBy: finalManagedBy,
    });

    res.status(201).json({
      message: "User created",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        managedBy: user.managedBy,
      },
    });
  } catch (e) {
    console.error("Error in create user:", e);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  const userId = req.params.id;
  const { name, role, phone, email } = req.body;

  try {
    const existUser = await User.findById(userId);
    if (!existUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (email && email !== existUser.email) {
      const emailUser = await User.findOne({ email }).where("_id").ne(userId);
      if (emailUser) {
        res.status(400).json({ message: "Email already in use" });
        return;
      }
    }

    if (phone && phone !== existUser.phone) {
      const phoneUser = await User.findOne({ phone }).where("_id").ne(userId);
      if (phoneUser) {
        res.status(400).json({ message: "Phone already in use" });
        return;
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, role, phone, email },
      { new: true }
    ).select("-password");

    res.status(200).json({ message: "User updated", data: user });
  } catch (e) {
    console.error("Error in update user:", e);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { oldPassword, newPassword, id } = req.body;
    const requester = req.user!;
    const targetUserId = id || requester.id;

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters" });
      return;
    }

    const user = await User.findById(targetUserId).select("+password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isAdmin = requester.role === Role.Admin;

    if (!isAdmin) {
      if (requester.id !== targetUserId.toString()) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      if (!oldPassword) {
        res.status(400).json({ message: "Old password is required" });
        return;
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        res.status(401).json({ message: "Current password is incorrect" });
        return;
      }
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (e) {
    console.error("Error in change password:", e);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  const userId = req.params.id;

  try {
    const existUser = await User.findById(userId);
    if (!existUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (req.user?.id === userId) {
      res.status(400).json({ message: "Cannot delete yourself" });
      return;
    }

    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "User deleted" });
  } catch (e) {
    console.error("Error in delete user:", e);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || "";
    const currentUser = req.user!;

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Filter based on user role
    if (currentUser.role === Role.SalesManager) {
      // Sales Managers only see Sales Agents they manage
      filter.managedBy = currentUser.id;
      filter.role = Role.SalesAgent;
    } else if (currentUser.role === Role.BusinessHead) {
      // Business Heads only see Onboarding Agents they manage
      filter.managedBy = currentUser.id;
      filter.role = Role.OnboardingAgent;
    }
    // Admins can see all users (no additional filter)

    const users = await User.find(filter)
      .select("-password")
      .populate("managedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments(filter);

    res.status(200).json({
      data: users,
      pagination: {
        total: totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (e) {
    console.error("Error in get users:", e);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({ data: user });
  } catch (e) {
    console.error("Error in get user by id:", e);
    res.status(500).json({ message: "Internal server error" });
  }
};
