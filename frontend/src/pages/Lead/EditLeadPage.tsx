import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2, User, Mail, Phone, MapPin, DollarSign, Calendar, MessageSquare } from "lucide-react";
import { leadService } from "../../services/leadService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Lead } from "@/types";

interface LeadFormData {
  // Basic Information
  fullName: string;
  email: string;
  phone: string;
  residencyStatus: string;
  residencyDetails: string;
  discoverySource: string;
  discoveryDetails: string;

  // Demographics
  ageGroup: string;
  professions: string[];
  householdSize: string;
  annualIncomeRange: string;

  // Location
  currentCity: string;
  currentState: string;
  currentCountry: string;
  buyingRegions: string[];
  preferredCities: string[];

  // Property Details
  propertiesPurchasedBefore: string;
  propertyPurpose: string[];
  buyingMotivation: string[];
  assetTypes: string[];
  budgetRange: string;
  journeyStage: string;
  purchaseTimeline: string;

  // Investment Preferences
  ownershipStructure: string;
  fundingType: string;

  // Lifestyle Preferences
  areaType: string[];
  communityFormat: string;
  gatedPreference: string;

  // Unit Preferences
  furnishingLevel: string;
  smartHomeFeatures: string[];

  // Additional Notes
  notes: string;
}

const EditLeadPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<LeadFormData>({
    // Basic Information
    fullName: "",
    email: "",
    phone: "",
    residencyStatus: "",
    residencyDetails: "",
    discoverySource: "",
    discoveryDetails: "",

    // Demographics
    ageGroup: "",
    professions: [],
    householdSize: "",
    annualIncomeRange: "",

    // Location
    currentCity: "",
    currentState: "",
    currentCountry: "India",
    buyingRegions: [],
    preferredCities: [],

    // Property Details
    propertiesPurchasedBefore: "",
    propertyPurpose: [],
    buyingMotivation: [],
    assetTypes: [],
    budgetRange: "",
    journeyStage: "",
    purchaseTimeline: "",

    // Investment Preferences
    ownershipStructure: "",
    fundingType: "",

    // Lifestyle Preferences
    areaType: [],
    communityFormat: "",
    gatedPreference: "",

    // Unit Preferences
    furnishingLevel: "",
    smartHomeFeatures: [],

    // Additional Notes
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchLead = async () => {
      if (!id) return;

      try {
        const response = await leadService.getLeadById(id);
        const leadData = response.data;
        setLead(leadData);

        // Populate form data from lead
        setFormData({
          fullName: leadData.identity?.fullName || "",
          email: leadData.identity?.email || "",
          phone: leadData.identity?.phone || "",
          residencyStatus: leadData.identity?.residencyStatus || "",
          residencyDetails: leadData.identity?.residencyDetails || "",
          discoverySource: leadData.identity?.discoverySource || "",
          discoveryDetails: leadData.identity?.discoveryDetails || "",

          ageGroup: leadData.demographics?.ageGroup || "",
          professions: leadData.demographics?.professions || [],
          householdSize: leadData.demographics?.householdSize || "",
          annualIncomeRange: leadData.demographics?.annualIncomeRange || "",

          currentCity: leadData.locationPreferences?.currentLocation?.city || "",
          currentState: leadData.locationPreferences?.currentLocation?.state || "",
          currentCountry: leadData.locationPreferences?.currentLocation?.country || "India",
          buyingRegions: leadData.locationPreferences?.buyingRegions || [],
          preferredCities: leadData.locationPreferences?.preferredCities || [],

          propertiesPurchasedBefore: String(leadData.propertyVision?.propertiesPurchasedBefore || ""),
          propertyPurpose: leadData.propertyVision?.propertyPurpose || [],
          buyingMotivation: leadData.propertyVision?.buyingMotivation || [],
          assetTypes: leadData.propertyVision?.assetTypes || [],
          budgetRange: leadData.propertyVision?.budgetRange || "",
          journeyStage: leadData.propertyVision?.journeyStage || "",
          purchaseTimeline: leadData.propertyVision?.purchaseTimeline || "",

          ownershipStructure: leadData.investmentPreferences?.ownershipStructure || "",
          fundingType: leadData.investmentPreferences?.fundingType || "",

          areaType: leadData.lifestylePreferences?.areaType || [],
          communityFormat: leadData.lifestylePreferences?.communityFormat || "",
          gatedPreference: leadData.lifestylePreferences?.gatedPreference || "",

          furnishingLevel: leadData.unitPreferences?.furnishingLevel || "",
          smartHomeFeatures: leadData.unitPreferences?.smartHomeFeatures || [],

          notes: leadData.dreamHomeNotes || "",
        });
      } catch (err) {
        console.error("Failed to fetch lead:", err);
        setError("Failed to load lead data");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchLead();
  }, [id]);

  const handleInputChange = (field: keyof LeadFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.residencyStatus) newErrors.residencyStatus = "Residency status is required";
    if (!formData.discoverySource) newErrors.discoverySource = "Discovery source is required";
    if (!formData.budgetRange) newErrors.budgetRange = "Budget range is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !lead) return;

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      await leadService.updateLead(id, {
        identity: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          residencyStatus: formData.residencyStatus,
          residencyDetails: formData.residencyDetails,
          discoverySource: formData.discoverySource,
          discoveryDetails: formData.discoveryDetails,
        },
        profile: {
          ageGroup: formData.ageGroup,
          professions: formData.professions,
          householdSize: formData.householdSize,
          annualIncomeRange: formData.annualIncomeRange,
          notes: "",
        },
        demographics: {
          ageGroup: formData.ageGroup,
          professions: formData.professions,
          householdSize: formData.householdSize,
          annualIncomeRange: formData.annualIncomeRange,
          notes: "",
        },
        buyerProfile: {
          propertiesPurchasedBefore: parseInt(formData.propertiesPurchasedBefore) || 0,
          propertyPurpose: formData.propertyPurpose,
          propertyPurposeDetails: "",
          buyingMotivation: formData.buyingMotivation,
          buyingMotivationDetails: "",
          shortTermRentalPreference: "",
          assetTypes: formData.assetTypes,
          assetTypesDetails: "",
          waterSourcePreference: "",
          unitConfigurations: [],
          unitConfigurationsDetails: "",
          farmlandSize: "",
          farmlandSizeDetails: "",
          farmlandSizeAcres: undefined,
          farmlandVillaConfig: "",
          journeyStage: formData.journeyStage,
          journeyStageDetails: "",
          explorationDuration: "",
          explorationDurationDetails: "",
          purchaseTimeline: formData.purchaseTimeline,
          purchaseTimelineDetails: "",
          budgetRange: formData.budgetRange,
          budgetRangeDetails: "",
          notes: "",
        },
        assetPreferences: {
          currentLocation: {
            city: formData.currentCity,
            state: formData.currentState,
            country: formData.currentCountry,
          },
          buyingRegions: formData.buyingRegions,
          preferredCountries: [],
          preferredStates: [],
          preferredCities: formData.preferredCities,
          preferredCitiesDetails: "",
          climateRisksToAvoid: [],
          climatePreference: [],
          climatePreferenceDetails: "",
          locationPriorities: [],
          locationPrioritiesDetails: "",
          expansionRadiusKm: "",
          expansionRadiusDetails: "",
          notes: "",
        },
        purchaseReadiness: {
          journeyStage: formData.journeyStage,
          purchaseTimeline: formData.purchaseTimeline,
          budgetRange: formData.budgetRange,
        },
        ownershipPreferences: {
          ownershipStructure: formData.ownershipStructure,
          fundingType: formData.fundingType,
        },
        locationProfile: {
          currentLocation: {
            city: formData.currentCity,
            state: formData.currentState,
            country: formData.currentCountry,
          },
          buyingRegions: formData.buyingRegions,
          preferredCities: formData.preferredCities,
        },
        lifestylePreferences: {
          areaType: formData.areaType,
          areaTypeDetails: "",
          energyPreference: [],
          energyPreferenceDetails: "",
          natureFeature: [],
          natureFeatureDetails: "",
          terrainPreference: [],
          terrainPreferenceDetails: "",
          viewPreferences: [],
          viewPreferencesDetails: "",
          communityFormat: formData.communityFormat,
          communityFormatDetails: "",
          gatedPreference: formData.gatedPreference,
          communityFriendlyFor: [],
          communityFriendlyForDetails: "",
          outdoorAmenities: [],
          notes: "",
        },
        unitPreferences: {
          vastuDirections: [],
          furnishingLevel: formData.furnishingLevel,
          furnishingLevelDetails: "",
          interiorStyle: "",
          interiorStyleDetails: "",
          smartHomeFeatures: formData.smartHomeFeatures,
          smartHomeFeaturesDetails: "",
          mustHaveFeatures: [],
          mustHaveFeaturesDetails: "",
          notes: "",
        },
        notes: formData.notes,
      });

      navigate(`/leads/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update lead");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-gray-400">Loading lead...</div>
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gray-900/50 border-b border-gray-800 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(`/leads/${id}`)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Lead Profile</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Edit Lead</h1>
              <p className="text-gray-400 text-sm mt-1">
                Update information for {lead.identity.fullName}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate(`/leads/${id}`)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const form = document.querySelector('form');
                  if (form) form.requestSubmit();
                }}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {loading ? "Updating..." : "Update Lead"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-400">
            {error}
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <Input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className={`bg-gray-800 border-gray-700 text-white ${errors.fullName ? 'border-red-500' : ''}`}
                  placeholder="Enter full name"
                />
                {errors.fullName && (
                  <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`bg-gray-800 border-gray-700 text-white ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`bg-gray-800 border-gray-700 text-white ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Residency Status *
                </label>
                <select
                  value={formData.residencyStatus}
                  onChange={(e) => handleInputChange("residencyStatus", e.target.value)}
                  className={`w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500 ${errors.residencyStatus ? 'border-red-500' : ''}`}
                >
                  <option value="">Select residency status</option>
                  <option value="Indian Resident">Indian Resident</option>
                  <option value="NRI">NRI</option>
                  <option value="Foreign Citizen">Foreign Citizen</option>
                  <option value="PIO">PIO</option>
                </select>
                {errors.residencyStatus && (
                  <p className="text-red-400 text-sm mt-1">{errors.residencyStatus}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-green-400" />
              </div>
              <h2 className="text-xl font-semibold">Location Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current City
                </label>
                <Input
                  type="text"
                  value={formData.currentCity}
                  onChange={(e) => handleInputChange("currentCity", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current State
                </label>
                <Input
                  type="text"
                  value={formData.currentState}
                  onChange={(e) => handleInputChange("currentState", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Enter state"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Country
                </label>
                <Input
                  type="text"
                  value={formData.currentCountry}
                  onChange={(e) => handleInputChange("currentCountry", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Enter country"
                />
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold">Property Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Budget Range *
                </label>
                <select
                  value={formData.budgetRange}
                  onChange={(e) => handleInputChange("budgetRange", e.target.value)}
                  className={`w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500 ${errors.budgetRange ? 'border-red-500' : ''}`}
                >
                  <option value="">Select budget range</option>
                  <option value="Under ₹50 Lakhs">Under ₹50 Lakhs</option>
                  <option value="₹50 Lakhs - ₹1 Crore">₹50 Lakhs - ₹1 Crore</option>
                  <option value="₹1 Crore - ₹2 Crores">₹1 Crore - ₹2 Crores</option>
                  <option value="₹2 Crores - ₹5 Crores">₹2 Crores - ₹5 Crores</option>
                  <option value="Above ₹5 Crores">Above ₹5 Crores</option>
                </select>
                {errors.budgetRange && (
                  <p className="text-red-400 text-sm mt-1">{errors.budgetRange}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Journey Stage
                </label>
                <select
                  value={formData.journeyStage}
                  onChange={(e) => handleInputChange("journeyStage", e.target.value)}
                  className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select journey stage</option>
                  <option value="Just Started">Just Started</option>
                  <option value="Researching">Researching</option>
                  <option value="Comparing Options">Comparing Options</option>
                  <option value="Ready to Purchase">Ready to Purchase</option>
                  <option value="Site Visits">Site Visits</option>
                  <option value="Negotiation">Negotiation</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lead Source */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-orange-400" />
              </div>
              <h2 className="text-xl font-semibold">Lead Source</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                How did you hear about us? *
              </label>
              <select
                value={formData.discoverySource}
                onChange={(e) => handleInputChange("discoverySource", e.target.value)}
                className={`w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500 ${errors.discoverySource ? 'border-red-500' : ''}`}
              >
                <option value="">Select discovery source</option>
                <option value="Google Search">Google Search</option>
                <option value="Social Media">Social Media</option>
                <option value="Referral">Referral</option>
                <option value="Advertisement">Advertisement</option>
                <option value="Website">Website</option>
                <option value="Event">Event</option>
                <option value="Other">Other</option>
              </select>
              {errors.discoverySource && (
                <p className="text-red-400 text-sm mt-1">{errors.discoverySource}</p>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-cyan-400" />
              </div>
              <h2 className="text-xl font-semibold">Additional Notes</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500 resize-none"
                rows={4}
                placeholder="Any additional notes or requirements..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/leads/${id}`)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Lead
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLeadPage;
