import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Phone, Mail, Calendar, MapPin, Wallet, UserCheck, UserPlus, Clock,
  Edit2, CheckCircle2, Home, Users, Target, Briefcase, Heart, MessageSquare,
  Globe, Building, MoreVertical, Trash2,
} from "lucide-react";
import { leadService } from "../services/leadService";
import { userService, type User } from "../services/userService";
import { Button } from "@/components/ui/button";
import type { Lead, LeadStatus } from "@/types";

const LeadProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [agents, setAgents] = useState<User[]>([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>("New");
  const [converting, setConverting] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const fetchAgents = async () => {
    try {
      const response = await userService.getUsers(1, 100);
      setAgents(response.data.filter((u) => u.role === "sales_agent"));
    } catch { console.error("Failed to fetch agents"); }
  };

  const handleAssign = async () => {
    if (!id || !selectedAgent) return;
    setUpdating(true);
    try {
      await leadService.assignAgent(id, selectedAgent);
      const response = await leadService.getLeadById(id);
      setLead(response.data);
      setShowAssignModal(false);
    } catch { alert("Failed to assign agent"); }
    finally { setUpdating(false); }
  };

  const handleStatusChange = async () => {
    if (!id || !lead) return;
    setUpdating(true);
    try {
      const response = await leadService.updateLead(id, { system: { ...lead.system, leadStatus: selectedStatus } });
      setLead(response.data);
      setShowStatusModal(false);
    } catch { alert("Failed to update status"); }
    finally { setUpdating(false); }
  };

  const handleConvert = async () => {
    if (!id || !lead) return;
    if (lead.system?.leadStatus === "Converted") { alert("Already converted"); return; }
    if (!confirm("Convert this lead to a customer?")) return;
    setConverting(true);
    try {
      const response = await leadService.convertToCustomer(id);
      setLead(response.data);
      alert("Lead converted!");
    } catch { alert("Failed to convert"); }
    finally { setConverting(false); }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this lead?")) return;
    setDeleting(true);
    try {
      await leadService.deleteLead(id);
      navigate("/leads");
    } catch { alert("Failed to delete lead"); }
    finally { setDeleting(false); }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "New": "bg-blue-500/20 text-blue-400 border-blue-500/30",
      "Contacted": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      "Qualified": "bg-green-500/20 text-green-400 border-green-500/30",
      "Shortlisted": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      "Site Visit": "bg-purple-500/20 text-purple-400 border-purple-500/30",
      "Negotiation": "bg-orange-500/20 text-orange-400 border-orange-500/30",
      "Booked": "bg-pink-500/20 text-pink-400 border-pink-500/30",
      "Lost": "bg-red-500/20 text-red-400 border-red-500/30",
      "Converted": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-gray-400">Loading...</div>;
  if (!lead) return <div className="min-h-screen bg-background flex items-center justify-center text-gray-400">Lead not found</div>;

  const InfoCard = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );

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

  const NotesSection = ({ label, value }: { label: string; value?: string }) => {
    if (!value) return null;
    return (
      <div className="py-2">
        <div className="text-sm text-gray-400 mb-1">{label}</div>
        <p className="text-sm bg-gray-800/50 p-3 rounded">{value}</p>
      </div>
    );
  };

  const fullName = [lead.identity?.firstName, lead.identity?.lastName].filter(Boolean).join(" ") || "Unknown";

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <button onClick={() => navigate("/leads")} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4" /><span className="text-sm">Back to Leads</span>
          </button>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                {fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{fullName}</h1>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(lead.system?.leadStatus || "New")}`}>
                    {lead.system?.leadStatus || "New"}
                  </span>
                  {lead.system?.priorityScore && (
                    <span className="text-sm text-amber-400 bg-amber-500/10 px-2 py-1 rounded">Priority: {lead.system.priorityScore}</span>
                  )}
                  <span className="text-sm text-gray-400">Created {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "N/A"}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  {lead.identity?.phone && <span className="flex items-center gap-1"><Phone className="h-4 w-4" />{lead.identity.phone}</span>}
                  {lead.identity?.email && <span className="flex items-center gap-1"><Mail className="h-4 w-4" />{lead.identity.email}</span>}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate(`/leads/${id}/edit`)}><Edit2 className="h-4 w-4 mr-1" />Edit</Button>
              <Button variant="outline" size="sm" onClick={() => { fetchAgents(); setShowAssignModal(true); }}><UserPlus className="h-4 w-4 mr-1" />Assign</Button>
              <Button variant="outline" size="sm" onClick={() => setShowStatusModal(true)}><Target className="h-4 w-4 mr-1" />Status</Button>
              <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleting} className="text-red-400 hover:text-red-300">
                <Trash2 className="h-4 w-4 mr-1" />{deleting ? "..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <InfoCard title="Customer Information" icon={Users}>
              <InfoRow label="First Name" value={lead.identity?.firstName} />
              <InfoRow label="Last Name" value={lead.identity?.lastName} />
              <InfoRow label="Email" value={lead.identity?.email} />
              <InfoRow label="Phone" value={lead.identity?.phone} />
              <InfoRow label="Home Country" value={lead.identity?.homeCountry} />
              <InfoRow label="Tax Residency" value={lead.identity?.taxResidencyCountry} />
              <InfoRow label="Visa Status" value={lead.identity?.visaResidencyStatus} />
              <InfoRow label="Lead Source" value={lead.identity?.leadSource} />
              <InfoRow label="Age" value={lead.identity?.ageYears} />
              <InfoRow label="Profession" value={lead.identity?.profession} />
              <InfoRow label="Household Size" value={lead.identity?.householdSize} />
              <InfoRow label="Income Range" value={lead.identity?.householdIncomeBandInr} />
              <NotesSection label="About You Notes" value={lead.identity?.aboutYouNotes} />
            </InfoCard>

            {/* Buying Journey */}
            <InfoCard title="Buying Journey" icon={Target}>
              <InfoRow label="Properties Purchased" value={lead.identity?.priorPropertiesPurchased} />
              <InfoRow label="Journey Stage" value={lead.identity?.buyingJourneyStage} />
              <InfoRow label="Exploration Duration" value={lead.identity?.explorationDuration} />
              <InfoRow label="Purchase Timeline" value={lead.identity?.purchaseTimeline} />
              <TagList label="Property Role" items={lead.identity?.propertyRolePrimary} />
              <TagList label="Search Triggers" items={lead.identity?.searchTrigger} />
              <NotesSection label="Ownership Timeline Notes" value={lead.identity?.ownershipTimelineNotes} />
            </InfoCard>

            {/* Location Preferences */}
            <InfoCard title="Location Preferences" icon={MapPin}>
              <InfoRow label="Country Focus" value={lead.location?.buyingCountryFocus} />
              <TagList label="Target States/Regions" items={lead.location?.targetStatesRegions} />
              <TagList label="Target Locations" items={lead.location?.targetLocations} />
              <TagList label="Climate Risks to Avoid" items={lead.location?.climateRiskAvoidance} />
              <TagList label="Preferred Climate" items={lead.location?.preferredClimate} />
              <TagList label="Location Priorities" items={lead.location?.locationPriorities} />
              <TagList label="Area Type Preference" items={lead.location?.areaTypePreference} />
              <TagList label="Natural Features" items={lead.location?.naturalFeatureClosest} />
              <NotesSection label="Location Deal-breakers" value={lead.location?.locationDealbreakerNotes} />
            </InfoCard>

            {/* Property Preferences */}
            <InfoCard title="Property Preferences" icon={Building}>
              <InfoRow label="STR Importance" value={lead.property?.strPermissionImportance} />
              <InfoRow label="Water Source Preference" value={lead.property?.farmlandWaterSourcePreference} />
              <InfoRow label="Ownership Structure" value={lead.property?.ownershipStructurePreference} />
              <InfoRow label="Possession Stage" value={lead.property?.possessionStagePreference} />
              <InfoRow label="Possession Timeline" value={lead.property?.possessionTimelineBucket} />
              <InfoRow label="Management Model" value={lead.property?.managementModelPreference} />
              <InfoRow label="Funding Preference" value={lead.property?.fundingPreference} />
              <InfoRow label="Community Format" value={lead.property?.communityFormatPreference} />
              <TagList label="Asset Types" items={lead.property?.assetTypeInterest} />
              <TagList label="Unit Configuration" items={lead.property?.unitConfiguration} />
              <TagList label="Land Size" items={lead.property?.farmlandLandSizeBucket} />
              <TagList label="Community Friendly For" items={lead.property?.communityFriendlyFor} />
            </InfoCard>

            {/* Home Features */}
            <InfoCard title="Home Features" icon={Home}>
              <InfoRow label="Furnishing Level" value={lead.property?.furnishingLevelPreference} />
              <InfoRow label="Interior Finish" value={lead.property?.interiorFinishLevel} />
              <TagList label="Vastu Directions" items={lead.property?.vastuPreferredDirections} />
              <TagList label="Must-Have Features" items={lead.property?.homeMustHaveFeatures} />
              <TagList label="Nice-to-Have Features" items={lead.property?.homeNiceToHaveFeatures} />
              <TagList label="Smart Home & Security" items={lead.property?.smartHomeSecurityFeatures} />
              <TagList label="Private Outdoor Features" items={lead.property?.privateOutdoorFeatures} />
              <TagList label="Community Amenities" items={lead.property?.communityOutdoorAmenitiesTop} />
              <NotesSection label="Ideal Home Notes" value={lead.property?.idealHomeNotes} />
              <NotesSection label="Property Vision Notes" value={lead.property?.propertyVisionNotes} />
            </InfoCard>

            {/* Final Notes */}
            {lead.property?.finalNotes && (
              <InfoCard title="Additional Notes" icon={MessageSquare}>
                <p className="text-sm bg-gray-800/50 p-3 rounded">{lead.property.finalNotes}</p>
              </InfoCard>
            )}
          </div>

          {/* Right Column - Status & Actions */}
          <div className="space-y-6">
            {/* Lead Status */}
            <InfoCard title="Lead Status" icon={CheckCircle2}>
              {lead.system?.leadStatus === "Converted" ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="h-8 w-8 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-400 mb-2">Converted</h3>
                  <p className="text-sm text-gray-400">Successfully converted to customer</p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                    <Target className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">In Progress</h3>
                  <p className="text-sm text-gray-400 mb-4">Convert when ready</p>
                  <Button onClick={handleConvert} disabled={converting || lead.system?.leadStatus === "Lost"} className="w-full bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="h-4 w-4 mr-2" />{converting ? "Converting..." : "Convert to Customer"}
                  </Button>
                </div>
              )}
            </InfoCard>

            {/* Agent Assignment */}
            <InfoCard title="Assigned Agent" icon={UserCheck}>
              {lead.system?.assignedAgent ? (
                <div className="text-center py-2">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-2">
                    <UserCheck className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="font-medium">{lead.system.assignedAgent.name}</div>
                  <div className="text-sm text-gray-400">{lead.system.assignedAgent.email}</div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-gray-400">No agent assigned</p>
                  <Button onClick={() => { fetchAgents(); setShowAssignModal(true); }} variant="outline" size="sm" className="mt-2">
                    <UserPlus className="h-4 w-4 mr-1" />Assign Agent
                  </Button>
                </div>
              )}
            </InfoCard>

            {/* Timeline */}
            <InfoCard title="Timeline" icon={Clock}>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Created</div>
                    <div className="text-xs text-gray-400">{lead.createdAt ? new Date(lead.createdAt).toLocaleString() : "N/A"}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Last Updated</div>
                    <div className="text-xs text-gray-400">{lead.updatedAt ? new Date(lead.updatedAt).toLocaleString() : "N/A"}</div>
                  </div>
                </div>
              </div>
            </InfoCard>

            {/* Scores */}
            {(lead.system?.priorityScore || lead.system?.investmentScore) && (
              <InfoCard title="Scores" icon={Target}>
                <div className="grid grid-cols-2 gap-4">
                  {lead.system?.priorityScore !== undefined && (
                    <div className="text-center p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <div className="text-2xl font-bold text-amber-400">{lead.system.priorityScore}</div>
                      <div className="text-xs text-gray-400">Priority</div>
                    </div>
                  )}
                  {lead.system?.investmentScore !== undefined && (
                    <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="text-2xl font-bold text-green-400">{lead.system.investmentScore}</div>
                      <div className="text-xs text-gray-400">Investment</div>
                    </div>
                  )}
                </div>
              </InfoCard>
            )}
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Assign Agent</h2>
            <select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white mb-4">
              <option value="">-- Choose an agent --</option>
              {agents.map((agent) => <option key={agent._id} value={agent._id}>{agent.name} ({agent.email})</option>)}
            </select>
            <div className="flex gap-3">
              <Button onClick={() => setShowAssignModal(false)} variant="outline" className="flex-1">Cancel</Button>
              <Button onClick={handleAssign} disabled={updating || !selectedAgent} className="flex-1">{updating ? "..." : "Assign"}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Update Status</h2>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value as LeadStatus)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white mb-4">
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <div className="flex gap-3">
              <Button onClick={() => setShowStatusModal(false)} variant="outline" className="flex-1">Cancel</Button>
              <Button onClick={handleStatusChange} disabled={updating} className="flex-1">{updating ? "..." : "Update"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadProfilePage;
