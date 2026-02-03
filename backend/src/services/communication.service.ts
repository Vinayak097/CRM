import Communication, { ICommunication, CommunicationStatus } from "../models/Communication.js";
import Activity, { ActivityType, ActivityChannel } from "../models/Activity.js";
import type { CreateCommunicationInput, UpdateCommunicationInput, CommunicationQueryParams } from "../schemas/communication.schema.js";
import mongoose from "mongoose";

/**
 * Communication Service
 * Handles all communication-related operations (CRUD, queries, etc.)
 */
class CommunicationService {
  /**
   * Create a new communication
   */
  async createCommunication(
    data: CreateCommunicationInput,
    createdBy: string
  ): Promise<ICommunication> {
    const communication = new Communication({
      ...data,
      created_by: new mongoose.Types.ObjectId(createdBy),
    });

    const saved = await communication.save();

    // Create an activity entry for this communication
    const activityType =
      data.direction === "outbound"
        ? data.channel === "email"
          ? ActivityType.EMAIL_SENT
          : ActivityType.WHATSAPP_SENT
        : data.channel === "email"
          ? ActivityType.EMAIL_RECEIVED
          : ActivityType.WHATSAPP_RECEIVED;

    await Activity.create({
      activity_type: activityType,
      title: `${data.channel.charAt(0).toUpperCase() + data.channel.slice(1)} ${data.direction === "outbound" ? "sent" : "received"}`,
      description: data.subject || data.message.substring(0, 100),
      channel:
        data.channel === "call"
          ? ActivityChannel.CALL
          : data.channel === "whatsapp"
            ? ActivityChannel.WHATSAPP
            : ActivityChannel.EMAIL,
      related_to: {
        type: data.related_to.type,
        id: new mongoose.Types.ObjectId(data.related_to.id),
      },
      communication_id: saved._id,
      performed_by: new mongoose.Types.ObjectId(createdBy),
      meta: {
        from: data.from,
        to: data.to,
        subject: data.subject,
      },
    });

    return saved;
  }

  /**
   * Get communications with filtering and pagination
   */
  async getCommunications(
    params: CommunicationQueryParams
  ): Promise<{
    communications: ICommunication[];
    total: number;
    skip: number;
    limit: number;
  }> {
    const { skip = 0, limit = 20, search, ...filters } = params;

    // Build query
    const query: any = {};

    if (filters.channel) query.channel = filters.channel;
    if (filters.direction) query.direction = filters.direction;
    if (filters.status) query.status = filters.status;

    if (filters.entityType && filters.entityId) {
      query["related_to.type"] = filters.entityType;
      query["related_to.id"] = new mongoose.Types.ObjectId(filters.entityId);
    }

    if (filters.createdBy) {
      query.created_by = new mongoose.Types.ObjectId(filters.createdBy);
    }

    // Text search if provided
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
        { "from.name": { $regex: search, $options: "i" } },
        { "to.name": { $regex: search, $options: "i" } },
      ];
    }

    const total = await Communication.countDocuments(query);
    const communications = await Communication.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      communications,
      total,
      skip,
      limit,
    };
  }

  /**
   * Get a single communication by ID
   */
  async getCommunicationById(id: string): Promise<ICommunication | null> {
    return Communication.findById(id);
  }

  /**
   * Update a communication
   */
  async updateCommunication(
    id: string,
    data: UpdateCommunicationInput
  ): Promise<ICommunication | null> {
    const communication = await Communication.findByIdAndUpdate(
      id,
      {
        ...data,
        updated_at: new Date(),
      },
      { new: true }
    );

    return communication;
  }

  /**
   * Update communication status
   */
  async updateStatus(
    id: string,
    status: CommunicationStatus
  ): Promise<ICommunication | null> {
    return Communication.findByIdAndUpdate(
      id,
      {
        status,
        updated_at: new Date(),
      },
      { new: true }
    );
  }

  /**
   * Delete a communication
   */
  async deleteCommunication(id: string): Promise<boolean> {
    const result = await Communication.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  /**
   * Get communications for a specific entity (Lead, Customer, Deal, Property)
   */
  async getCommunicationsByEntity(
    entityType: string,
    entityId: string,
    limit: number = 50
  ): Promise<ICommunication[]> {
    return Communication.find({
      "related_to.type": entityType,
      "related_to.id": new mongoose.Types.ObjectId(entityId),
    })
      .sort({ created_at: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Get recent communications for agent dashboard
   */
  async getRecentCommunications(
    createdBy: string,
    limit: number = 10
  ): Promise<ICommunication[]> {
    return Communication.find({
      created_by: new mongoose.Types.ObjectId(createdBy),
    })
      .sort({ created_at: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Search communications
   */
  async searchCommunications(
    searchTerm: string,
    limit: number = 20
  ): Promise<ICommunication[]> {
    return Communication.find(
      {
        $or: [
          { subject: { $regex: searchTerm, $options: "i" } },
          { message: { $regex: searchTerm, $options: "i" } },
          { "from.name": { $regex: searchTerm, $options: "i" } },
          { "to.name": { $regex: searchTerm, $options: "i" } },
        ],
      },
      null,
      { limit }
    ).lean();
  }

  /**
   * Get communication statistics
   */
  async getStatistics(createdBy: string): Promise<{
    total: number;
    byChannel: Record<string, number>;
    byDirection: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const createdById = new mongoose.Types.ObjectId(createdBy);

    const total = await Communication.countDocuments({
      created_by: createdById,
    });

    const byChannel = await Communication.aggregate([
      { $match: { created_by: createdById } },
      { $group: { _id: "$channel", count: { $sum: 1 } } },
    ]);

    const byDirection = await Communication.aggregate([
      { $match: { created_by: createdById } },
      { $group: { _id: "$direction", count: { $sum: 1 } } },
    ]);

    const byStatus = await Communication.aggregate([
      { $match: { created_by: createdById } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    return {
      total,
      byChannel: Object.fromEntries(
        byChannel.map((item) => [item._id, item.count])
      ),
      byDirection: Object.fromEntries(
        byDirection.map((item) => [item._id, item.count])
      ),
      byStatus: Object.fromEntries(byStatus.map((item) => [item._id, item.count])),
    };
  }
}

export default new CommunicationService();
