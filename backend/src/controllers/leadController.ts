import type { Request, Response } from "express";

import User, { Role } from "../models/User.js";
import { LeadStatus } from "../types/lead.types.js";
import { createNotification } from "./notificationController.js";
import {
  NotificationMessage,
  NotificationType,
  RelatedEntity,
} from "../models/Notification.js";
import type { AuthRequest, AuthUser } from "../middlewares/auth.js";
import { leadZodSchema, type LeadInput } from "@/types/Lead.zod.js";
import Lead from "@/models/Lead.js";
import mongoose from "mongoose";

const getAgentIdForLead = (user?: AuthUser | null): string | null => {
  if (user && user.role === Role.SalesAgent) {
    return user.id;
  }
  return null;
};

// Helper to find Sales Manager with fewest leads
async function findManagerWithFewestLeads(): Promise<string | null> {
  try {
    // Pipeline to find manager with fewest leads
    const managers = await User.aggregate([
      { $match: { role: Role.SalesManager } },
      {
        $lookup: {
          from: "leads",
          let: { managerId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$system.managerId", "$$managerId"] } } }
          ],
          as: "leads"
        }
      },
      {
        $project: {
          _id: 1,
          leadCount: { $size: "$leads" }
        }
      },
      { $sort: { leadCount: 1 } },
      { $limit: 1 }
    ]);

    if (managers.length > 0) {
      return managers[0]._id.toString();
    }
    return null;
  } catch (error) {
    console.error("Error finding manager with fewest leads:", error);
    return null;
  }
}

export async function createLeadController(req: AuthRequest, res: Response) {
  try {
    const validationResult = leadZodSchema.safeParse(req.body);
    console.log("validationResult", validationResult)
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error,
      });
    }

    const leadData: LeadInput = validationResult.data;

    // Create lead with system defaults
    // Auto-assign manager if not provided (though practically it should be auto-assigned)
    let managerId = leadData.system?.managerId;

    if (!managerId) {
      managerId = await findManagerWithFewestLeads() as any;
    }

    if (!managerId) {
      // Fallback: If no manager found, this might be a critical issue or first run
      // For now, if Admin is creating, maybe assign to Admin or leave logic? 
      // Requirement says "ManagerId must always exist". 
      // If no managers exist in DB, we can't create a lead properly under this rule.
      // We will throw error if no manager found.
      const anyManager = await User.findOne({ role: Role.SalesManager });
      if (anyManager) {
        managerId = anyManager.id;
      } else {
        return res.status(400).json({
          success: false,
          message: "No Sales Manager found to assign lead to.",
        });
      }
    }

    // Create lead with system defaults
    const lead = new Lead({
      ...leadData,
      system: {
        leadStatus: leadData.system?.leadStatus || LeadStatus.New,
        priorityScore: leadData.system?.priorityScore || 0,
        investmentScore: leadData.system?.investmentScore || 0,
        managerId: managerId,
        assignedAgent: null, // Always null on creation as per requirement
      },
    });

    await lead.save();

    return res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: lead,
    });
  } catch (error) {
    console.error("Error creating lead:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
export const updateLeadController = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    console.log("id enter update controller");

    // Validate ID
    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lead ID",
      });
    }

    // Find lead
    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // Check sales agent access
    if (req.user?.role === Role.SalesAgent) {
      const isAssigned = lead.system?.assignedAgent?.toString() === req.user.id;
      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: "You can only update leads assigned to you",
        });
      }

      // Prevent agents from changing assignedAgent
      if (req.body.system?.assignedAgent) {
        return res.status(403).json({
          success: false,
          message: "You cannot change assigned agent",
        });
      }
    }

    // Check sales manager access
    if (req.user?.role === Role.SalesManager) {
      const isManaged = lead.system?.managerId?.toString() === req.user.id;
      if (!isManaged) {
        return res.status(403).json({
          success: false,
          message: "You can only update leads managed by you",
        });
      }
    }

    // Validate update data
    const validationResult = leadZodSchema.partial().safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.error,
      });
    }

    // Logic for Admin changing manager
    if (req.body.system?.managerId && req.user?.role === Role.Admin) {
      const newManagerId = req.body.system.managerId;
      const oldManagerId = lead.system?.managerId?.toString();

      if (newManagerId !== oldManagerId) {
        // Reset assigned agent if manager changes
        req.body.system.assignedAgent = null;
      }
    }

    // Prevent non-admins from changing managerId
    if (req.body.system?.managerId && req.user?.role !== Role.Admin) {
      delete req.body.system.managerId;
    }

    // Update lead with nested object support
    const updatedLead = await Lead.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate("system.assignedAgent", "name email phone")
      .populate("system.managerId", "name email");

    return res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: updatedLead,
    });
  } catch (error: any) {
    console.error("Update lead error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate value error",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// Helper function to get all nested field paths
function getNestedFieldPaths(obj: any, prefix = ""): string[] {
  const paths: string[] = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const path = prefix ? `${prefix}.${key}` : key;

      if (
        typeof obj[key] === "object" &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        // Recursively get nested paths
        paths.push(...getNestedFieldPaths(obj[key], path));
      } else {
        paths.push(path);
      }
    }
  }

  return paths;
}

