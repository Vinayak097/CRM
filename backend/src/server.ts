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

import path from "path";
import { fileURLToPath } from "url";
import { authenticateToken, requireRole } from "./middlewares/auth.js";
import { Role } from "./models/User.js";
import propertyRoutes from "./routes/property.routes.js";
import { errorHandler } from "./utils/errorHandler.js";
import locationRoutes from "./routes/location.routes.js";
import developerRoutes from "./routes/developer.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app: Express = express();
app.set("trust proxy", 1); // Critical for Render/Vercel to recognize HTTPS

// Connect to database
connectDB().catch((error) => {
  console.error("Failed to connect to database:", error);
  process.exit(1);
});

// Middleware

const allowedOrigins = [
  "http://localhost:5173",
  "https://crm-mu-rosy.vercel.app"
];

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
app.use(express.json());
app.use(cookieParser());
// Session middleware removed for stateless JWT authentication

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use(
  "/api/leads",
  authenticateToken,
  requireRole([Role.Admin, Role.salesAgent]),
  leadRoutes,
);
app.use("/api/users", userRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/developers", developerRoutes);

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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
