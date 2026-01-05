import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Wallet,
  UserCheck,
  UserPlus,
  Clock,
  Edit2,
  CheckCircle2,
  Home,
  Users,
  Target,
  Briefcase,
  Heart,
  MessageSquare,
  Globe,
  Building,
  Trees,
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

  const statuses: LeadStatus[] = [
    "New",
    "Contacted",
    "Qualified",
    "Shortlisted",
    "Site Visit",
    "Negotiation",
    "Booked",
    "Lost",
    "Converted",
  ];

  useEffect(() => {
    const fetchLead = async () => {
      if (!id) return;
      try {
        const response = await leadService.getLeadById(id);
        setLead(response.data);
        setSelectedStatus(response.data.system.leadStatus);
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
    } catch {
      console.error("Failed to fetch agents");
    }
  };

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

  const handleStatusChange = async () => {
    if (!id || !lead) return;
    setUpdating(true);
    try {
      const response = await leadService.updateLead(id, {
        system: { ...lead.system, leadStatus: selectedStatus },
      });
      setLead(response.data);
      setShowStatusModal(false);
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleConvert = async () => {
    if (!id || !lead) return;
    if (lead.system.leadStatus === "Converted") {
      alert("This lead is already converted");
      return;
    }
    if (!confirm("Are you sure you want to convert this lead to a customer?")) return;

    setConverting(true);
    try {
      const response = await leadService.convertToCustomer(id);
      setLead(response.data);
      alert("Lead converted to customer successfully!");
    } catch (error) {
      console.error("Failed to convert lead:", error);
      alert("Failed to convert lead to customer");
    } finally {
      setConverting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Contacted": return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      case "Qualified": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Shortlisted": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Site Visit": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "Negotiation": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "Booked": return "bg-pink-500/20 text-pink-400 border-pink-500/30";
      case "Lost": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Converted": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

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
        <div className="text-gray-400">Lead not found</div>
      </div>
    );
  }

  const InfoCard = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-gray-400" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );

  const InfoRow = ({ label, value }: { label: string; value?: string | number | boolean | null }) => {
    if (value === undefined || value === null || value === "") return null;
    return (
      <div className="flex justify-between py-2 border-b border-gray-800 last:border-0">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-sm text-right max-w-[60%]">
          {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
        </span>
      </div>
    );
  };

  const TagList = ({ items }: { items?: string[] }) => {
    if (!items || items.length === 0) return <span className="text-gray-500 text-sm">-</span>;
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {items.map((item, i) => (
          <span key={i} className="px-2 py-1 bg-gray-800 rounded text-xs">{item}</span>
        ))}
      </div>
    );
  };

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="text-sm text-gray-400 mb-1">{children}</div>
  );

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Header */}
      <div className="bg-gray-900/50 border-b border-gray-800 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate("/leads")}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Leads</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                {lead.identity.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{lead.identity.fullName}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(lead.system.leadStatus)}`}>
                    {lead.system.leadStatus}
                  </span>
                  {lead.system.priorityScore !== undefined && lead.system.priorityScore > 0 && (
                    <span className="text-sm text-gray-400">Priority: {lead.system.priorityScore}</span>
                  )}
                </div>
              </div>
            </div>

            <Button onClick={() => setShowStatusModal(true)} variant="outline" size="sm">
              <Edit2 className="h-4 w-4 mr-2" />
              Update Status
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
            <InfoCard title="Contact Information" icon={Phone}>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{lead.identity.phone}</span>
                </div>
                {lead.identity.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{lead.identity.email}</span>
                  </div>
                )}
                <InfoRow label="Residency Status" value={lead.identity.residencyStatus} />
                <InfoRow label="Discovery Source" value={lead.identity.discoverySource} />
              </div>
            </InfoCard>

            {/* Demographics */}
            <InfoCard title="Demographics" icon={Users}>
              <InfoRow label="Age Group" value={lead.demographics?.ageGroup} />
              <InfoRow label="Household Size" value={lead.demographics?.householdSize} />
              <InfoRow label="Annual Income" value={lead.demographics?.annualIncomeRange} />
              <div className="mt-3">
                <SectionTitle>Professions</SectionTitle>
                <TagList items={lead.demographics?.professions} />
              </div>
              {lead.demographics?.notes && (
                <div className="mt-3">
                  <SectionTitle>Notes</SectionTitle>
                  <p className="text-sm bg-gray-800/50 p-3 rounded mt-1">{lead.demographics.notes}</p>
                </div>
              )}
            </InfoCard>

            {/* Property Vision */}
            <InfoCard title="Property Vision" icon={Target}>
              <InfoRow label="Properties Purchased Before" value={lead.propertyVision?.propertiesPurchasedBefore} />
              <InfoRow label="Short-term Rental Interest" value={lead.propertyVision?.shortTermRentalPreference} />
              <InfoRow label="Journey Stage" value={lead.propertyVision?.journeyStage} />
              <InfoRow label="Exploration Duration" value={lead.propertyVision?.explorationDuration} />
              <InfoRow label="Purchase Timeline" value={lead.propertyVision?.purchaseTimeline} />
              <InfoRow label="Budget Range" value={lead.propertyVision?.budgetRange} />
              <InfoRow label="Water Source Preference" value={lead.propertyVision?.waterSourcePreference} />
              <InfoRow label="Farmland Size" value={lead.propertyVision?.farmlandSize} />
              {lead.propertyVision?.farmlandSizeAcres && (
                <InfoRow label="Farmland Acres" value={`${lead.propertyVision.farmlandSizeAcres} acres`} />
              )}
              <InfoRow label="Farmland Villa Config" value={lead.propertyVision?.farmlandVillaConfig} />
              
              <div className="mt-3">
                <SectionTitle>Property Purpose</SectionTitle>
                <TagList items={lead.propertyVision?.propertyPurpose} />
              </div>
              <div className="mt-3">
                <SectionTitle>Buying Motivation</SectionTitle>
                <TagList items={lead.propertyVision?.buyingMotivation} />
              </div>
              <div className="mt-3">
                <SectionTitle>Asset Types</SectionTitle>
                <TagList items={lead.propertyVision?.assetTypes} />
              </div>
              <div className="mt-3">
                <SectionTitle>Unit Configurations</SectionTitle>
                <TagList items={lead.propertyVision?.unitConfigurations} />
              </div>
              {lead.propertyVision?.notes && (
                <div className="mt-3">
                  <SectionTitle>Notes</SectionTitle>
                  <p className="text-sm bg-gray-800/50 p-3 rounded mt-1">{lead.propertyVision.notes}</p>
                </div>
              )}
            </InfoCard>

            {/* Investment Preferences */}
            <InfoCard title="Investment Preferences" icon={Briefcase}>
              <InfoRow label="Ownership Structure" value={lead.investmentPreferences?.ownershipStructure} />
              <InfoRow label="Possession Timeline" value={lead.investmentPreferences?.possessionTimeline} />
              <InfoRow label="Management Model" value={lead.investmentPreferences?.managementModel} />
              <InfoRow label="Funding Type" value={lead.investmentPreferences?.fundingType} />
              {lead.investmentPreferences?.notes && (
                <div className="mt-3">
                  <SectionTitle>Notes</SectionTitle>
                  <p className="text-sm bg-gray-800/50 p-3 rounded mt-1">{lead.investmentPreferences.notes}</p>
                </div>
              )}
            </InfoCard>

            {/* Location Preferences */}
            <InfoCard title="Location Preferences" icon={MapPin}>
              {lead.locationPreferences?.currentLocation && (
                <div className="mb-3">
                  <SectionTitle>Current Location</SectionTitle>
                  <p className="text-sm">
                    {[
                      lead.locationPreferences.currentLocation.city,
                      lead.locationPreferences.currentLocation.state,
                      lead.locationPreferences.currentLocation.country,
                    ].filter(Boolean).join(", ") || "-"}
                  </p>
                </div>
              )}
              <InfoRow label="Expansion Radius" value={lead.locationPreferences?.expansionRadiusKm} />
              
              <div className="mt-3">
                <SectionTitle>Buying Regions</SectionTitle>
                <TagList items={lead.locationPreferences?.buyingRegions} />
              </div>
              <div className="mt-3">
                <SectionTitle>Preferred Countries</SectionTitle>
                <TagList items={lead.locationPreferences?.preferredCountries} />
              </div>
              <div className="mt-3">
                <SectionTitle>Preferred States</SectionTitle>
                <TagList items={lead.locationPreferences?.preferredStates} />
              </div>
              <div className="mt-3">
                <SectionTitle>Preferred Cities</SectionTitle>
                <TagList items={lead.locationPreferences?.preferredCities} />
              </div>
              <div className="mt-3">
                <SectionTitle>Climate Risks to Avoid</SectionTitle>
                <TagList items={lead.locationPreferences?.climateRisksToAvoid} />
              </div>
              <div className="mt-3">
                <SectionTitle>Climate Preference</SectionTitle>
                <TagList items={lead.locationPreferences?.climatePreference} />
              </div>
              <div className="mt-3">
                <SectionTitle>Location Priorities</SectionTitle>
                <TagList items={lead.locationPreferences?.locationPriorities} />
              </div>
              {lead.locationPreferences?.notes && (
                <div className="mt-3">
                  <SectionTitle>Notes</SectionTitle>
                  <p className="text-sm bg-gray-800/50 p-3 rounded mt-1">{lead.locationPreferences.notes}</p>
                </div>
              )}
            </InfoCard>

            {/* Lifestyle Preferences */}
            <InfoCard title="Lifestyle & Community" icon={Heart}>
              <InfoRow label="Community Format" value={lead.lifestylePreferences?.communityFormat} />
              <InfoRow label="Gated Preference" value={lead.lifestylePreferences?.gatedPreference} />
              
              <div className="mt-3">
                <SectionTitle>Area Type</SectionTitle>
                <TagList items={lead.lifestylePreferences?.areaType} />
              </div>
              <div className="mt-3">
                <SectionTitle>Energy Preference</SectionTitle>
                <TagList items={lead.lifestylePreferences?.energyPreference} />
              </div>
              <div className="mt-3">
                <SectionTitle>Nature Features</SectionTitle>
                <TagList items={lead.lifestylePreferences?.natureFeature} />
              </div>
              <div className="mt-3">
                <SectionTitle>Terrain Preference</SectionTitle>
                <TagList items={lead.lifestylePreferences?.terrainPreference} />
              </div>
              <div className="mt-3">
                <SectionTitle>View Preferences</SectionTitle>
                <TagList items={lead.lifestylePreferences?.viewPreferences} />
              </div>
              <div className="mt-3">
                <SectionTitle>Community Friendly For</SectionTitle>
                <TagList items={lead.lifestylePreferences?.communityFriendlyFor} />
              </div>
              <div className="mt-3">
                <SectionTitle>Outdoor Amenities</SectionTitle>
                <TagList items={lead.lifestylePreferences?.outdoorAmenities} />
              </div>
              {lead.lifestylePreferences?.notes && (
                <div className="mt-3">
                  <SectionTitle>Notes</SectionTitle>
                  <p className="text-sm bg-gray-800/50 p-3 rounded mt-1">{lead.lifestylePreferences.notes}</p>
                </div>
              )}
            </InfoCard>

            {/* Unit Preferences */}
            <InfoCard title="Unit Preferences" icon={Home}>
              <InfoRow label="Furnishing Level" value={lead.unitPreferences?.furnishingLevel} />
              <InfoRow label="Interior Style" value={lead.unitPreferences?.interiorStyle} />
              
              <div className="mt-3">
                <SectionTitle>Vastu Directions</SectionTitle>
                <TagList items={lead.unitPreferences?.vastuDirections} />
              </div>
              <div className="mt-3">
                <SectionTitle>Smart Home Features</SectionTitle>
                <TagList items={lead.unitPreferences?.smartHomeFeatures} />
              </div>
              <div className="mt-3">
                <SectionTitle>Must-Have Features</SectionTitle>
                <TagList items={lead.unitPreferences?.mustHaveFeatures} />
              </div>
              {lead.unitPreferences?.notes && (
                <div className="mt-3">
                  <SectionTitle>Notes</SectionTitle>
                  <p className="text-sm bg-gray-800/50 p-3 rounded mt-1">{lead.unitPreferences.notes}</p>
                </div>
              )}
            </InfoCard>

            {/* Dream Home Notes */}
            {lead.dreamHomeNotes && (
              <InfoCard title="Dream Home Notes" icon={MessageSquare}>
                <p className="text-sm bg-gray-800/50 p-3 rounded">{lead.dreamHomeNotes}</p>
              </InfoCard>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Agent Assignment */}
            <InfoCard title="Assigned Agent" icon={UserCheck}>
              {lead.system.assignedAgent ? (
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                    {lead.system.assignedAgent.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium">{lead.system.assignedAgent.name}</div>
                    <div className="text-sm text-gray-400">{lead.system.assignedAgent.email}</div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 mb-4">No agent assigned</p>
              )}
              <Button
                onClick={() => { fetchAgents(); setShowAssignModal(true); }}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {lead.system.assignedAgent ? "Reassign Agent" : "Assign Agent"}
              </Button>
            </InfoCard>

            {/* Conversion */}
            <InfoCard title="Conversion" icon={CheckCircle2}>
              {lead.system.leadStatus === "Converted" ? (
                <div className="flex items-center gap-3 text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Converted to Customer</span>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-400 mb-4">Convert this lead to a customer when they make a purchase.</p>
                  <Button
                    onClick={handleConvert}
                    disabled={converting || lead.system.leadStatus === "Lost"}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {converting ? "Converting..." : "Convert to Customer"}
                  </Button>
                </>
              )}
            </InfoCard>

            {/* Timeline */}
            <InfoCard title="Timeline" icon={Clock}>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-400">Created</div>
                    <div className="text-sm">{new Date(lead.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-400">Last Updated</div>
                    <div className="text-sm">{new Date(lead.updatedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </InfoCard>

            {/* Scores */}
            {(lead.system.priorityScore || lead.system.investmentScore) && (
              <InfoCard title="Scores" icon={Target}>
                <InfoRow label="Priority Score" value={lead.system.priorityScore} />
                <InfoRow label="Investment Score" value={lead.system.investmentScore} />
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
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white mb-4"
            >
              <option value="">-- Choose an agent --</option>
              {agents.map((agent) => (
                <option key={agent._id} value={agent._id}>{agent.name} ({agent.email})</option>
              ))}
            </select>
            <div className="flex gap-3">
              <Button onClick={() => setShowAssignModal(false)} variant="outline" className="flex-1">Cancel</Button>
              <Button onClick={handleAssign} disabled={updating || !selectedAgent} className="flex-1">
                {updating ? "Assigning..." : "Assign"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Update Status</h2>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as LeadStatus)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white mb-4"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <Button onClick={() => setShowStatusModal(false)} variant="outline" className="flex-1">Cancel</Button>
              <Button onClick={handleStatusChange} disabled={updating} className="flex-1">
                {updating ? "Updating..." : "Update"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadProfilePage;
