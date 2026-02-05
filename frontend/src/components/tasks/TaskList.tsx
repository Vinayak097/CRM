import React, { useState } from "react";
import type { Task } from "@/services/taskService";
import { taskService } from "@/services/taskService";
import { CheckCircle2, Trash2, Calendar, AlertCircle } from "lucide-react";

interface TaskListProps {
  entityType: "LEAD" | "CUSTOMER";
  entityId: string;
  tasks: Task[];
  onTasksChange?: () => void;
  loading?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({
  entityType,
  entityId,
  tasks,
  onTasksChange,
  loading = false,
}) => {
  const [completing, setCompleting] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleComplete = async (taskId: string) => {
    setCompleting(taskId);
    try {
      await taskService.completeTask(taskId);
      onTasksChange?.();
    } catch (error) {
      console.error("Failed to complete task:", error);
      alert("Failed to complete task");
    } finally {
      setCompleting(null);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    setDeleting(taskId);
    try {
      await taskService.deleteTask(taskId);
      onTasksChange?.();
    } catch (error) {
      console.error("Failed to delete task:", error);
      alert("Failed to delete task");
    } finally {
      setDeleting(null);
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-50 border-green-200";
      case "OVERDUE":
        return "bg-red-50 border-red-200";
      case "PENDING":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getStatusBadge = (status: Task["status"]) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-block px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
            ✓ Completed
          </span>
        );
      case "OVERDUE":
        return (
          <span className="inline-block px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full flex items-center gap-1">
            <AlertCircle size={12} /> Overdue
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
            Pending
          </span>
        );
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "HIGH":
        return "text-red-600";
      case "MEDIUM":
        return "text-yellow-600";
      case "LOW":
        return "text-green-600";
    }
  };

  const getTaskTypeLabel = (type: Task["type"]) => {
    switch (type) {
      case "FOLLOW_UP":
        return "Follow-up";
      case "CALL":
        return "Call";
      case "MEETING":
        return "Meeting";
      default:
        return type;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No tasks for this {entityType.toLowerCase()}</p>
      </div>
    );
  }

  // Separate tasks by status
  const pendingTasks = tasks.filter((t) => t.status === "PENDING");
  const overdueTasks = tasks.filter((t) => t.status === "OVERDUE");
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED");

  return (
    <div className="space-y-6">
      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
            <AlertCircle size={16} /> Overdue ({overdueTasks.length})
          </h3>
          <div className="space-y-3">
            {overdueTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onComplete={handleComplete}
                onDelete={handleDelete}
                completing={completing === task._id}
                deleting={deleting === task._id}
                getStatusColor={getStatusColor}
                getStatusBadge={getStatusBadge}
                getPriorityColor={getPriorityColor}
                getTaskTypeLabel={getTaskTypeLabel}
                formatDate={formatDate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-blue-700 mb-3">
            Pending ({pendingTasks.length})
          </h3>
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onComplete={handleComplete}
                onDelete={handleDelete}
                completing={completing === task._id}
                deleting={deleting === task._id}
                getStatusColor={getStatusColor}
                getStatusBadge={getStatusBadge}
                getPriorityColor={getPriorityColor}
                getTaskTypeLabel={getTaskTypeLabel}
                formatDate={formatDate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-green-700 mb-3">
            Completed ({completedTasks.length})
          </h3>
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onComplete={handleComplete}
                onDelete={handleDelete}
                completing={completing === task._id}
                deleting={deleting === task._id}
                getStatusColor={getStatusColor}
                getStatusBadge={getStatusBadge}
                getPriorityColor={getPriorityColor}
                getTaskTypeLabel={getTaskTypeLabel}
                formatDate={formatDate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  completing: boolean;
  deleting: boolean;
  getStatusColor: (status: Task["status"]) => string;
  getStatusBadge: (status: Task["status"]) => React.ReactNode;
  getPriorityColor: (priority: Task["priority"]) => string;
  getTaskTypeLabel: (type: Task["type"]) => string;
  formatDate: (date: string) => string;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onComplete,
  onDelete,
  completing,
  deleting,
  getStatusColor,
  getStatusBadge,
  getPriorityColor,
  getTaskTypeLabel,
  formatDate,
}) => {
  return (
    <div
      className={`border rounded-lg p-4 transition ${getStatusColor(task.status)}`}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
              {getTaskTypeLabel(task.type)}
            </span>
            {getStatusBadge(task.status)}
            <span
              className={`text-xs font-bold uppercase ${getPriorityColor(
                task.priority
              )}`}
            >
              {task.priority}
            </span>
          </div>

          <h4 className="font-semibold text-gray-900 mb-2">{task.title}</h4>

          {task.description && (
            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{formatDate(task.dueAt)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          {task.status !== "COMPLETED" && (
            <button
              onClick={() => onComplete(task._id)}
              disabled={completing || deleting}
              className="p-2 text-green-600 hover:bg-green-100 rounded transition disabled:opacity-50"
              title="Mark as complete"
            >
              <CheckCircle2 size={18} />
            </button>
          )}
          <button
            onClick={() => onDelete(task._id)}
            disabled={deleting || completing}
            className="p-2 text-red-600 hover:bg-red-100 rounded transition disabled:opacity-50"
            title="Delete task"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskList;
