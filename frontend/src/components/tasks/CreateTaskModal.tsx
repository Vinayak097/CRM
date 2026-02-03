import React, { useState, useEffect } from "react";
import { taskService } from "@/services/taskService";
import { Button } from "@/components/ui/button";
import { Calendar, X, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: "LEAD" | "CUSTOMER";
  entityId: string;
  agentId?: string;
  onSuccess?: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  entityType,
  entityId,
  agentId: propAgentId,
  onSuccess,
}) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: "FOLLOW_UP",
    title: "",
    description: "",
    dueAt: "",
    priority: "MEDIUM",
  });

  // Use propAgentId if provided, otherwise use current user's ID
  const agentId = propAgentId || user?.id;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title.trim()) {
      setError("Task title is required");
      return;
    }

    if (!formData.dueAt) {
      setError("Due date is required");
      return;
    }

    if (!agentId || agentId.trim() === "") {
      setError("Agent ID is missing. Please reload the page and try again.");
      return;
    }

    setLoading(true);

    try {
      // Convert datetime-local to ISO 8601 with timezone
      const dueDate = new Date(formData.dueAt);
      if (isNaN(dueDate.getTime())) {
        setError("Invalid date format");
        setLoading(false);
        return;
      }

      await taskService.createTask({
        type: formData.type as "FOLLOW_UP" | "CALL" | "MEETING" | "SYSTEM_CHECK",
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        dueAt: dueDate.toISOString(),
        priority: formData.priority as "LOW" | "MEDIUM" | "HIGH",
        assignedAgentId: agentId,
        entityType,
        entityId,
        googleSyncEnabled: false,
      });

      // Reset form
      setFormData({
        type: "FOLLOW_UP",
        title: "",
        description: "",
        dueAt: "",
        priority: "MEDIUM",
      });

      // Close modal and refresh
      onClose();
      onSuccess?.();
    } catch (err) {
      console.error("Failed to create task:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to create task. Please try again.";
      // Extract validation errors if present
      const errorData = err instanceof Error ? err : null;
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white text-black rounded-2xl shadow-2xl max-w-lg w-full overflow-y-auto max-h-[90vh]">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Create Task</h2>
            <p className="text-blue-100 text-xs mt-0.5">
              {entityType === "LEAD" ? "Add a task for this lead" : "Add a task for this customer"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-blue-100 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex gap-3 text-sm text-red-800 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5 text-red-600" />
              <div>
                <p className="font-semibold">Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Task Type & Priority Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Task Type */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Task Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50 hover:bg-white"
                disabled={loading}
              >
                <option value="FOLLOW_UP">📞 Follow-up</option>
                <option value="CALL">☎️ Call</option>
                <option value="MEETING">👥 Meeting</option>
                <option value="SYSTEM_CHECK">✓ System Check</option>
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Priority
              </label>
              <div className="flex gap-2">
                {(["LOW", "MEDIUM", "HIGH"] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: level })}
                    className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all transform ${
                      formData.priority === level
                        ? level === "HIGH"
                          ? "bg-red-500 text-white shadow-lg shadow-red-500/30 scale-105"
                          : level === "MEDIUM"
                            ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105"
                            : "bg-green-500 text-white shadow-lg shadow-green-500/30 scale-105"
                        : "bg-gray-100 text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    disabled={loading}
                  >
                    {level === "HIGH" && "🔴"}
                    {level === "MEDIUM" && "🟡"}
                    {level === "LOW" && "🟢"}
                    <span className="ml-1">{level}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Follow up with John about property..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50 hover:bg-white placeholder-gray-400"
              disabled={loading}
              maxLength={200}
            />
            <p className="text-xs font-medium text-gray-400 text-right">
              {formData.title.length}/200
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              Description <span className="text-gray-400 font-normal text-xs">(Optional)</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Add any additional notes..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50 hover:bg-white h-16 resize-none placeholder-gray-400"
              disabled={loading}
              maxLength={2000}
            />
            <p className="text-xs font-medium text-gray-400 text-right">
              {formData.description.length}/2000
            </p>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              Due Date & Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none"
              />
              <input
                type="datetime-local"
                name="dueAt"
                value={formData.dueAt}
                onChange={handleInputChange}
                className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50 hover:bg-white"
                disabled={loading}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2 rounded-lg font-medium text-gray-700 border-2 border-gray-300 hover:bg-gray-50 transition-all text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title.trim() || !formData.dueAt}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
