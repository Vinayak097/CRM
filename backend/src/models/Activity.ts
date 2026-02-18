import mongoose, { Document, Schema } from "mongoose";

/**
 * Activity types for timeline tracking
 */
export enum ActivityType {
  EMAIL_SENT = "email_sent",
  EMAIL_RECEIVED = "email_received",
  WHATSAPP_SENT = "whatsapp_sent",
  WHATSAPP_RECEIVED = "whatsapp_received",
  CALL_LOGGED = "call_logged",
  CALL_RECEIVED = "call_received",
  SITE_VISIT = "site_visit",
  NOTE_ADDED = "note_added",
  TASK_CREATED = "task_created",
  STATUS_CHANGED = "status_changed",
  MEETING_SCHEDULED = "meeting_scheduled",
}

/**
 * Channels for activity
 */
export enum ActivityChannel {
  EMAIL = "email",
  WHATSAPP = "whatsapp",
  CALL = "call",
  SMS = "sms",
  SYSTEM = "system",
}

/**
 * Entity types for activity
 */
export enum ActivityEntityType {
  LEAD = "lead",
  CUSTOMER = "customer",
  DEAL = "deal",
  PROPERTY = "property",
}

/**
 * Activity document interface
 */
export interface IActivity extends Document {
  activity_type: ActivityType;
  title: string;
  description?: string;
  channel: ActivityChannel;
  
  related_to: {
    type: ActivityEntityType;
    id: mongoose.Types.ObjectId;
  };
  
  communication_id?: mongoose.Types.ObjectId;
  performed_by: mongoose.Types.ObjectId;
  assigned_to?: mongoose.Types.ObjectId;
  
  meta?: {
    call_duration?: number;
    meeting_date?: Date;
    status?: string;
    [key: string]: any;
  };
  
  created_at: Date;
}

/**
 * Activity Schema
 */
const activitySchema = new Schema<IActivity>(
  {
    activity_type: {
      type: String,
      enum: Object.values(ActivityType),
      required: true,
      index: true,
    },
    
    title: {
      type: String,
      required: true,
    },
    
    description: String,
    
    channel: {
      type: String,
      enum: Object.values(ActivityChannel),
      required: true,
    },
    
    related_to: {
      type: {
        type: String,
        enum: Object.values(ActivityEntityType),
        required: true,
      },
      id: {
        type: Schema.Types.ObjectId,
        required: true,
      },
    },
    
    communication_id: {
      type: Schema.Types.ObjectId,
      ref: "Communication",
    },
    
    performed_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    
    assigned_to: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    
    meta: Schema.Types.Mixed,
    
    created_at: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    collection: "activities",
    timestamps: false,
    toJSON: {
      transform: function(doc, ret) {
        if (ret.created_at) ret.created_at = ret.created_at?.toISOString?.() || ret.created_at;
        return ret;
      }
    }
  }
);

// Compound indexes for common queries
activitySchema.index({ "related_to.type": 1, "related_to.id": 1, created_at: -1 });
activitySchema.index({ performed_by: 1, created_at: -1 });
activitySchema.index({ activity_type: 1, created_at: -1 });

export default mongoose.model<IActivity>("Activity", activitySchema);
