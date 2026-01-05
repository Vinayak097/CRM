import type { Response } from "express";
import Lead from "../models/Lead.js";
import { Role } from "../models/User.js";
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
  const { identity, profile, demographics, buyerProfile, assetPreferences, purchaseReadiness, ownershipPreferences, locationProfile, lifestylePreferences, unitPreferences, notes, system } = req.body;

  if (!identity?.fullName || !identity?.phone) {
    res.status(400).json({ message: "identity.fullName and identity.phone are required" });
    return;
  }

  const agentId = system?.assignedAgent || getAgentIdForLead(req.user);

  try {
    const phoneLead = await Lead.findOne({ "identity.phone": identity.phone });
    if (phoneLead) {
      res.status(409).json({ message: "Lead with this phone number already exists" });
      return;
    }

    const lead = await Lead.create({
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
      system: {
        ...system,
        assignedAgent: agentId,
        leadStatus: system?.leadStatus || "New",
      },
    });

    if (agentId) {
      await createNotification({
        isRead: false,
        type: NotificationType.LeadAssigned,
        message: NotificationMessage.LeadAssigned,
        recipient: agentId,
        title: NotificationType.LeadAssigned,
      });
    }

    res.status(201).json({ message: "Lead created", data: lead });
  } catch (e) {
    console.error("Error in create lead:", e);
    res.status(500).json({ message: "Internal server error" });
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
      lead.system = { assignedAgent: agentId, leadStatus: "New" };
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

    if (lead.system?.leadStatus === "Converted") {
      res.status(400).json({ message: "Lead already converted" });
      return;
    }

    if (!lead.system) {
      lead.system = { leadStatus: "Converted" };
    } else {
      lead.system.leadStatus = "Converted";
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
