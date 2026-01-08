import type { Response } from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import type { AuthRequest } from "../middlewares/auth.js";

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    console.log("login route enterd");

    if (!email || !password) {
      res.status(400).json({ error: "Please provide email and password" });
      return;
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // const isPasswordMatch = await bcrypt.compare(password, user.password);
    // if (!isPasswordMatch) {
    //   res.status(401).json({ error: "Invalid credentials" });
    //   return;
    // }

    req.session.userId = user._id.toString();
    req.session.userEmail = user.email;
    req.session.userRole = user.role;
    req.session.userName = user.name;

    user.lastLogin = new Date();
    await user.save();

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Login failed",
    });
  }
};

export const getCurrentUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "No user information" });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Get Current User Error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to fetch user",
    });
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.session) {
      res.json({ message: "Logout successful" });
      return;
    }

    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ error: "Logout failed" });
        return;
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logout successful" });
    });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Logout failed",
    });
  }
};

export const verifySess = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "No active session" });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({
      valid: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Session Verification Error:", error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Session verification failed",
    });
  }
};

export const register = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      res
        .status(400)
        .json({ error: "Please provide name, email, and password" });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || "sales_agent",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Registration failed",
    });
  }
};

export const verifyTokenEndpoint = verifySess;
