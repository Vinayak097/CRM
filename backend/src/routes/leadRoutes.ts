import { Router } from "express";
import {
  assignAgentToLeadController,
  createLeadController,
  deleteLeadController,
  getAllLeadsController,
  getLeadByIdController,
  updateLeadController,
  updateLeadStatusController,
} from "../controllers/leadController.js";
import { authenticateToken, requireRole } from "../middlewares/auth.js";
import { Role } from "../models/User.js";

const router = Router();

// Allowed roles for lead operations (excludes onboarding_agent)
const leadAccessRoles = [Role.Admin, Role.SalesAgent, Role.SalesManager];

// Test route without any middleware
router.post("/test", (req, res) => {
  console.log("Test route hit with body:", req.body);
  res.json({ message: "Test route works", data: req.body });
});

// Create a new lead (admin, sales_agent, sales_manager only)
router.post("/", requireRole(leadAccessRoles), createLeadController);

// Get all leads with filters
router.get("/", requireRole(leadAccessRoles), getAllLeadsController);

// Get lead by ID
router.get("/:id", requireRole(leadAccessRoles), getLeadByIdController);

// Update lead (partial update)
router.patch("/:id", requireRole(leadAccessRoles), updateLeadController);

// Update lead status
router.patch("/:id/status", requireRole(leadAccessRoles), updateLeadStatusController);

// Assign agent to lead (admin/sales manager only)
router.patch(
  "/:id/assign-agent",
  requireRole([Role.Admin, Role.SalesAgent]),
  assignAgentToLeadController
);

// Delete lead (admin only)
router.delete("/:id", requireRole([Role.Admin]), deleteLeadController);

// router.post(
//   "/:id/convert",
//   authenticateToken,
//   requireRole([Role.Admin]),
//   convertLeadToCustomer as any
// );

export default router;
