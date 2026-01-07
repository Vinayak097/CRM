import "dotenv/config";
import express from "express";
import type { Express, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import { connectDB } from "./db/connect.js";
import authRoutes from "./routes/auth.js";
import leadRoutes from "./routes/leadRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import fs from "fs";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app: Express = express();

// Connect to database
connectDB().catch((error) => {
  console.error("Failed to connect to database:", error);
  process.exit(1);
});

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/users", userRoutes);

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK" });
});
app.post("/typeform", async (req, res) => {
  const body = req.body;

  // folder where json files will be stored
  const dirPath = path.join(__dirname, "../../data");

  // create folder if not exists
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // file name (timestamp-based)
  const fileName = `request-${Date.now()}.json`;
  const filePath = path.join(dirPath, fileName);

  // write file
  fs.writeFileSync(filePath, JSON.stringify(body, null, 2), "utf-8");
});
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
