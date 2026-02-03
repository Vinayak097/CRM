import mongoose, { Document, Schema } from "mongoose";

/**
 * Channel types for communication
 */
export enum CommunicationChannel {
  EMAIL = "email",
  WHATSAPP = "whatsapp",
  CALL = "call",
  SMS = "sms",
}

/**
 * Communication direction
 */
export enum CommunicationDirection {
  INBOUND = "inbound",
  OUTBOUND = "outbound",
}

/**
 * Communication status
 */
export enum CommunicationStatus {
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
  FAILED = "failed",
}

/**
 * Entity types that communications can relate to
 */
export enum CommunicationEntityType {
  LEAD = "lead",
  CUSTOMER = "customer",
  DEAL = "deal",
  PROPERTY = "property",
}

/**
 * Communication document interface
 */
export interface ICommunication extends Document {
  channel: CommunicationChannel;
  direction: CommunicationDirection;
  subject?: string;
  message: string;
  status: CommunicationStatus;
  
  from: {
    name: string;
    email?: string;
    phone?: string;
  };
  
  to: Array<{
    name: string;
    email?: string;
    phone?: string;
  }>;
  
  related_to: {
    type: CommunicationEntityType;
    id: mongoose.Types.ObjectId;
  };
  
  attachments?: Array<{
    file_name: string;
    file_url: string;
    file_type: string;
  }>;
  
  created_by: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

/**
 * Communication Schema
 */
const communicationSchema = new Schema<ICommunication>(
  {
    channel: {
      type: String,
      enum: Object.values(CommunicationChannel),
      required: true,
      index: true,
    },
    
    direction: {
      type: String,
      enum: Object.values(CommunicationDirection),
      required: true,
      index: true,
    },
    
    subject: {
      type: String,
      trim: true,
    },
    
    message: {
      type: String,
      required: true,
      trim: true,
    },
    
    status: {
      type: String,
      enum: Object.values(CommunicationStatus),
      default: CommunicationStatus.SENT,
      index: true,
    },
    
    from: {
      name: {
        type: String,
        required: true,
      },
      email: String,
      phone: String,
    },
    
    to: [
      {
        name: {
          type: String,
          required: true,
        },
        email: String,
        phone: String,
      },
    ],
    
    related_to: {
      type: {
        type: String,
        enum: Object.values(CommunicationEntityType),
        required: true,
      },
      id: {
        type: Schema.Types.ObjectId,
        required: true,
      },
    },
    
    attachments: [
      {
        file_name: String,
        file_url: String,
        file_type: String,
      },
    ],
    
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    
    created_at: {
      type: Date,
      default: Date.now,
      index: true,
    },
    
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "communications",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Compound indexes for common queries
communicationSchema.index({ "related_to.type": 1, "related_to.id": 1 });
communicationSchema.index({ created_by: 1, created_at: -1 });
communicationSchema.index({ channel: 1, direction: 1, created_at: -1 });

export default mongoose.model<ICommunication>(
  "Communication",
  communicationSchema
);
