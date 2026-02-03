import "dotenv/config";
import express from "express";
import type { Express, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./db/connect.js";
import authRoutes from "./routes/auth.js";
import leadRoutes from "./routes/leadRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import fs from "fs";
import projectRoutes from "./routes/project.routes.js";
import path from "path";
import { fileURLToPath } from "url";
import { authenticateToken, requireRole } from "./middlewares/auth.js";
import { Role } from "./models/User.js";
import propertyRoutes from "./routes/property.routes.js";
import { errorHandler } from "./utils/errorHandler.js";
import locationRoutes from "./routes/location.routes.js";
import developerRoutes from "./routes/developer.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import taskRoutes from "./routes/task.routes.js";
import communicationRoutes from "./routes/communication.routes.js";
import { initializeTaskScheduler } from "./workers/taskScheduler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app: Express = express();
app.set("trust proxy", 1); // Critical for Render/Vercel to recognize HTTPS

// Body Parsing Middleware (must be before routes)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Connect to database
connectDB().catch((error) => {
  console.error("Failed to connect to database:", error);
  process.exit(1);
});

const allowedOrigins = [
  "http://localhost:5173",
  "https://crm-mu-rosy.vercel.app",
  // Add your Render frontend URL here when deployed
  process.env.FRONTEND_URL,
].filter(Boolean); // Remove undefined values

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
// express.json and cookieParser moved up
// Session middleware removed for stateless JWT authentication

// Debug middleware with file logging
app.use((req, res, next) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body,
    query: req.query,
    params: req.params
  };

  if (req.method !== 'GET') {
    try {
      fs.appendFileSync('request_debug.log', JSON.stringify(logEntry, null, 2) + '\n---\n');
    } catch (err) {
      console.error('Failed to write to debug log:', err);
    }
    console.log(`${req.method} ${req.path}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use(
  "/api/leads",
  authenticateToken,
  requireRole([Role.Admin, Role.SalesAgent, Role.SalesManager]),
  leadRoutes,
);
app.use("/api/users", userRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/developers", developerRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/communications", communicationRoutes);
app.use("/api/project", projectRoutes);
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

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize Task Scheduler
// Runs every 2 minutes to process overdue tasks
// Can be configured with environment variable TASK_SCHEDULER_INTERVAL_MINUTES
const schedulerInterval = parseInt(process.env.TASK_SCHEDULER_INTERVAL_MINUTES || "2", 10);
const taskSchedulerId = initializeTaskScheduler(schedulerInterval);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("[SERVER] SIGTERM received, shutting down gracefully...");
  clearInterval(taskSchedulerId);
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("[SERVER] SIGINT received, shutting down gracefully...");
  clearInterval(taskSchedulerId);
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
