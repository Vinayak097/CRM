import React, { useState, useEffect, useCallback } from "react";
import { Plus, Check, Clock, AlertTriangle, ChevronLeft, ChevronRight, Calendar, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import taskService, {
  type Task,
  type TaskStatus,
  type TaskType,
  type TaskPriority,
  type CreateTaskInput,
} from "@/services/taskService";
import { leadService } from "@/services/leadService";
import { type Lead } from "@/types";

const PAGE_SIZE = 10;

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<TaskStatus | "">("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Lead search state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadSearch, setLeadSearch] = useState("");
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateTaskInput>({
    type: "FOLLOW_UP",
    dueAt: new Date().toISOString().slice(0, 16),
    assignedAgentId: user.id || "",
    entityType: "LEAD",
    entityId: "",
    title: "",
    description: "",
    priority: "MEDIUM",
  });

  // Fetch leads for selection
  const searchLeads = async (search: string) => {
    setLoadingLeads(true);
    try {
      const response = await leadService.getLeads(1, 20, search);
      setLeads(response.leads);
    } catch (error) {
      console.error("Failed to search leads:", error);
    } finally {
      setLoadingLeads(false);
    }
  };

  // Debounced lead search
  useEffect(() => {
    if (showCreateModal) {
      const timer = setTimeout(() => {
        searchLeads(leadSearch);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [leadSearch, showCreateModal]);

  const [stats, setStats] = useState({ pending: 0, overdue: 0, completed: 0, total: 0 });
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const response = await taskService.getTaskStats();
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch task stats:", error);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        skip: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
      };
      if (filter) {
        params.status = filter;
      }
      const response = await taskService.getTasks(params);
      setTasks(response.data);
      setTotalPages(response.pagination.pages || 1);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [fetchTasks, fetchStats]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.entityId) {
      alert("Please fill in all required fields including selecting a lead");
      return;
    }

    setCreating(true);
    try {
      // Convert datetime-local format to ISO string
      const dueAtISO = new Date(formData.dueAt).toISOString();

      await taskService.createTask({
        ...formData,
        dueAt: dueAtISO,
      });
      setShowCreateModal(false);
      setFormData({
        type: "FOLLOW_UP",
        dueAt: new Date().toISOString().slice(0, 16),
        assignedAgentId: user.id || "",
        entityType: "LEAD",
        entityId: "",
        title: "",
        description: "",
        priority: "MEDIUM",
      });
      setSelectedLead(null);
      setLeadSearch("");
      fetchTasks();
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await taskService.updateTaskStatus(taskId, "COMPLETED");
      fetchTasks();
    } catch (error) {
      console.error("Failed to complete task:", error);
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "COMPLETED":
        return <Check className="h-5 w-5 text-green-500" />;
      case "OVERDUE":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "OVERDUE":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-500/20 text-red-400";
      case "MEDIUM":
        return "bg-yellow-500/20 text-yellow-400";
      case "LOW":
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getTypeLabel = (type: TaskType) => {
    switch (type) {
      case "FOLLOW_UP":
        return "Follow Up";
      case "CALL":
        return "Call";
      case "MEETING":
        return "Meeting";
      default:
        return type;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isOverdue = (dueAt: string, status: TaskStatus) => {
    return status !== "COMPLETED" && new Date(dueAt) < new Date();
  };

  return (
    <div className="p-4 md:p-6 bg-background min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <p className="text-gray-400">Manage your tasks and follow-ups</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as TaskStatus | "");
              setPage(1);
            }}
            className="px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="OVERDUE">Overdue</option>
          </select>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card
          className={`cursor-pointer transition-all hover:ring-2 hover:ring-yellow-500/50 ${filter === 'PENDING' ? 'ring-2 ring-yellow-500' : ''}`}
          onClick={() => setFilter(filter === 'PENDING' ? '' : 'PENDING')}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-yellow-500/20">
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {stats.pending || 0}
              </p>
              <p className="text-sm text-gray-400">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all hover:ring-2 hover:ring-red-500/50 ${filter === 'OVERDUE' ? 'ring-2 ring-red-500' : ''}`}
          onClick={() => setFilter(filter === 'OVERDUE' ? '' : 'OVERDUE')}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-red-500/20">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {stats.overdue || 0}
              </p>
              <p className="text-sm text-gray-400">Overdue</p>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all hover:ring-2 hover:ring-green-500/50 ${filter === 'COMPLETED' ? 'ring-2 ring-green-500' : ''}`}
          onClick={() => setFilter(filter === 'COMPLETED' ? '' : 'COMPLETED')}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/20">
              <Check className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {stats.completed || 0}
              </p>
              <p className="text-sm text-gray-400">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Task List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No tasks found</div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className={`flex items-start gap-4 p-4 rounded-lg border ${getStatusColor(task.status)}`}
                >
                  <div className="mt-1">{getStatusIcon(task.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white">{task.title}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-300">
                        {getTypeLabel(task.type)}
                      </span>
                    </div>
                    {task.description && <p className="text-sm text-gray-400 mt-1">{task.description}</p>}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due: {formatDate(task.dueAt)}
                      </span>
                      {task.assignedAgentId && typeof task.assignedAgentId === "object" && (
                        <span>Assigned: {task.assignedAgentId.name}</span>
                      )}
                    </div>
                  </div>
                  {task.status !== "COMPLETED" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCompleteTask(task._id)}
                      className="text-green-400 hover:text-green-300"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Complete
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-6">
              <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-400">
                {page} / {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Create New Task</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Task title"
                    className="bg-gray-800 border-gray-700"
                    required
                  />
                </div>

                {/* Lead Selector */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Select Lead *</label>
                  {selectedLead ? (
                    <div className="flex items-center justify-between p-3 bg-gray-800 border border-gray-700 rounded-md">
                      <div>
                        <p className="font-medium">{selectedLead.identity?.firstName} {selectedLead.identity?.lastName}</p>
                        <p className="text-sm text-gray-400">{selectedLead.identity?.email || selectedLead.identity?.phone}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedLead(null);
                          setFormData((prev) => ({ ...prev, entityId: "" }));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          value={leadSearch}
                          onChange={(e) => setLeadSearch(e.target.value)}
                          placeholder="Search leads by name, email, or phone..."
                          className="pl-9 bg-gray-800 border-gray-700"
                        />
                      </div>
                      {loadingLeads ? (
                        <p className="text-sm text-gray-400 p-2">Searching...</p>
                      ) : leads.length > 0 ? (
                        <div className="max-h-40 overflow-y-auto border border-gray-700 rounded-md">
                          {leads.map((lead) => (
                            <button
                              key={lead._id}
                              type="button"
                              onClick={() => {
                                setSelectedLead(lead);
                                setFormData((prev) => ({ ...prev, entityId: lead._id }));
                                setLeadSearch("");
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-gray-700 border-b border-gray-700 last:border-0"
                            >
                              <p className="font-medium text-sm">{lead.identity?.firstName} {lead.identity?.lastName}</p>
                              <p className="text-xs text-gray-400">{lead.identity?.email || lead.identity?.phone}</p>
                            </button>
                          ))}
                        </div>
                      ) : leadSearch ? (
                        <p className="text-sm text-gray-400 p-2">No leads found</p>
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as TaskType }))}
                      className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                    >
                      <option value="FOLLOW_UP">Follow Up</option>
                      <option value="CALL">Call</option>
                      <option value="MEETING">Meeting</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, priority: e.target.value as TaskPriority }))
                      }
                      className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Due Date *</label>
                  <Input
                    type="datetime-local"
                    value={formData.dueAt}
                    onChange={(e) => setFormData((prev) => ({ ...prev, dueAt: e.target.value }))}
                    className="bg-gray-800 border-gray-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Task description..."
                    rows={3}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating || !formData.title.trim()}>
                    {creating ? "Creating..." : "Create Task"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
