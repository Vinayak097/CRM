import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.js";
import { getDashboardStats, getSalesFunnelData } from "../services/dashboard.service.js";

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { id, role } = req.user;
    const dashboardData = await getDashboardStats(id, role);

    res.json(dashboardData);
  } catch (error: any) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch dashboard data" });
  }
};

export const getSalesFunnel = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { startDate, endDate, agentId } = req.query;

    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;
    const agent = agentId as string | undefined;

    const funnelData = await getSalesFunnelData(start, end, agent);

    res.json(funnelData);
  } catch (error: any) {
    console.error("Sales funnel error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch sales funnel data" });
  }
};
