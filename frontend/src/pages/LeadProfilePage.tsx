import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Phone, Mail, Calendar, MapPin, UserCheck, UserPlus, Clock,
  Edit2, CheckCircle2, Home, Users, Target, MessageSquare,
  Building, Trash2, ListTodo, FileText, Send, Activity, Pin, Globe, Lock, UsersIcon,
} from "lucide-react";
import { leadService } from "../services/leadService";
import { userService, type User } from "../services/userService";
import { taskService, type Task } from "../services/taskService";
import { communicationService, type Activity as ActivityType } from "../services/communicationService";
import { noteService, type Note, type NoteVisibility } from "../services/noteService";
import CreateTaskModal from "../components/tasks/CreateTaskModal";
import TaskList from "../components/tasks/TaskList";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Lead, type LeadStatus } from "@/types";
import { useUser } from "../hooks/useAuth";

const LeadProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAssignManagerModal, setShowAssignManagerModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [agents, setAgents] = useState<User[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedManager, setSelectedManager] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>("New");
  const [deleting, setDeleting] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Notes state
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [noteVisibility, setNoteVisibility] = useState<NoteVisibility>("private");
  const [addingNote, setAddingNote] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);

  // Activities state
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  const statuses: LeadStatus[] = ["New", "Contacted", "Qualified", "Shortlisted", "Site Visit", "Negotiation", "Booked", "Lost", "Converted"];

  useEffect(() => {
    const fetchLead = async () => {
      if (!id) return;
      try {
        const response = await leadService.getLeadById(id);
        setLead(response.data);
        setSelectedStatus(response.data.system?.leadStatus || "New");
      } catch (error) {
        console.error("Failed to fetch lead:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, [id]);

  const fetchTasks = async () => {
    if (!id) return;
    setTasksLoading(true);
    try {
      const response = await taskService.getTasks({
        entityType: "LEAD",
        entityId: id,
        limit: 50,
      });
      setTasks(response.data || []);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchActivities();
    fetchNotes();
  }, [id]);

  const fetchActivities = async () => {
    if (!id) return;
    setActivitiesLoading(true);
    try {
      const response = await communicationService.getEntityTimeline("lead", id, 100);
      const allActivities = response.data?.data || [];
      setActivities(allActivities);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const fetchNotes = async () => {
    if (!id) return;
    setNotesLoading(true);
    try {
      const notesData = await noteService.getEntityNotes("lead", id);
      setNotes(notesData);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      setNotesLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await userService.getUsers(1, 100);
      setAgents(response.data.filter((u) => u.role === "sales_agent"));
    } catch { console.error("Failed to fetch agents"); }
  };

  const fetchManagers = async () => {
    try {
      const response = await userService.getUsers(1, 100);
      setManagers(response.data.filter((u) => u.role === "sales_manager"));
    } catch { console.error("Failed to fetch managers"); }
  };

  const handleDelete = async () => {
    if (!id || !confirm("Are you sure you want to delete this lead?")) return;
    setDeleting(true);
    try {
      await leadService.deleteLead(id);
      navigate("/leads");
    } catch {
      alert("Failed to delete lead");
    } finally {
      setDeleting(false);
    }
  };

  const handleAssign = async () => {
    if (!id || !selectedAgent) return;
    setUpdating(true);
    try {
      const response = await leadService.assignAgent(id, selectedAgent);
      setLead(response.data);
      setShowAssignModal(false);
    } catch {
      alert("Failed to assign agent");
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignManager = async () => {
    if (!id || !selectedManager) return;
    setUpdating(true);
    try {
      // Use general updateLead for manager assignment
      const response = await leadService.updateLead(id, {
        system: {
          managerId: selectedManager
        }
      });
      setLead(response.data);
      setShowAssignManagerModal(false);
    } catch {
      alert("Failed to assign manager");
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async () => {
    if (!id) return;
    setUpdating(true);
    try {
      await leadService.updateStatus(id, selectedStatus);
      setLead((prev) => prev ? { ...prev, system: { ...prev.system, leadStatus: selectedStatus } } : null);
      setShowStatusModal(false);
    } catch {
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !id) return;
    setAddingNote(true);
    try {
      await noteService.createNote({
        content: newNote,
        entity_type: "lead",
        entity_id: id,
        visibility: noteVisibility,
      });
      setNewNote("");
      setNoteVisibility("private");
      fetchNotes();
    } catch (error) {
      console.error("Failed to add note:", error);
      alert("Failed to add note");
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Delete this note?")) return;
    try {
      await noteService.deleteNote(noteId);
      fetchNotes();
    } catch (error) {
      console.error("Failed to delete note:", error);
      alert("Failed to delete note");
    }
  };

  const handleTogglePin = async (noteId: string) => {
    try {
      await noteService.togglePin(noteId);
      fetchNotes();
    } catch (error) {
      console.error("Failed to toggle pin:", error);
    }
  };

  const getVisibilityIcon = (visibility: NoteVisibility) => {
    switch (visibility) {
      case "private": return <Lock className="h-3 w-3" />;
      case "team": return <UsersIcon className="h-3 w-3" />;
      case "public": return <Globe className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: LeadStatus): string => {
    const colors: Record<string, string> = {
      "New": "bg-blue-500/20 text-blue-400 border-blue-500/30",
      "Contacted": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      "Qualified": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      "Shortlisted": "bg-orange-500/20 text-orange-400 border-orange-500/30",
      "Site Visit": "bg-purple-500/20 text-purple-400 border-purple-500/30",
      "Negotiation": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      "Booked": "bg-pink-500/20 text-pink-400 border-pink-500/30",
      "Lost": "bg-red-500/20 text-red-400 border-red-500/30",
      "Converted": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-gray-400">Loading...</div>;
  if (!lead) return <div className="min-h-screen bg-background flex items-center justify-center text-gray-400">Lead not found</div>;

  const fullName = [lead.identity?.firstName, lead.identity?.lastName].filter(Boolean).join(" ") || "Unknown";

  const InfoRow = ({ label, value }: { label: string; value?: string | number | null }) => {
    if (!value) return null;
    return (
      <div className="flex justify-between py-2 border-b border-gray-800 last:border-0">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-sm text-right max-w-[60%]">{value}</span>
      </div>
    );
  };

  const TagList = ({ label, items }: { label: string; items?: string[] }) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="py-2">
        <div className="text-sm text-gray-400 mb-2">{label}</div>
        <div className="flex flex-wrap gap-1">
          {items.map((item, i) => (
            <span key={i} className="px-2 py-1 bg-gray-800 rounded text-xs">{item}</span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <button onClick={() => navigate("/leads")} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4" /><span className="text-sm">Back to Leads</span>
          </button>

          {/* Lead Header Card */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                {fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{fullName}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  {lead.identity?.phone && (
                    <span className="flex items-center gap-1 text-sm text-gray-400">
                      <Phone className="h-4 w-4" />{lead.identity.phone}
                    </span>
                  )}
                  {lead.identity?.email && (
                    <span className="flex items-center gap-1 text-sm text-gray-400">
                      <Mail className="h-4 w-4" />{lead.identity.email}
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.system?.leadStatus || "New")}`}>
                    {lead.system?.leadStatus || "New"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate(`/leads/${id}/edit`)}>
                <Edit2 className="h-4 w-4 mr-1" />Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setSelectedStatus(lead.system?.leadStatus || "New"); setShowStatusModal(true); }}>
                <Target className="h-4 w-4 mr-1" />Status
              </Button>
              {(user?.role === "admin" || user?.role === "sales_manager") && (
                <>
                  {user?.role === "admin" && (
                    <Button variant="outline" size="sm" onClick={() => { fetchManagers(); setShowAssignManagerModal(true); }}>
                      <UsersIcon className="h-4 w-4 mr-1" />Assign Manager
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => { fetchAgents(); setShowAssignModal(true); }}>
                    <UserPlus className="h-4 w-4 mr-1" />Assign Agent
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleting} className="text-red-400 hover:text-red-300">
                <Trash2 className="h-4 w-4 mr-1" />{deleting ? "..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-800 border border-gray-700 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700">
              <Users className="h-4 w-4 mr-2" />Overview
            </TabsTrigger>
            <TabsTrigger value="communication" className="data-[state=active]:bg-gray-700">
              <MessageSquare className="h-4 w-4 mr-2" />Communication
            </TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-gray-700">
              <FileText className="h-4 w-4 mr-2" />Notes
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-gray-700">
              <ListTodo className="h-4 w-4 mr-2" />Tasks ({tasks.length})
            </TabsTrigger>
            <TabsTrigger value="activities" className="data-[state=active]:bg-gray-700">
              <Activity className="h-4 w-4 mr-2" />Activities
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <InfoRow label="First Name" value={lead.identity?.firstName} />
                  <InfoRow label="Last Name" value={lead.identity?.lastName} />
                  <InfoRow label="Email" value={lead.identity?.email} />
                  <InfoRow label="Phone" value={lead.identity?.phone} />
                  <InfoRow label="Home Country" value={lead.identity?.homeCountry} />
                  <InfoRow label="Profession" value={lead.identity?.profession} />
                  <InfoRow label="Age" value={lead.identity?.ageYears} />
                  <InfoRow label="Lead Source" value={lead.identity?.leadSource} />
                </CardContent>
              </Card>

              {/* Assignment Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />Assignment Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <InfoRow
                    label="Sales Manager"
                    value={typeof lead.system?.managerId === 'object' ? (lead.system.managerId as any)?.name : lead.system?.managerId}
                  />
                  <InfoRow
                    label="Assigned Agent"
                    value={typeof lead.system?.assignedAgent === 'object' ? (lead.system.assignedAgent as any)?.name : lead.system?.assignedAgent || "Unassigned"}
                  />
                  <InfoRow label="Priority" value={lead.system?.priorityScore?.toString()} />
                </CardContent>
              </Card>

              {/* Buying Journey */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5" />Buying Journey
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <InfoRow label="Journey Stage" value={lead.identity?.buyingJourneyStage} />
                  <InfoRow label="Purchase Timeline" value={lead.identity?.purchaseTimeline} />
                  <InfoRow label="Exploration Duration" value={lead.identity?.explorationDuration} />
                  <TagList label="Property Role" items={lead.identity?.propertyRolePrimary} />
                  <TagList label="Search Triggers" items={lead.identity?.searchTrigger} />
                </CardContent>
              </Card>

              {/* Location Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />Location Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <InfoRow label="Country Focus" value={lead.location?.buyingCountryFocus} />
                  <TagList label="Target States" items={lead.location?.targetStatesRegions} />
                  <TagList label="Target Locations" items={lead.location?.targetLocations} />
                  <TagList label="Location Priorities" items={lead.location?.locationPriorities} />
                </CardContent>
              </Card>

              {/* Property Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Home className="h-5 w-5" />Property Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TagList label="Asset Type Interest" items={lead.property?.assetTypeInterest} />
                  <TagList label="Unit Configuration" items={lead.property?.unitConfiguration} />
                  <InfoRow label="Ownership Preference" value={lead.property?.ownershipStructurePreference} />
                  <InfoRow label="Possession Stage" value={lead.property?.possessionStagePreference} />
                  <InfoRow label="Funding Preference" value={lead.property?.fundingPreference} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Communication History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-400">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No communications yet</p>
                  <p className="text-sm mt-2">Start a conversation with this lead</p>
                  <div className="flex justify-center gap-3 mt-4">
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-2" />Send Email
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />WhatsApp
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-2" />Log Call
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add Note Form */}
                <div className="mb-6">
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note about this lead..."
                    rows={3}
                    className="bg-gray-800 border-gray-700 mb-2"
                  />
                  <div className="flex items-center gap-3">
                    <Button onClick={handleAddNote} disabled={addingNote || !newNote.trim()}>
                      <Send className="h-4 w-4 mr-2" />{addingNote ? "Adding..." : "Add Note"}
                    </Button>
                    <select
                      value={noteVisibility}
                      onChange={(e) => setNoteVisibility(e.target.value as NoteVisibility)}
                      className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-sm text-white"
                    >
                      <option value="private">🔒 Private (Only me)</option>
                      <option value="team">👥 Team (My team)</option>
                      <option value="public">🌐 Public (Everyone)</option>
                    </select>
                  </div>
                </div>

                {/* Notes List */}
                {notesLoading ? (
                  <div className="text-center py-8 text-gray-400">Loading notes...</div>
                ) : notes.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>No notes yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <div
                        key={note._id}
                        className={`bg-gray-800/50 rounded-lg p-4 border ${note.is_pinned ? "border-yellow-500/50" : "border-gray-700"}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {note.is_pinned && <Pin className="h-3 w-3 text-yellow-500" />}
                            <span className="text-sm font-medium text-blue-400">
                              {note.created_by?.name || note.created_by?.email || "Agent"}
                            </span>
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${note.visibility === "private" ? "bg-gray-700 text-gray-400" :
                              note.visibility === "team" ? "bg-blue-500/20 text-blue-400" :
                                "bg-green-500/20 text-green-400"
                              }`}>
                              {getVisibilityIcon(note.visibility)}
                              {note.visibility}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {new Date(note.created_at).toLocaleDateString()} {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <button
                              onClick={() => handleTogglePin(note._id)}
                              className={`p-1 rounded hover:bg-gray-700 ${note.is_pinned ? "text-yellow-500" : "text-gray-500"}`}
                              title={note.is_pinned ? "Unpin" : "Pin"}
                            >
                              <Pin className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note._id)}
                              className="p-1 rounded hover:bg-gray-700 text-red-400"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-300">{note.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Tasks</CardTitle>
                <Button size="sm" onClick={() => setShowTaskModal(true)} disabled={!user}>
                  <ListTodo className="h-4 w-4 mr-2" />New Task
                </Button>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="text-center py-8 text-gray-400">Loading tasks...</div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <ListTodo className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>No tasks yet</p>
                    <p className="text-sm mt-2">Create a task to follow up with this lead</p>
                  </div>
                ) : (
                  <TaskList tasks={tasks} entityType="LEAD" entityId={id!} onTasksChange={fetchTasks} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activitiesLoading ? (
                  <div className="text-center py-8 text-gray-400">Loading activities...</div>
                ) : activities.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Activity className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>No activities yet</p>
                    <p className="text-sm mt-2">Activities will appear here as you interact with this lead</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity._id} className="flex gap-4 border-l-2 border-gray-700 pl-4 py-2">
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">
                                {activity.title || activity.activity_type.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                              </p>
                              {activity.description && (
                                <p className="text-sm text-gray-400 mt-1">{activity.description}</p>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {new Date(activity.created_at).toLocaleDateString()} {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {activity.performed_by && (
                            <p className="text-xs text-gray-500 mt-1">
                              By {activity.performed_by.name || activity.performed_by.email}
                            </p>
                          )}
                          <span className={`inline-block mt-2 px-2 py-0.5 text-xs rounded ${activity.channel === "email" ? "bg-blue-500/20 text-blue-400" :
                            activity.channel === "whatsapp" ? "bg-green-500/20 text-green-400" :
                              activity.channel === "call" ? "bg-purple-500/20 text-purple-400" :
                                "bg-gray-500/20 text-gray-400"
                            }`}>
                            {activity.channel}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Assign Manager Modal */}
      {showAssignManagerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Assign Sales Manager</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedManager}
                onChange={(e) => setSelectedManager(e.target.value)}
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white mb-4"
              >
                <option value="">Select Manager</option>
                {managers.map((manager) => (
                  <option key={manager._id} value={manager._id}>{manager.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mb-4 italic">
                Note: Changing the manager will automatically clear the currently assigned agent.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setShowAssignManagerModal(false)}>Cancel</Button>
                <Button onClick={handleAssignManager} disabled={updating || !selectedManager}>
                  {updating ? "Assigning..." : "Assign Manager"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Assign Modal (Agent) */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Assign Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white mb-4"
              >
                <option value="">Select Agent</option>
                {agents.map((agent) => (
                  <option key={agent._id} value={agent._id}>{agent.name}</option>
                ))}
              </select>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setShowAssignModal(false)}>Cancel</Button>
                <Button onClick={handleAssign} disabled={updating || !selectedAgent}>
                  {updating ? "Assigning..." : "Assign"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as LeadStatus)}
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white mb-4"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setShowStatusModal(false)}>Cancel</Button>
                <Button onClick={handleStatusChange} disabled={updating}>
                  {updating ? "Updating..." : "Update"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && id && user && (
        <CreateTaskModal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          entityType="LEAD"
          entityId={id}
          agentId={lead.system?.assignedAgent?._id || user.id}
          onSuccess={() => {
            setShowTaskModal(false);
            fetchTasks();
          }}
        />
      )}
    </div>
  );
};

export default LeadProfilePage;
