import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  Tag,
  Wallet,
  UserCheck,
  BarChart3,
  UserPlus,
  CheckCircle2,
  Clock,
  Plus,
  Edit2,
  X,
  Save,
} from "lucide-react";
import { leadService, type Lead } from "../services/leadService";
import { userService, type User } from "../services/userService";
import { Button } from "@/components/ui/button";
import { LeadClassification, VoidReason, BudgetRange } from "@/types";

const LeadProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"overview" | "tasks">("overview");
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  const [showClassifyModal, setShowClassifyModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [agents, setAgents] = useState<User[]>([]);
  const [selectedClassification, setSelectedClassification] =
    useState<LeadClassification>("Cold");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [updating, setUpdating] = useState(false);
  const [voidReason_value, setVoidReason] = useState<VoidReason | "">("");
  const [customVoidReason, setCustomVoidReason] = useState("");

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    budgetRange: "" as BudgetRange | "",
    source: "",
  });

  const budgetRanges: BudgetRange[] = [
    "0-10k",
    "10k-50k",
    "50k-100k",
    "100k-500k",
    "500k+",
  ];

  const voidReasons: { value: VoidReason; label: string }[] = [
    { value: VoidReason.NotInterested, label: "Not Interested" },
    { value: VoidReason.BudgetMismatch, label: "Budget Mismatch" },
    { value: VoidReason.LocationIssue, label: "Location Issue" },
    { value: VoidReason.JunkLead, label: "Junk Lead" },
    { value: VoidReason.Other, label: "Other" },
  ];

  /* ===================== FETCH LEAD ===================== */
  useEffect(() => {
    const fetchLead = async () => {
      if (!id) return;
      try {
        const response = await leadService.getLeadById(id);
        setLead(response.data);
        setSelectedClassification(response.data.classification);
        setEditForm({
          name: response.data.name || "",
          email: response.data.email || "",
          phone: response.data.phone || "",
          budgetRange: response.data.budgetRange || "",
          source: response.data.source || "",
        });
        if (response.data.voidReason) {
          setVoidReason(response.data.voidReason as VoidReason);
        }
        if (response.data.customVoidReason) {
          setCustomVoidReason(response.data.customVoidReason);
        }
      } catch (error) {
        console.error("Failed to fetch lead:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [id]);

  /* ===================== FETCH AGENTS ===================== */
  const fetchAgents = async () => {
    try {
      const response = await userService.getUsers(1, 100);
      setAgents(response.data.filter((u) => u.role === "sales_agent"));
    } catch {
      console.error("Failed to fetch agents");
    }
  };

  /* ===================== CLASSIFY ===================== */
  const handleClassify = async () => {
    if (!id) return;

    // Validation for Void classification
    if (selectedClassification === "Void") {
      if (!voidReason_value) {
        alert("Please select a void reason");
        return;
      }
      if (voidReason_value === VoidReason.Other && !customVoidReason.trim()) {
        alert("Please enter a custom void reason");
        return;
      }
    }

    setUpdating(true);
    try {
      const data: Partial<Lead> = {
        classification: selectedClassification,
      };

      if (selectedClassification === "Void") {
        data.voidReason = voidReason_value as VoidReason;
        if (voidReason_value === VoidReason.Other) {
          data.customVoidReason = customVoidReason.trim();
        } else {
          data.customVoidReason = "";
        }
      } else {
        // Clear void fields when not Void
        data.voidReason = undefined;
        data.customVoidReason = "";
      }

      const response = await leadService.updateLead(id, data);
      setLead(response.data ?? response);
      setShowClassifyModal(false);
      
      // Only reset if successful
      if (selectedClassification !== "Void") {
        setVoidReason("");
        setCustomVoidReason("");
      }
    } catch (error) {
      console.error("Failed to classify lead:", error);
      alert("Failed to update classification");
    } finally {
      setUpdating(false);
    }
  };

  /* ===================== ASSIGN AGENT ===================== */
  const handleAssign = async () => {
    if (!id || !selectedAgent) return;

    setUpdating(true);
    try {
      await leadService.assignAgent(id, selectedAgent);
      const response = await leadService.getLeadById(id);
      setLead(response.data);
      setShowAssignModal(false);
    } catch (error) {
      console.error("Failed to assign agent:", error);
      alert("Failed to assign agent");
    } finally {
      setUpdating(false);
    }
  };

  /* ===================== EDIT LEAD ===================== */
  const handleEdit = async () => {
    if (!id) return;

    setUpdating(true);
    try {
      const data: Partial<Lead> = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        budgetRange: editForm.budgetRange || undefined,
        source: editForm.source,
      };

      const response = await leadService.updateLead(id, data);
      setLead(response.data ?? response);
      setShowEditModal(false);
    } catch (error) {
      console.error("Failed to update lead:", error);
      alert("Failed to update lead");
    } finally {
      setUpdating(false);
    }
  };

  /* ===================== UI HELPERS ===================== */
  const getClassificationStyle = (classification: LeadClassification) => {
    switch (classification) {
      case "Hot":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Warm":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "Cold":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Void":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  /* ===================== LOADING / EMPTY ===================== */
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Lead not found</p>
          <Button onClick={() => navigate("/leads")}>Back to Leads</Button>
        </div>
      </div>
    );
  }

  /* ===================== JSX ===================== */
  return (
    <div className="min-h-screen bg-background text-white">
      {/* HEADER */}
      <div className="border-b border-gray-800 bg-gray-900/50">
        <div className="p-4 md:p-6">
          <button
            onClick={() => navigate("/leads")}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Leads</span>
          </button>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                {lead.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{lead.name}</h1>
                <span
                  className={`inline-block mt-1 px-3 py-1 rounded-full text-xs border ${getClassificationStyle(
                    lead.classification
                  )}`}
                >
                  {lead.classification}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              <Edit2 className="h-4 w-4" />
              Edit Lead
            </button>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="border-b border-gray-800">
        <div className="px-4 md:px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-3 border-b-2 transition ${
                activeTab === "overview"
                  ? "border-blue-500 text-white"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("tasks")}
              className={`py-3 border-b-2 transition ${
                activeTab === "tasks"
                  ? "border-blue-500 text-white"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Tasks & Activities
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT COLUMN - Contact & Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-400">Email</div>
                      <div className="text-sm">{lead.email || "N/A"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-400">Phone</div>
                      <div className="text-sm">{lead.phone || "N/A"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Tag className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-400">Source</div>
                      <div className="text-sm">{lead.source || "N/A"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-400">Budget Range</div>
                      <div className="text-sm">
                        {lead.budgetRange ? `$${lead.budgetRange}` : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Classification & Void Reasons */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Classification</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-400">Status</div>
                      <span
                        className={`inline-block mt-1 px-3 py-1 rounded-full text-xs border ${getClassificationStyle(
                          lead.classification
                        )}`}
                      >
                        {lead.classification}
                      </span>
                    </div>
                  </div>

                  {lead.classification === "Void" && (
                    <>
                      {lead.voidReason && (
                        <div className="flex items-start gap-3">
                          <X className="h-5 w-5 text-red-400 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-xs text-gray-400">
                              Void Reason
                            </div>
                            <div className="text-sm bg-red-500/10 border border-red-500/30 rounded px-3 py-2 mt-1">
                              {lead.voidReason}
                            </div>
                          </div>
                        </div>
                      )}

                      {lead.customVoidReason && (
                        <div className="flex items-start gap-3">
                          <X className="h-5 w-5 text-red-400 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-xs text-gray-400">
                              Custom Reason Details
                            </div>
                            <div className="text-sm bg-gray-800/50 p-3 rounded border border-gray-700 mt-1">
                              {lead.customVoidReason}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <Button
                    onClick={() => setShowClassifyModal(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Tag className="h-4 w-4 mr-2" />
                    Update Classification
                  </Button>
                </div>
              </div>

              {/* Agent Assignment */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Assigned Agent
                </h2>
                <div className="space-y-4">
                  {lead.assignedAgent ? (
                    <div className="flex items-center gap-3">
                      <UserCheck className="h-5 w-5 text-green-400" />
                      <div>
                        <div className="text-xs text-gray-400">Agent</div>
                        <div className="text-sm">{lead.assignedAgent.name}</div>
                        <div className="text-xs text-gray-500">
                          {lead.assignedAgent.email}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">
                      No agent assigned yet
                    </div>
                  )}

                  <Button
                    onClick={() => {
                      fetchAgents();
                      setShowAssignModal(true);
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {lead.assignedAgent ? "Reassign Agent" : "Assign Agent"}
                  </Button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - Timeline */}
            <div className="space-y-6">
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Timeline</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-400">Created</div>
                      <div className="text-sm">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(lead.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-xs text-gray-400">Last Updated</div>
                      <div className="text-sm">
                        {new Date(lead.updatedAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(lead.updatedAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Tasks Yet</h3>
              <p className="text-gray-400 mb-4">
                Create tasks to track activities for this lead
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* CLASSIFY MODAL */}
      {showClassifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Update Classification</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Classification *
                </label>
                <select
                  value={selectedClassification}
                  onChange={(e) => {
                    setSelectedClassification(e.target.value as LeadClassification);
                    // Reset void fields when changing away from Void
                    if (e.target.value !== "Void") {
                      setVoidReason("");
                      setCustomVoidReason("");
                    }
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Hot">🔥 Hot</option>
                  <option value="Warm">☀️ Warm</option>
                  <option value="Cold">❄️ Cold</option>
                  <option value="Void">🚫 Void</option>
                </select>
              </div>

              {selectedClassification === "Void" && (
                <>
                  <div className="border-t border-gray-700 pt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Void Reason *
                    </label>
                    <select
                      value={voidReason_value}
                      onChange={(e) => {
                        const value = e.target.value as VoidReason | "";
                        setVoidReason(value);
                        if (value !== VoidReason.Other) {
                          setCustomVoidReason("");
                        }
                      }}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Select a reason --</option>
                      {voidReasons.map((reason) => (
                        <option key={reason.value} value={reason.value}>
                          {reason.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {voidReason_value === VoidReason.Other && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Custom Reason *
                      </label>
                      <textarea
                        value={customVoidReason}
                        onChange={(e) => setCustomVoidReason(e.target.value)}
                        placeholder="Please explain why this lead is being marked as void..."
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {customVoidReason.length} characters
                      </p>
                    </div>
                  )}

                  {voidReason_value && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                      <p className="text-xs text-yellow-400">
                        ⚠️ Warning: Marking this lead as Void will remove it from active pipeline tracking.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => {
                  setShowClassifyModal(false);
                  setSelectedClassification(lead.classification);
                  setVoidReason(lead.voidReason || "");
                  setCustomVoidReason(lead.customVoidReason || "");
                }}
                variant="outline"
                className="flex-1"
                disabled={updating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleClassify}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={updating}
              >
                {updating ? "Updating..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN AGENT MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Assign Agent</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Agent
                </label>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">-- Choose an agent --</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} ({agent.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowAssignModal(false)}
                variant="outline"
                className="flex-1"
                disabled={updating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssign}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                disabled={updating || !selectedAgent}
              >
                {updating ? "Assigning..." : "Assign"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT LEAD MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Edit Lead</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Source
                </label>
                <input
                  type="text"
                  value={editForm.source}
                  onChange={(e) =>
                    setEditForm({ ...editForm, source: e.target.value })
                  }
                  placeholder="e.g., Website, Referral, LinkedIn"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Budget Range
                </label>
                <select
                  value={editForm.budgetRange}
                  onChange={(e) =>
                    setEditForm({ ...editForm, budgetRange: e.target.value as BudgetRange | "" })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select budget range --</option>
                  {budgetRanges.map((range) => (
                    <option key={range} value={range}>
                      ${range}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowEditModal(false)}
                variant="outline"
                className="flex-1"
                disabled={updating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEdit}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={updating}
              >
                {updating ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadProfilePage;