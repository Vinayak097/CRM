import Activity, { IActivity } from "../models/Activity.js";
import type { CreateActivityInput, ActivityQueryParams } from "../schemas/communication.schema.js";
import mongoose from "mongoose";

/**
 * Activity Service
 * Handles timeline/activity-related operations
 */
class ActivityService {
  /**
   * Create a new activity
   */
  async createActivity(
    data: CreateActivityInput,
    performedBy: string
  ): Promise<IActivity> {
    const activity = new Activity({
      ...data,
      performed_by: new mongoose.Types.ObjectId(performedBy),
      assigned_to: data.assigned_to
        ? new mongoose.Types.ObjectId(data.assigned_to)
        : undefined,
      communication_id: data.communication_id
        ? new mongoose.Types.ObjectId(data.communication_id)
        : undefined,
      related_to: {
        type: data.related_to.type,
        id: new mongoose.Types.ObjectId(data.related_to.id),
      },
    });

    return activity.save();
  }

  /**
   * Get activities with filtering and pagination
   */
  async getActivities(
    params: ActivityQueryParams
  ): Promise<{
    activities: IActivity[];
    total: number;
    skip: number;
    limit: number;
  }> {
    const { skip = 0, limit = 20, ...filters } = params;

    // Build query
    const query: any = {};

    if (filters.activity_type) query.activity_type = filters.activity_type;
    if (filters.channel) query.channel = filters.channel;

    if (filters.entityType && filters.entityId) {
      query["related_to.type"] = filters.entityType;
      query["related_to.id"] = new mongoose.Types.ObjectId(filters.entityId);
    }

    if (filters.performedBy) {
      query.performed_by = new mongoose.Types.ObjectId(filters.performedBy);
    }

    if (filters.assignedTo) {
      query.assigned_to = new mongoose.Types.ObjectId(filters.assignedTo);
    }

    const total = await Activity.countDocuments(query);
    const activities = await Activity.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .populate("performed_by", "name email")
      .populate("assigned_to", "name email")
      .lean();

    return {
      activities,
      total,
      skip,
      limit,
    };
  }

  /**
   * Get activities for a specific entity (Lead, Customer, Deal, Property)
   * Returns a timeline view
   */
  async getEntityTimeline(
    entityType: string,
    entityId: string,
    limit: number = 50
  ): Promise<IActivity[]> {
    return Activity.find({
      "related_to.type": entityType,
      "related_to.id": new mongoose.Types.ObjectId(entityId),
    })
      .sort({ created_at: -1 })
      .limit(limit)
      .populate("performed_by", "name email avatar")
      .populate("assigned_to", "name email avatar")
      .lean();
  }

  /**
   * Get a single activity by ID
   */
  async getActivityById(id: string): Promise<IActivity | null> {
    return Activity.findById(id)
      .populate("performed_by", "name email avatar")
      .populate("assigned_to", "name email avatar");
  }

  /**
   * Get activities by communication ID
   */
  async getActivitiesByCommunication(
    communicationId: string
  ): Promise<IActivity[]> {
    return Activity.find({
      communication_id: new mongoose.Types.ObjectId(communicationId),
    })
      .sort({ created_at: -1 })
      .populate("performed_by", "name email avatar")
      .lean();
  }

  /**
   * Get recent activities for an agent
   */
  async getAgentActivities(
    agentId: string,
    limit: number = 20
  ): Promise<IActivity[]> {
    return Activity.find({
      performed_by: new mongoose.Types.ObjectId(agentId),
    })
      .sort({ created_at: -1 })
      .limit(limit)
      .populate("assigned_to", "name email avatar")
      .lean();
  }

  /**
   * Get activity statistics for a user
   */
  async getActivityStatistics(userId: string): Promise<{
    total: number;
    byType: Record<string, number>;
    byChannel: Record<string, number>;
  }> {
    const userId_obj = new mongoose.Types.ObjectId(userId);

    const total = await Activity.countDocuments({
      performed_by: userId_obj,
    });

    const byType = await Activity.aggregate([
      { $match: { performed_by: userId_obj } },
      { $group: { _id: "$activity_type", count: { $sum: 1 } } },
    ]);

    const byChannel = await Activity.aggregate([
      { $match: { performed_by: userId_obj } },
      { $group: { _id: "$channel", count: { $sum: 1 } } },
    ]);

    return {
      total,
      byType: Object.fromEntries(byType.map((item) => [item._id, item.count])),
      byChannel: Object.fromEntries(
        byChannel.map((item) => [item._id, item.count])
      ),
    };
  }

  /**
   * Delete an activity
   */
  async deleteActivity(id: string): Promise<boolean> {
    const result = await Activity.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
}

export default new ActivityService();
