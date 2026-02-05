import mongoose, { Document, Schema } from "mongoose";

export enum NoteVisibility {
  PRIVATE = "private",      // Only creator can see
  TEAM = "team",            // Team members can see
  PUBLIC = "public",        // All roles can see
}

export enum NoteEntityType {
  LEAD = "lead",
  CUSTOMER = "customer",
  DEAL = "deal",
  PROPERTY = "property",
}

export interface INote extends Document {
  content: string;
  entity_type: NoteEntityType;
  entity_id: mongoose.Types.ObjectId;
  created_by: mongoose.Types.ObjectId;
  visibility: NoteVisibility;
  is_pinned: boolean;
  tags?: string[];
  created_at: Date;
  updated_at: Date;
}

const noteSchema = new Schema<INote>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },

    entity_type: {
      type: String,
      enum: Object.values(NoteEntityType),
      required: true,
      index: true,
    },

    entity_id: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    visibility: {
      type: String,
      enum: Object.values(NoteVisibility),
      default: NoteVisibility.PRIVATE,
    },

    is_pinned: {
      type: Boolean,
      default: false,
    },

    tags: [{ type: String, trim: true }],
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "notes",
  }
);

// Compound indexes for common queries
noteSchema.index({ entity_type: 1, entity_id: 1, created_at: -1 });
noteSchema.index({ created_by: 1, created_at: -1 });
noteSchema.index({ entity_type: 1, entity_id: 1, visibility: 1 });

export default mongoose.model<INote>("Note", noteSchema);
