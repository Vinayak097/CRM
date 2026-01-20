import type { Response } from "express";
import User, { Role } from "../models/User.js";
import { SendServerError, SendTwoh } from "../common/shared.js";
import type { AuthRequest } from "../middlewares/auth.js";

const createUser = async (req: AuthRequest, res: Response) => {
  const { password, name, role, email, phone } = req.body;
  try {
    const existUser = await User.findOne({ email });
    if (existUser) {
      res.status(400).json({ message: "email already exist" });
      return;
    } else {
      const existUser = await User.findOne({ phone });
      if (existUser) {
        res
          .status(400)
          .json({ message: "phone no. alerady used by other user " });
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
    SendTwoh(res, user);
  } catch (e) {
    console.log(e, "error in create user");
    SendServerError(res);
  }
};

const updateUser = async (req: AuthRequest, res: Response) => {
  const { name, role, phone, email } = req.body;
  try {
    const existUser = await User.findOne({ email });
    if (!existUser) {
      res.status(404).json({ message: "user not found" });
      return;
    }
    const user = await User.findByIdAndUpdate(existUser._id, {
      name,
      role,
      phone,
      email,
    });
    SendTwoh(res, user);
  } catch (e) {
    console.log(e, " update user");
    SendServerError(res);
  }
};

const ChangePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { oldPassword, newPassword, id } = req.body;
    const existUser = await User.findById(id);
    if (!existUser) {
      res.status(404).json({ message: "user not found" });
      return;
    }
    if (req.user?.role == Role.Admin) {
      await User.findByIdAndUpdate(id, { password: newPassword });
    }
    if (oldPassword != existUser.password) {
      res.status(411).json({ message: "password incorrect" });
    }
    await User.findByIdAndUpdate(id, { password: newPassword });
    SendTwoh(res, null);
  } catch (e) {
    console.log("error in change password");
    SendServerError(res);
  }
};

const deleteUser = async (req: AuthRequest, res: Response) => {
  const userId = req.params.id;
  try {
    const existUser = await User.findById(userId);
    if (!existUser) {
      res.status(404).json({ message: "user not found" });
      return;
    }
    await User.findByIdAndDelete(userId);
    SendTwoh(res, null);
  } catch (e) {
    console.log(e);
    SendServerError(res);
  }
};
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || "";

    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
    console.log("users " , users)
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
    console.log(e);
    SendServerError(res);
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ data: user });
  } catch (e) {
    console.log(e);
    SendServerError(res);
  }
};

export { createUser, updateUser, ChangePassword, deleteUser };
