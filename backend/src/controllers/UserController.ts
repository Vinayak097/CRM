import type { Response } from "express";
import User, { Role } from "../models/User.js";
import bcrypt from "bcryptjs";
import type { AuthRequest } from "../middlewares/auth.js";

// Helper to check user creation permission
const canCreateRole = (requesterRole: Role, targetRole: Role): boolean => {
  if (requesterRole === Role.Admin) return true;
  if (requesterRole === Role.SalesManager && targetRole === Role.SalesAgent) return true;
  if (requesterRole === Role.BusinessHead && targetRole === Role.OnboardingAgent) return true;
  return false;
};

// Helper to check user management permission (update/delete)
const canManageUser = (requesterRole: Role, targetUserRole: Role): boolean => {
  if (requesterRole === Role.Admin) return true;
  if (requesterRole === Role.SalesManager && targetUserRole === Role.SalesAgent) return true;
  if (requesterRole === Role.BusinessHead && targetUserRole === Role.OnboardingAgent) return true;
  return false;
};

export const createUser = async (req: AuthRequest, res: Response) => {
  const { password, name, role, email, phone } = req.body;

  if (!password || !name || !email || !role) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  // RBAC for user creation
  if (!req.user || !canCreateRole(req.user.role, role as Role)) {
    return res.status(403).json({ message: "Access denied. You cannot create this role." });
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

    const user = await User.create({
      name,
      role,
      email,
      phone,
      password,
    });

    res.status(201).json({
      message: "User created",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
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

    // RBAC for update
    if (!req.user || !canManageUser(req.user.role, existUser.role)) {
      return res.status(403).json({ message: "Access denied. You cannot manage this user." });
    }

    // Prevent role escalation: Non-admins cannot change role
    if (req.user.role !== Role.Admin && role && role !== existUser.role) {
      return res.status(403).json({ message: "Access denied. You cannot change user roles." });
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

    // RBAC for delete
    if (!req.user || !canManageUser(req.user.role, existUser.role)) {
      return res.status(403).json({ message: "Access denied. You cannot delete this user." });
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

    const filter: Record<string, unknown> = {};

    // RBAC for listing users
    if (req.user?.role === Role.SalesManager) {
      filter.role = Role.SalesAgent;
    } else if (req.user?.role === Role.BusinessHead) {
      filter.role = Role.OnboardingAgent;
    } else if (req.user?.role !== Role.Admin) {
      // Sales agents and others cannot see user list (or maybe only themselves? for now deny)
      // If Sales Agent needs to see profile, they use getUserById with their own ID. 
      // Listing is usually for management.
      return res.status(403).json({ message: "Access denied" });
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("-password")
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
