import type { Response } from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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
    console.log("user :", user, email)
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // const isPasswordMatch = await bcrypt.compare(password, user.password);
    // if (!isPasswordMatch) {
    //   res.status(401).json({ error: "Invalid credentials" });
    //   return;
    // }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET || "your_jwt_secret_key_change_this",
      { expiresIn: "24h" }
    );

    // Set token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

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
  res: Response,
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
  res: Response,
): Promise<void> => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Logout failed",
    });
  }
};

export const verifySess = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    // Check if user is attached to request (done by middleware verifying JWT)
    if (!req.user) {
      // Try to re-verify token from cookie if not already attached
      const token = req.cookies?.token;
      if (!token) {
        res.status(401).json({ error: "No active session" });
        return;
      }

      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "your_jwt_secret_key_change_this"
        ) as any;

        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          name: decoded.name
        };
      } catch (err) {
        res.status(401).json({ error: "Invalid session" });
        return;
      }
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
  res: Response,
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
