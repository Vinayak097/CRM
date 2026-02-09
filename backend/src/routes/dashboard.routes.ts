import { Router } from "express";
import { getDashboard, getSalesFunnel, getOperationalAnalyticsController } from "../controllers/dashboard.controller.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = Router();

router.get("/", authenticateToken, getDashboard);
router.get("/sales-funnel", authenticateToken, getSalesFunnel);
router.get("/operational-analytics", authenticateToken, getOperationalAnalyticsController);

export default router;
