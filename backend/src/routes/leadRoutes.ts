import { Router } from "express";
import {
  assignAgentToLeadController,
  convertLeadToCustomer,
  getAllLeads,
  getLeadById,
  LeadCreate,
  updateLeadController,
} from "../controllers/leadController.js";
import { authenticateToken, requireRole } from "../middlewares/auth.js";
import { Role } from "../models/User.js";

const router = Router();

// Temporarily bypass auth for testing
router.post("/", (req, res) => {
  console.log("Lead route hit with body:", req.body);
  // Mock user for testing
  req.user = {
    id: '6953a1869b5329ee2f8b39b5',
    email: 'admin@avacasa.com',
    role: 'admin' as any,
    name: 'Admin User'
  };
  return LeadCreate(req as any, res);
});

// Test route without any middleware
router.post("/test", (req, res) => {
  console.log("Test route hit with body:", req.body);
  res.json({ message: "Test route works", data: req.body });
});
router.get("/", authenticateToken, getAllLeads as any);
router.get("/:id", authenticateToken, getLeadById as any);
router.put("/:id", authenticateToken, updateLeadController as any);
router.post("/:id/convert", authenticateToken, requireRole([Role.Admin]), convertLeadToCustomer as any);
router.post("/:leadId/assign", authenticateToken, requireRole([Role.Admin]), assignAgentToLeadController as any);

export default router;
