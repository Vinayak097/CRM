import type { Response } from "express";
import { Lead } from "@/models/Lead.js";
import { Role } from "../models/User.js";
import { LeadStatus } from "../types/lead.types.js";
import { createNotification } from "./notificationController.js";
import {
  NotificationMessage,
  NotificationType,
  RelatedEntity,
} from "../models/Notification.js";
import type { AuthRequest, AuthUser } from "../middlewares/auth.js";

const getAgentIdForLead = (user?: AuthUser | null): string | null => {
  if (user && user.role === Role.salesAgent) {
    return user.id;
  }
  return null;
};

export const LeadCreate = async (req: AuthRequest, res: Response) => {
  console.log("LeadCreate called with body:", req.body);
  const {
    identity,
    profile,
    demographics,
    buyerProfile,
    assetPreferences,
    purchaseReadiness,
    ownershipPreferences,
    locationProfile,
    lifestylePreferences,
    unitPreferences,
    notes,
    system,
  } = req.body;

  if (!identity?.fullName || !identity?.phone) {
    res
      .status(400)
      .json({ message: "identity.fullName and identity.phone are required" });
    return;
  }

  const agentId = system?.assignedAgent || getAgentIdForLead(req.user);

  try {
    res.status(201).json({
      message: "Lead creation endpoint reached successfully",
      receivedData: req.body,
      user: req.user
    });
  } catch (error) {
    console.error("Error in LeadCreate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Create Lead
 * - Accepts partial payload (webhook or manual)
 * - Prevents duplicate leads by phone/email
 * - Does NOT enforce required fields (except identity uniqueness)
 */
export const createLeadGPT = async (req: AuthRequest, res: Response) => {
  try {
    const payload = req.body;

    // ----------------------------
    // 1. Basic safety check
    // ----------------------------
    if (!payload?.identity?.phone && !payload?.identity?.email) {
      return res.status(400).json({
        success: false,
        message: "At least phone or email is required to create a lead",
      });
    }

    // ----------------------------
    // 2. Normalize identity
    // ----------------------------
    if (payload.identity?.email) {
      payload.identity.email = payload.identity.email.toLowerCase().trim();
    }

    if (payload.identity?.phone) {
      payload.identity.phone = payload.identity.phone.trim();
    }

    // ----------------------------
    // 3. Duplicate check
    // ----------------------------
    const existingLead = await Lead.findOne({
      $or: [
        { "identity.phone": payload.identity.phone },
        { "identity.email": payload.identity.email },
      ],
    });

    if (existingLead) {
      return res.status(409).json({
        success: false,
        message: "Lead already exists",
        data: existingLead,
      });
    }

    // ----------------------------
    // 4. Auto system fields
    // ----------------------------
    payload.system = {
      ...payload.system,
      leadStatus: payload.system?.leadStatus || "New",
      assignedAgent: payload.system?.assignedAgent || req.user?.id,
    };

    // ----------------------------
    // 5. Create lead
    // ----------------------------
    const lead = await Lead.create(payload);

    return res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: lead,
    });
  } catch (error: any) {
    console.error("Create Lead Error:", error);

    // Handle Mongo duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate lead detected",
        error: error.keyValue,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create lead",
    });
  }
};

export const updateLeadController = async (req: AuthRequest, res: Response) => {
  const leadId = req.params.id;
  const updates = req.body;

  try {
    const existingLead = await Lead.findById(leadId);
    if (!existingLead) {
      res.status(404).json({ message: "Lead not found" });
      return;
    }

    const oldAgent = existingLead.system?.assignedAgent?.toString();
    const newAgent = updates.system?.assignedAgent;

    const updatedLead = await Lead.findByIdAndUpdate(
      leadId,
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).populate("system.assignedAgent", "name email");

    if (newAgent && newAgent !== oldAgent) {
      await createNotification({
        recipient: newAgent,
        type: NotificationType.LeadAssigned,
        title: NotificationType.LeadAssigned,
        message: NotificationMessage.LeadAssigned,
        relatedEntity: RelatedEntity.Lead,
        relatedEntityId: updatedLead!._id,
        isRead: false,
      });
    }

    res
      .status(200)
      .json({ message: "Lead updated successfully", data: updatedLead });
  } catch (e) {
    console.error("Error in update lead:", e);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllLeads = async (req: AuthRequest, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search;

    const filter: Record<string, unknown> = {};
    console.log("get all leads ");
    if (req.user?.role === Role.salesAgent) {
      filter["system.assignedAgent"] = req.user.id;
    }
    if (search) {
      filter.$or = [
        { "identity.fullName": { $regex: search, $options: "i" } },
        { "identity.email": { $regex: search, $options: "i" } },
        { "identity.phone": { $regex: search, $options: "i" } },
      ];
    }

    const leads = await Lead.find(filter)
      .populate("system.assignedAgent", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalLeads = await Lead.countDocuments(filter);

    res.status(200).json({
      data: leads,
      pagination: {
        total: totalLeads,
        page,
        limit,
        totalPages: Math.ceil(totalLeads / limit),
      },
    });
  } catch (error) {
    console.error("Get all leads error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getLeadById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const lead = await Lead.findById(id).populate(
      "system.assignedAgent",
      "name email"
    );

    if (!lead) {
      res.status(404).json({ message: "Lead not found" });
      return;
    }

    if (
      req.user?.role === Role.salesAgent &&
      lead.system?.assignedAgent?.toString() !== req.user.id
    ) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    res.status(200).json({ data: lead });
  } catch (error) {
    console.error("Get lead error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const assignAgentToLeadController = async (
  req: AuthRequest,
  res: Response
) => {
  const { leadId } = req.params;
  const { agentId } = req.body;

  try {
    if (!agentId) {
      res.status(400).json({ message: "Agent ID is required" });
      return;
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      res.status(404).json({ message: "Lead not found" });
      return;
    }

    if (req.user?.role === Role.salesAgent) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    const oldAgent = lead.system?.assignedAgent?.toString();
    if (!lead.system) {
      lead.system = { assignedAgent: agentId, leadStatus: LeadStatus.New };
    } else {
      lead.system.assignedAgent = agentId;
    }
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

    res.status(200).json({ message: "Agent assigned to lead", data: lead });
  } catch (error) {
    console.error("Assign agent error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const convertLeadToCustomer = async (
  req: AuthRequest,
  res: Response
) => {
  const { id } = req.params;

  try {
    const lead = await Lead.findById(id);
    if (!lead) {
      res.status(404).json({ message: "Lead not found" });
      return;
    }

    if (lead.system?.leadStatus === LeadStatus.Converted) {
      res.status(400).json({ message: "Lead already converted" });
      return;
    }

    if (!lead.system) {
      lead.system = { leadStatus: LeadStatus.Converted };
    } else {
      lead.system.leadStatus = LeadStatus.Converted;
    }
    await lead.save();

    if (lead.system?.assignedAgent) {
      await createNotification({
        recipient: lead.system.assignedAgent,
        type: NotificationType.StatusUpdate,
        title: "Lead Converted",
        message: `Lead ${lead.identity?.fullName} has been converted`,
        relatedEntity: RelatedEntity.Lead,
        relatedEntityId: lead._id,
        isRead: false,
      });
    }

    res
      .status(200)
      .json({ message: "Lead converted successfully", data: lead });
  } catch (error) {
    console.error("Convert lead error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
