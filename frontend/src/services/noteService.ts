import api from "./api";

export type NoteVisibility = "private" | "team" | "public";
export type NoteEntityType = "lead" | "customer" | "deal" | "property";

export interface Note {
  _id: string;
  content: string;
  entity_type: NoteEntityType;
  entity_id: string;
  created_by: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  visibility: NoteVisibility;
  is_pinned: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateNoteInput {
  content: string;
  entity_type: NoteEntityType;
  entity_id: string;
  visibility?: NoteVisibility;
  is_pinned?: boolean;
  tags?: string[];
}

export interface UpdateNoteInput {
  content?: string;
  visibility?: NoteVisibility;
  is_pinned?: boolean;
  tags?: string[];
}

export const noteService = {
  createNote: async (data: CreateNoteInput): Promise<Note> => {
    const response = await api.post<{ success: boolean; data: Note }>(
      "/notes",
      data
    );
    return response.data.data;
  },

  getEntityNotes: async (
    entityType: NoteEntityType,
    entityId: string,
    limit = 50
  ): Promise<Note[]> => {
    const response = await api.get<{ success: boolean; data: Note[] }>(
      `/notes/entity/${entityType}/${entityId}`,
      { params: { limit } }
    );
    return response.data.data;
  },

  updateNote: async (noteId: string, data: UpdateNoteInput): Promise<Note> => {
    const response = await api.put<{ success: boolean; data: Note }>(
      `/notes/${noteId}`,
      data
    );
    return response.data.data;
  },

  deleteNote: async (noteId: string): Promise<void> => {
    await api.delete(`/notes/${noteId}`);
  },

  togglePin: async (noteId: string): Promise<Note> => {
    const response = await api.patch<{ success: boolean; data: Note }>(
      `/notes/${noteId}/pin`
    );
    return response.data.data;
  },
};

export default noteService;
