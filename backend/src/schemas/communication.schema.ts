import { z } from "zod";
import mongoose from "mongoose";
import {
  CommunicationChannel,
  CommunicationDirection,
  CommunicationStatus,
  CommunicationEntityType,
} from "../models/Communication.js";
import {
  ActivityType,
  ActivityChannel,
  ActivityEntityType,
} from "../models/Activity.js";

/**
 * Base contact schema (from/to)
 */
const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

/**
 * Attachment schema
 */
const attachmentSchema = z.object({
  file_name: z.string().min(1),
  file_url: z.string().url(),
  file_type: z.string(),
});

/**
 * Schema for creating a communication
 */
export const createCommunicationSchema = z.object({
  channel: z.nativeEnum(CommunicationChannel),
  direction: z.nativeEnum(CommunicationDirection),
  subject: z.string().optional(),
  message: z.string().min(1, "Message is required"),
  status: z.nativeEnum(CommunicationStatus).default(CommunicationStatus.SENT),
  
  from: contactSchema,
  
  to: z.array(contactSchema).min(1, "At least one recipient is required"),
  
  related_to: z.object({
    type: z.nativeEnum(CommunicationEntityType),
    id: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
      message: "Invalid entity ID format",
    }),
  }),
  
  attachments: z.array(attachmentSchema).optional(),
});

/**
 * Schema for updating a communication
 */
export const updateCommunicationSchema = createCommunicationSchema.partial();

/**
 * Schema for querying communications
 */
export const communicationQuerySchema = z.object({
  channel: z.nativeEnum(CommunicationChannel).optional(),
  direction: z.nativeEnum(CommunicationDirection).optional(),
  status: z.nativeEnum(CommunicationStatus).optional(),
  
  entityType: z.nativeEnum(CommunicationEntityType).optional(),
  entityId: z.string().optional(),
  
  createdBy: z.string().optional(),
  
  skip: z.union([z.number(), z.string().transform(Number)]).default(0),
  limit: z.union([z.number(), z.string().transform(Number)]).default(20),
  
  search: z.string().optional(),
});

/**
 * Schema for creating an activity
 */
export const createActivitySchema = z.object({
  activity_type: z.nativeEnum(ActivityType),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  channel: z.nativeEnum(ActivityChannel),
  
  related_to: z.object({
    type: z.nativeEnum(ActivityEntityType),
    id: z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), {
      message: "Invalid entity ID format",
    }),
  }),
  
  communication_id: z.string().optional(),
  assigned_to: z.string().optional(),
  
  meta: z.record(z.any()).optional(),
});

/**
 * Schema for querying activities
 */
export const activityQuerySchema = z.object({
  activity_type: z.nativeEnum(ActivityType).optional(),
  channel: z.nativeEnum(ActivityChannel).optional(),
  
  entityType: z.nativeEnum(ActivityEntityType).optional(),
  entityId: z.string().optional(),
  
  performedBy: z.string().optional(),
  assignedTo: z.string().optional(),
  
  skip: z.union([z.number(), z.string().transform(Number)]).default(0),
  limit: z.union([z.number(), z.string().transform(Number)]).default(20),
});

/**
 * Type exports for TypeScript
 */
export type CreateCommunicationInput = z.infer<typeof createCommunicationSchema>;
export type UpdateCommunicationInput = z.infer<typeof updateCommunicationSchema>;
export type CommunicationQueryParams = z.infer<typeof communicationQuerySchema>;

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type ActivityQueryParams = z.infer<typeof activityQuerySchema>;
