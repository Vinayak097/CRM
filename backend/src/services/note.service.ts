import Note, { INote, NoteVisibility, NoteEntityType } from "../models/Note.js";
import Activity, { ActivityType, ActivityChannel, ActivityEntityType } from "../models/Activity.js";
import mongoose from "mongoose";

export interface CreateNoteInput {
  content: string;
  entity_type: NoteEntityType;
  entity_id: string;
  visibility?: NoteVisibility;
  is_pinned?: boolean;
  tags?: string[];
}

export interface NoteQueryParams {
  entity_type?: NoteEntityType;
  entity_id?: string;
  visibility?: NoteVisibility;
  skip?: number;
  limit?: number;
}

class NoteService {
  /**
   * Create a new note
   */
  async createNote(data: CreateNoteInput, userId: string): Promise<INote> {
    const note = new Note({
      content: data.content,
      entity_type: data.entity_type,
      entity_id: new mongoose.Types.ObjectId(data.entity_id),
      created_by: new mongoose.Types.ObjectId(userId),
      visibility: data.visibility || NoteVisibility.PRIVATE,
      is_pinned: data.is_pinned || false,
      tags: data.tags || [],
    });

    const saved = await note.save();

    // Create activity entry for the note
    try {
      const activity = new Activity({
        activity_type: ActivityType.NOTE_ADDED,
        title: "Note added",
        description: data.content.substring(0, 200) + (data.content.length > 200 ? "..." : ""),
        channel: ActivityChannel.SYSTEM,
        related_to: {
          type: data.entity_type as unknown as ActivityEntityType,
          id: new mongoose.Types.ObjectId(data.entity_id),
        },
        performed_by: new mongoose.Types.ObjectId(userId),
      });
      await activity.save();
    } catch (err) {
      console.error("Failed to create activity for note:", err);
    }

    return saved.populate("created_by", "name email role");
  }

  /**
   * Get notes for an entity with role-based filtering
   */
  async getEntityNotes(
    entityType: NoteEntityType,
    entityId: string,
    userId: string,
    userRole: string,
    limit: number = 50
  ): Promise<INote[]> {
    const query: any = {
      entity_type: entityType,
      entity_id: new mongoose.Types.ObjectId(entityId),
    };

    // Role-based visibility filtering
    if (userRole === "admin") {
      // Admin sees all notes
    } else {
      // Non-admin: see own notes + team/public notes
      query.$or = [
        { created_by: new mongoose.Types.ObjectId(userId) },
        { visibility: { $in: [NoteVisibility.TEAM, NoteVisibility.PUBLIC] } },
      ];
    }

    return Note.find(query)
      .sort({ is_pinned: -1, created_at: -1 })
      .limit(limit)
      .populate("created_by", "name email role")
      .lean();
  }

  /**
   * Update a note (only creator or admin can update)
   */
  async updateNote(
    noteId: string,
    userId: string,
    userRole: string,
    updates: Partial<Pick<INote, "content" | "visibility" | "is_pinned" | "tags">>
  ): Promise<INote | null> {
    const note = await Note.findById(noteId);
    if (!note) return null;

    // Check permission
    const isOwner = note.created_by.toString() === userId;
    const isAdmin = userRole === "admin";
    if (!isOwner && !isAdmin) {
      throw new Error("Not authorized to update this note");
    }

    Object.assign(note, updates);
    const updated = await note.save();
    return updated.populate("created_by", "name email role");
  }

  /**
   * Delete a note (only creator or admin can delete)
   */
  async deleteNote(noteId: string, userId: string, userRole: string): Promise<boolean> {
    const note = await Note.findById(noteId);
    if (!note) return false;

    // Check permission
    const isOwner = note.created_by.toString() === userId;
    const isAdmin = userRole === "admin";
    if (!isOwner && !isAdmin) {
      throw new Error("Not authorized to delete this note");
    }

    await Note.deleteOne({ _id: noteId });
    return true;
  }

  /**
   * Toggle pin status
   */
  async togglePin(noteId: string, userId: string, userRole: string): Promise<INote | null> {
    const note = await Note.findById(noteId);
    if (!note) return null;

    const isOwner = note.created_by.toString() === userId;
    const isAdmin = userRole === "admin";
    if (!isOwner && !isAdmin) {
      throw new Error("Not authorized to pin this note");
    }

    note.is_pinned = !note.is_pinned;
    const updated = await note.save();
    return updated.populate("created_by", "name email role");
  }

  /**
   * Get user's notes across all entities
   */
  async getUserNotes(userId: string, limit: number = 50): Promise<INote[]> {
    return Note.find({ created_by: new mongoose.Types.ObjectId(userId) })
      .sort({ created_at: -1 })
      .limit(limit)
      .populate("created_by", "name email role")
      .lean();
  }
}

export default new NoteService();