// Optional: Create audit log function
async function createAuditLog(data: any) {
  try {
    // Implement your audit log creation logic here
    // This could save to an AuditLog collection or external service
    console.log("Audit log:", data);
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}
export const getAllLeadsController = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      assignedAgent,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query as any;

    const filter: any = {};

    // Role-based access control

    // Sales Agent: Can only see leads assigned to them
    if (req.user?.role === Role.SalesAgent) {
      filter["system.assignedAgent"] = new mongoose.Types.ObjectId(req.user.id);
    }
    // Sales Manager: Can only see leads managed by them
    else if (req.user?.role === Role.SalesManager) {
      filter["system.managerId"] = new mongoose.Types.ObjectId(req.user.id);
    }
    // Admin: Can (optionally) filter by manager or agent for viewing specific users' leads
    else if (req.user?.role === Role.Admin || req.user?.role === Role.BusinessHead) {
      if (assignedAgent && mongoose.Types.ObjectId.isValid(assignedAgent as string)) {
        filter["system.assignedAgent"] = new mongoose.Types.ObjectId(assignedAgent as string);
      }
      // Can add manager filter if passed in query
      // const { managerId } = req.query;
      // if (managerId) filter["system.managerId"] = ...
    }
    // Status filter
    if (status) {
      filter["system.leadStatus"] = status;
    }

    // Search filter (search across name, email, phone)
    if (search) {
      filter.$or = [
        { "identity.firstName": { $regex: search, $options: "i" } },
        { "identity.lastName": { $regex: search, $options: "i" } },
        { "identity.email": { $regex: search, $options: "i" } },
        { "identity.phone": { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const sort: any = {};
    sort[`${sortBy}`] = sortOrder === "asc" ? 1 : -1;

    const leads = await Lead.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .limit(limitNum)
      .populate("system.assignedAgent", "name email")
      .populate("system.managerId", "name email")
      .lean();

    const total = await Lead.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: "Leads retrieved successfully",
      data: {
        leads,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getLeadByIdController = async (
  req: AuthRequest,
  res: Response
) => {
  const { id } = req.params;
  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid lead ID format",
    });
  }
  try {
    const lead = await Lead.findById(id)
      .populate("system.assignedAgent", "name email")
      .populate("system.managerId", "name email");

    if (!lead) {
      res.status(404).json({ message: "Lead not found" });
      return;
    }

    // For sales agents, check if lead is assigned to them
    if (req.user?.role === Role.SalesAgent) {
      const assignedAgent = lead.system?.assignedAgent as any;
      const assignedAgentId = typeof assignedAgent === 'object' && assignedAgent !== null
        ? assignedAgent._id?.toString()
        : assignedAgent?.toString();

      if (assignedAgentId !== req.user.id) {
        res.status(403).json({ message: "Access denied" });
        return;
      }
    }

    res.status(200).json({ data: lead });
  } catch (error) {
    console.error("Get lead error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteLeadController = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const lead = await Lead.findById(id);
    if (!lead) {
      res.status(404).json({ message: "Lead not found" });
      return;
    }

    // For sales agents, check if lead is assigned to them
    if (req.user?.role === Role.SalesAgent) {
      const assignedAgent = lead.system?.assignedAgent as any;
      const assignedAgentId = typeof assignedAgent === 'object' && assignedAgent !== null
        ? assignedAgent._id?.toString()
        : assignedAgent?.toString();

      if (assignedAgentId !== req.user.id) {
        res.status(403).json({ message: "Access denied" });
        return;
      }
    }

    await Lead.findByIdAndDelete(id);

    res.status(200).json({ message: "Lead deleted successfully" });
  } catch (error) {
    console.error("Delete lead error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateLeadStatusController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { leadStatus, notes } = req.body;

    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lead ID format",
      });
    }

    if (!leadStatus || !Object.values(LeadStatus).includes(leadStatus)) {
      return res.status(400).json({
        success: false,
        message: "Valid lead status is required",
        validStatuses: Object.values(LeadStatus),
      });
    }

    // Find the lead
    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // Check role-based access
    if (req.user?.role === Role.SalesAgent) {
      // Sales agents can only update their own assigned leads
      if (
        !lead.system?.assignedAgent ||
        lead.system.assignedAgent.toString() !== req.user.id
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You can only update leads assigned to you.",
        });
      }
    }

    // Store old status for notification
    const oldStatus = lead.system?.leadStatus || LeadStatus.New;

    // Ensure system object exists
    if (!lead.system) {
      lead.system = {
        managerId: new mongoose.Types.ObjectId() as any, // This is a rare fallback, but required by type
        leadStatus: LeadStatus.New,
        priorityScore: 0,
        investmentScore: 0,
      };
    }

    // Update lead status
    lead.system.leadStatus = leadStatus;

    await lead.save();

    // Create notification for status change
    if (lead.system?.assignedAgent && oldStatus !== leadStatus) {
      await createNotification({
        recipient: lead.system.assignedAgent,
        type: NotificationType.StatusUpdate,
        title: "Lead Status Updated",
        message: `Lead status changed from ${oldStatus} to ${leadStatus}`,
        relatedEntity: RelatedEntity.Lead,
        relatedEntityId: lead._id,
        isRead: false,
      });
    }

    // Create notification for admin/sales manager
    if (req.user?.role !== Role.Admin && req.user?.role !== Role.SalesAgent) {
      // Find admin/sales manager to notify
      const admins = await User.find({
        role: { $in: [Role.Admin] },
      }).select("_id");

      for (const admin of admins) {
        await createNotification({
          recipient: admin._id,
          type: NotificationType.StatusUpdate,
          title: "Lead Status Changed by Agent",
          message: `Agent ${req.user?.name} changed lead status from ${oldStatus} to ${leadStatus}`,
          relatedEntity: RelatedEntity.Lead,
          relatedEntityId: lead._id,
          isRead: false,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Lead status updated successfully",
      data: {
        leadId: lead._id,
        oldStatus,
        newStatus: leadStatus,
        updatedAt: lead.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating lead status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
export const assignAgentToLeadController = async (
  req: AuthRequest,
  res: Response
) => {
  const { id } = req.params;
  const { agentId } = req.body;

  try {
    if (!agentId) {
      return res.status(400).json({ message: "Agent ID is required" });
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    if (req.user?.role === Role.SalesAgent) {
      return res.status(403).json({ message: "Access denied" });
    }

    const oldAgent = lead.system?.assignedAgent?.toString();

    // VALIDATION: Check if agent exists and has role sales_agent
    const agent = await User.findById(agentId);
    if (!agent || agent.role !== Role.SalesAgent) {
      return res.status(400).json({ message: "Invalid agent or agent role is not Sales Agent" });
    }

    // VALIDATION: Check if Agent's manager matches Lead's manager
    // Note: User model needs reference to manager. Assuming 'managedBy' field on User based on context or similar.
    // The requirements say "Agent.managerId === lead.managerId". 
    // In User model, we verify if there is `managedBy` or similar. 
    // Checking User.ts... it has `managedBy?: mongoose.Types.ObjectId;`

    const leadManagerId = lead.system?.managerId?.toString();
    const agentManagerId = agent.managedBy?.toString();

    if (!leadManagerId) {
      // This should technically not happen if schema requires it, but for safety
      return res.status(400).json({ message: "Lead does not have a manager assigned. Cannot assign agent." });
    }

    if (agentManagerId !== leadManagerId) {
      return res.status(400).json({
        message: "Agent does not report to the Lead's Manager. Hierarchy violation.",
        details: `Agent Manager: ${agentManagerId}, Lead Manager: ${leadManagerId}`
      });
    }

    // METHOD 1: Direct assignment with type assertion (Your current approach)
    if (!lead.system) {
      // Create minimal system object
      lead.system = {
        assignedAgent: agentId,
        leadStatus: LeadStatus.New,
        managerId: leadManagerId // Maintain manager
      } as any;
    } else {
      // Just update the assignedAgent
      lead.system.assignedAgent = agentId;
    }

    // Tell Mongoose this nested object was modified
    lead.markModified("system");

    await lead.save();

    if (agentId !== oldAgent) {
      await createNotification({
        recipient: agentId,
        type: NotificationType.LeadAssigned,
        title: NotificationType.LeadAssigned,
        message: NotificationMessage.LeadAssigned,
        relatedEntity: RelatedEntity.Lead,
        relatedEntityId: lead._id,
        isRead: false,
      });
    }

    return res.status(200).json({
      message: "Agent assigned to lead",
      data: lead,
    });
  } catch (error) {
    console.error("Assign agent error:", error);
    console.error("Error details:", {});
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};
