import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { leadService } from "../../services/leadService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LeadFormWizard, type LeadFormData } from "@/components/LeadFormWizard";
import type { Lead } from "@/types";

const PAGE_SIZE = 10;

const LeadsPage: React.FC = () => {
  const navigate = useNavigate();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await leadService.getLeads(page, PAGE_SIZE, search);
      setLeads(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
    } catch {
      setError("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleCreateLead = async (formData: LeadFormData) => {
    setCreateLoading(true);
    setError(null);
    try {
      await leadService.createLead({
        identity: {
          fullName: formData.identity.fullName,
          email: formData.identity.email,
          phone: formData.identity.phone,
          residencyStatus: formData.identity.residencyStatus,
          residencyDetails: formData.identity.residencyDetails,
          discoverySource: formData.identity.discoverySource,
          discoveryDetails: formData.identity.discoveryDetails,
        },
        demographics: {
          ageGroup: formData.demographics.ageGroup,
          professions: formData.demographics.professions,
          householdSize: formData.demographics.householdSize,
          annualIncomeRange: formData.demographics.annualIncomeRange,
          notes: formData.demographics.notes,
        },
        propertyVision: {
          propertiesPurchasedBefore: formData.propertyVision.propertiesPurchasedBefore,
          propertyPurpose: formData.propertyVision.propertyPurpose,
          propertyPurposeDetails: formData.propertyVision.propertyPurposeDetails,
          buyingMotivation: formData.propertyVision.buyingMotivation,
          buyingMotivationDetails: formData.propertyVision.buyingMotivationDetails,
          shortTermRentalPreference: formData.propertyVision.shortTermRentalPreference,
          assetTypes: formData.propertyVision.assetTypes,
          assetTypesDetails: formData.propertyVision.assetTypesDetails,
          waterSourcePreference: formData.propertyVision.waterSourcePreference,
          unitConfigurations: formData.propertyVision.unitConfigurations,
          unitConfigurationsDetails: formData.propertyVision.unitConfigurationsDetails,
          farmlandSize: formData.propertyVision.farmlandSize,
          farmlandSizeDetails: formData.propertyVision.farmlandSizeDetails,
          farmlandSizeAcres: formData.propertyVision.farmlandSizeAcres,
          farmlandVillaConfig: formData.propertyVision.farmlandVillaConfig,
          journeyStage: formData.propertyVision.journeyStage,
          journeyStageDetails: formData.propertyVision.journeyStageDetails,
          explorationDuration: formData.propertyVision.explorationDuration,
          explorationDurationDetails: formData.propertyVision.explorationDurationDetails,
          purchaseTimeline: formData.propertyVision.purchaseTimeline,
          purchaseTimelineDetails: formData.propertyVision.purchaseTimelineDetails,
          budgetRange: formData.propertyVision.budgetRange,
          budgetRangeDetails: formData.propertyVision.budgetRangeDetails,
          notes: formData.propertyVision.notes,
        },
        investmentPreferences: {
          ownershipStructure: formData.investmentPreferences.ownershipStructure,
          ownershipStructureDetails: formData.investmentPreferences.ownershipStructureDetails,
          possessionTimeline: formData.investmentPreferences.possessionTimeline,
          possessionTimelineDetails: formData.investmentPreferences.possessionTimelineDetails,
          managementModel: formData.investmentPreferences.managementModel,
          managementModelDetails: formData.investmentPreferences.managementModelDetails,
          fundingType: formData.investmentPreferences.fundingType,
          fundingTypeDetails: formData.investmentPreferences.fundingTypeDetails,
          notes: formData.investmentPreferences.notes,
        },
        locationPreferences: {
          currentLocation: {
            city: formData.locationPreferences.currentCity,
            state: formData.locationPreferences.currentState,
            country: formData.locationPreferences.currentCountry,
          },
          buyingRegions: formData.locationPreferences.buyingRegions,
          preferredCountries: formData.locationPreferences.preferredCountries,
          preferredStates: formData.locationPreferences.preferredStates,
          preferredCities: formData.locationPreferences.preferredCities,
          preferredCitiesDetails: formData.locationPreferences.preferredCitiesDetails,
          climateRisksToAvoid: formData.locationPreferences.climateRisksToAvoid,
          climatePreference: formData.locationPreferences.climatePreference,
          climatePreferenceDetails: formData.locationPreferences.climatePreferenceDetails,
          locationPriorities: formData.locationPreferences.locationPriorities,
          locationPrioritiesDetails: formData.locationPreferences.locationPrioritiesDetails,
          expansionRadiusKm: formData.locationPreferences.expansionRadiusKm,
          expansionRadiusDetails: formData.locationPreferences.expansionRadiusDetails,
          notes: formData.locationPreferences.notes,
        },
        lifestylePreferences: {
          areaType: formData.lifestylePreferences.areaType,
          areaTypeDetails: formData.lifestylePreferences.areaTypeDetails,
          energyPreference: formData.lifestylePreferences.energyPreference,
          energyPreferenceDetails: formData.lifestylePreferences.energyPreferenceDetails,
          natureFeature: formData.lifestylePreferences.natureFeature,
          natureFeatureDetails: formData.lifestylePreferences.natureFeatureDetails,
          terrainPreference: formData.lifestylePreferences.terrainPreference,
          terrainPreferenceDetails: formData.lifestylePreferences.terrainPreferenceDetails,
          viewPreferences: formData.lifestylePreferences.viewPreferences,
          viewPreferencesDetails: formData.lifestylePreferences.viewPreferencesDetails,
          communityFormat: formData.lifestylePreferences.communityFormat,
          communityFormatDetails: formData.lifestylePreferences.communityFormatDetails,
          gatedPreference: formData.lifestylePreferences.gatedPreference,
          communityFriendlyFor: formData.lifestylePreferences.communityFriendlyFor,
          communityFriendlyForDetails: formData.lifestylePreferences.communityFriendlyForDetails,
          outdoorAmenities: formData.lifestylePreferences.outdoorAmenities,
          notes: formData.lifestylePreferences.notes,
        },
        unitPreferences: {
          vastuDirections: formData.unitPreferences.vastuDirections,
          furnishingLevel: formData.unitPreferences.furnishingLevel,
          furnishingLevelDetails: formData.unitPreferences.furnishingLevelDetails,
          interiorStyle: formData.unitPreferences.interiorStyle,
          interiorStyleDetails: formData.unitPreferences.interiorStyleDetails,
          smartHomeFeatures: formData.unitPreferences.smartHomeFeatures,
          smartHomeFeaturesDetails: formData.unitPreferences.smartHomeFeaturesDetails,
          mustHaveFeatures: formData.unitPreferences.mustHaveFeatures,
          mustHaveFeaturesDetails: formData.unitPreferences.mustHaveFeaturesDetails,
          notes: formData.unitPreferences.notes,
        },
        dreamHomeNotes: formData.dreamHomeNotes,
      });
      setShowCreateModal(false);
      fetchLeads();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create lead");
      throw err;
    } finally {
      setCreateLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-500/20 text-blue-400";
      case "Contacted":
        return "bg-cyan-500/20 text-cyan-400";
      case "Qualified":
        return "bg-green-500/20 text-green-400";
      case "Shortlisted":
        return "bg-yellow-500/20 text-yellow-400";
      case "Site Visit":
        return "bg-purple-500/20 text-purple-400";
      case "Negotiation":
        return "bg-orange-500/20 text-orange-400";
      case "Booked":
        return "bg-pink-500/20 text-pink-400";
      case "Lost":
        return "bg-red-500/20 text-red-400";
      case "Converted":
        return "bg-emerald-500/20 text-emerald-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="p-4 md:p-6 text-white bg-background min-h-screen w-full">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Leads</h1>
          <p className="text-gray-400 text-sm mt-1">{total} total leads</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search leads..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Button onClick={handleSearch} variant="secondary" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-400">
          {error}
        </div>
      )}

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="p-6 text-center text-gray-400">Loading...</div>
        ) : leads.length === 0 ? (
          <div className="p-6 text-center text-gray-400">No leads found</div>
        ) : (
          leads.map((lead) => (
            <div
              key={lead._id}
              onClick={() => navigate(`/leads/${lead._id}`)}
              className="bg-gray-900 border border-gray-700 rounded-lg p-4 cursor-pointer active:bg-gray-800"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{lead.identity.fullName}</h3>
                  <p className="text-sm text-gray-400">{lead.identity.phone}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(lead.system.leadStatus)}`}>
                  {lead.system.leadStatus}
                </span>
              </div>
              <div className="flex justify-between items-center mt-3 text-sm">
                <span className="text-gray-400">{lead.propertyVision.budgetRange || "-"}</span>
                <span className="text-gray-400">
                  {lead.system.assignedAgent?.name || "Unassigned"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block overflow-x-auto rounded border border-gray-700">
        <table className="w-full text-left">
          <thead className="bg-gray-900 text-gray-300">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
              <th className="p-3">Budget</th>
              <th className="p-3">Journey Stage</th>
              <th className="p-3">Assigned Agent</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-400">
                  No leads found
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr
                  key={lead._id}
                  className="border-t border-gray-700 hover:bg-gray-800 cursor-pointer"
                  onClick={() => navigate(`/leads/${lead._id}`)}
                >
                  <td className="p-3 font-medium">{lead.identity.fullName}</td>
                  <td className="p-3">{lead.identity.phone}</td>
                  <td className="p-3">{lead.identity.email || "-"}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(lead.system.leadStatus)}`}>
                      {lead.system.leadStatus}
                    </span>
                  </td>
                  <td className="p-3">{lead.propertyVision.budgetRange || "-"}</td>
                  <td className="p-3">{lead.propertyVision.journeyStage || "-"}</td>
                  <td className="p-3">{lead.system.assignedAgent?.name || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center md:justify-end items-center gap-3 mt-4">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
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

      {showCreateModal && (
        <LeadFormWizard
          onSubmit={handleCreateLead}
          onCancel={() => setShowCreateModal(false)}
          loading={createLoading}
        />
      )}
    </div>
  );
};

export default LeadsPage;
