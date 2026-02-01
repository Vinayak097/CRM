import { Router } from "express";
import { getDashboard } from "../controllers/dashboard.controller.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = Router();

router.get("/", authenticateToken, getDashboard);

export default router;
