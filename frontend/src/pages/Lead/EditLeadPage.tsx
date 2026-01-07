import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2, User, MapPin, MessageSquare, Users, Target, Briefcase, Heart, Home } from "lucide-react";
import { leadService } from "../../services/leadService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { Lead } from "@/types";

interface LeadFormData {
  fullName: string;
  email: string;
  phone: string;
  residencyStatus: string;
  residencyDetails: string;
  discoverySource: string;
  discoveryDetails: string;
  ageGroup: string;
  professions: string[];
  householdSize: string;
  annualIncomeRange: string;
  demographicsNotes: string;
  propertiesPurchasedBefore: string;
  propertyPurpose: string[];
  propertyPurposeDetails: string;
  buyingMotivation: string[];
  buyingMotivationDetails: string;
  shortTermRentalPreference: string;
  assetTypes: string[];
  assetTypesDetails: string;
  waterSourcePreference: string;
  unitConfigurations: string[];
  unitConfigurationsDetails: string;
  farmlandSize: string;
  farmlandSizeDetails: string;
  farmlandSizeAcres: string;
  farmlandVillaConfig: string;
  journeyStage: string;
  journeyStageDetails: string;
  explorationDuration: string;
  explorationDurationDetails: string;
  purchaseTimeline: string;
  purchaseTimelineDetails: string;
  budgetRange: string;
  budgetRangeDetails: string;
  propertyVisionNotes: string;
  ownershipStructure: string;
  ownershipStructureDetails: string;
  possessionTimeline: string;
  possessionTimelineDetails: string;
  managementModel: string;
  managementModelDetails: string;
  fundingType: string;
  fundingTypeDetails: string;
  investmentNotes: string;
  currentCity: string;
  currentState: string;
  currentCountry: string;
  buyingRegions: string[];
  preferredCountries: string[];
  preferredStates: string[];
  preferredCities: string[];
  preferredCitiesDetails: string;
  climateRisksToAvoid: string[];
  climatePreference: string[];
  climatePreferenceDetails: string;
  locationPriorities: string[];
  locationPrioritiesDetails: string;
  expansionRadiusKm: string;
  expansionRadiusDetails: string;
  locationNotes: string;
  areaType: string[];
  areaTypeDetails: string;
  energyPreference: string[];
  energyPreferenceDetails: string;
  natureFeature: string[];
  natureFeatureDetails: string;
  terrainPreference: string[];
  terrainPreferenceDetails: string;
  viewPreferences: string[];
  viewPreferencesDetails: string;
  communityFormat: string;
  communityFormatDetails: string;
  gatedPreference: string;
  communityFriendlyFor: string[];
  communityFriendlyForDetails: string;
  outdoorAmenities: string[];
  lifestyleNotes: string;
  vastuDirections: string[];
  furnishingLevel: string;
  furnishingLevelDetails: string;
  interiorStyle: string;
  interiorStyleDetails: string;
  smartHomeFeatures: string[];
  smartHomeFeaturesDetails: string;
  mustHaveFeatures: string[];
  mustHaveFeaturesDetails: string;
  unitNotes: string;
  dreamHomeNotes: string;
}

const initialFormData: LeadFormData = {
  fullName: "", email: "", phone: "", residencyStatus: "", residencyDetails: "", discoverySource: "", discoveryDetails: "",
  ageGroup: "", professions: [], householdSize: "", annualIncomeRange: "", demographicsNotes: "",
  propertiesPurchasedBefore: "", propertyPurpose: [], propertyPurposeDetails: "", buyingMotivation: [], buyingMotivationDetails: "",
  shortTermRentalPreference: "", assetTypes: [], assetTypesDetails: "", waterSourcePreference: "", unitConfigurations: [],
  unitConfigurationsDetails: "", farmlandSize: "", farmlandSizeDetails: "", farmlandSizeAcres: "", farmlandVillaConfig: "",
  journeyStage: "", journeyStageDetails: "", explorationDuration: "", explorationDurationDetails: "", purchaseTimeline: "",
  purchaseTimelineDetails: "", budgetRange: "", budgetRangeDetails: "", propertyVisionNotes: "", ownershipStructure: "",
  ownershipStructureDetails: "", possessionTimeline: "", possessionTimelineDetails: "", managementModel: "", managementModelDetails: "",
  fundingType: "", fundingTypeDetails: "", investmentNotes: "", currentCity: "", currentState: "", currentCountry: "India",
  buyingRegions: [], preferredCountries: [], preferredStates: [], preferredCities: [], preferredCitiesDetails: "",
  climateRisksToAvoid: [], climatePreference: [], climatePreferenceDetails: "", locationPriorities: [], locationPrioritiesDetails: "",
  expansionRadiusKm: "", expansionRadiusDetails: "", locationNotes: "", areaType: [], areaTypeDetails: "", energyPreference: [],
  energyPreferenceDetails: "", natureFeature: [], natureFeatureDetails: "", terrainPreference: [], terrainPreferenceDetails: "",
  viewPreferences: [], viewPreferencesDetails: "", communityFormat: "", communityFormatDetails: "", gatedPreference: "",
  communityFriendlyFor: [], communityFriendlyForDetails: "", outdoorAmenities: [], lifestyleNotes: "", vastuDirections: [],
  furnishingLevel: "", furnishingLevelDetails: "", interiorStyle: "", interiorStyleDetails: "", smartHomeFeatures: [],
  smartHomeFeaturesDetails: "", mustHaveFeatures: [], mustHaveFeaturesDetails: "", unitNotes: "", dreamHomeNotes: "",
};

const EditLeadPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<LeadFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchLead = async () => {
      if (!id) return;
      try {
        const response = await leadService.getLeadById(id);
        const l = response.data;
        setLead(l);
        setFormData({
          fullName: l.identity?.fullName || "",
          email: l.identity?.email || "",
          phone: l.identity?.phone || "",
          residencyStatus: l.identity?.residencyStatus || "",
          residencyDetails: l.identity?.residencyDetails || "",
          discoverySource: l.identity?.discoverySource || "",
          discoveryDetails: l.identity?.discoveryDetails || "",
          ageGroup: l.demographics?.ageGroup || "",
          professions: l.demographics?.professions || [],
          householdSize: l.demographics?.householdSize || "",
          annualIncomeRange: l.demographics?.annualIncomeRange || "",
          demographicsNotes: l.demographics?.notes || "",
          propertiesPurchasedBefore: String(l.propertyVision?.propertiesPurchasedBefore || ""),
          propertyPurpose: l.propertyVision?.propertyPurpose || [],
          propertyPurposeDetails: l.propertyVision?.propertyPurposeDetails || "",
          buyingMotivation: l.propertyVision?.buyingMotivation || [],
          buyingMotivationDetails: l.propertyVision?.buyingMotivationDetails || "",
          shortTermRentalPreference: l.propertyVision?.shortTermRentalPreference || "",
          assetTypes: l.propertyVision?.assetTypes || [],
          assetTypesDetails: l.propertyVision?.assetTypesDetails || "",
          waterSourcePreference: l.propertyVision?.waterSourcePreference || "",
          unitConfigurations: l.propertyVision?.unitConfigurations || [],
          unitConfigurationsDetails: l.propertyVision?.unitConfigurationsDetails || "",
          farmlandSize: l.propertyVision?.farmlandSize || "",
          farmlandSizeDetails: l.propertyVision?.farmlandSizeDetails || "",
          farmlandSizeAcres: String(l.propertyVision?.farmlandSizeAcres || ""),
          farmlandVillaConfig: l.propertyVision?.farmlandVillaConfig || "",
          journeyStage: l.propertyVision?.journeyStage || "",
          journeyStageDetails: l.propertyVision?.journeyStageDetails || "",
          explorationDuration: l.propertyVision?.explorationDuration || "",
          explorationDurationDetails: l.propertyVision?.explorationDurationDetails || "",
          purchaseTimeline: l.propertyVision?.purchaseTimeline || "",
          purchaseTimelineDetails: l.propertyVision?.purchaseTimelineDetails || "",
          budgetRange: l.propertyVision?.budgetRange || "",
          budgetRangeDetails: l.propertyVision?.budgetRangeDetails || "",
          propertyVisionNotes: l.propertyVision?.notes || "",
          ownershipStructure: l.investmentPreferences?.ownershipStructure || "",
          ownershipStructureDetails: l.investmentPreferences?.ownershipStructureDetails || "",
          possessionTimeline: l.investmentPreferences?.possessionTimeline || "",
          possessionTimelineDetails: l.investmentPreferences?.possessionTimelineDetails || "",
          managementModel: l.investmentPreferences?.managementModel || "",
          managementModelDetails: l.investmentPreferences?.managementModelDetails || "",
          fundingType: l.investmentPreferences?.fundingType || "",
          fundingTypeDetails: l.investmentPreferences?.fundingTypeDetails || "",
          investmentNotes: l.investmentPreferences?.notes || "",
          currentCity: l.locationPreferences?.currentLocation?.city || "",
          currentState: l.locationPreferences?.currentLocation?.state || "",
          currentCountry: l.locationPreferences?.currentLocation?.country || "India",
          buyingRegions: l.locationPreferences?.buyingRegions || [],
          preferredCountries: l.locationPreferences?.preferredCountries || [],
          preferredStates: l.locationPreferences?.preferredStates || [],
          preferredCities: l.locationPreferences?.preferredCities || [],
          preferredCitiesDetails: l.locationPreferences?.preferredCitiesDetails || "",
          climateRisksToAvoid: l.locationPreferences?.climateRisksToAvoid || [],
          climatePreference: l.locationPreferences?.climatePreference || [],
          climatePreferenceDetails: l.locationPreferences?.climatePreferenceDetails || "",
          locationPriorities: l.locationPreferences?.locationPriorities || [],
          locationPrioritiesDetails: l.locationPreferences?.locationPrioritiesDetails || "",
          expansionRadiusKm: l.locationPreferences?.expansionRadiusKm || "",
          expansionRadiusDetails: l.locationPreferences?.expansionRadiusDetails || "",
          locationNotes: l.locationPreferences?.notes || "",
          areaType: l.lifestylePreferences?.areaType || [],
          areaTypeDetails: l.lifestylePreferences?.areaTypeDetails || "",
          energyPreference: l.lifestylePreferences?.energyPreference || [],
          energyPreferenceDetails: l.lifestylePreferences?.energyPreferenceDetails || "",
          natureFeature: l.lifestylePreferences?.natureFeature || [],
          natureFeatureDetails: l.lifestylePreferences?.natureFeatureDetails || "",
          terrainPreference: l.lifestylePreferences?.terrainPreference || [],
          terrainPreferenceDetails: l.lifestylePreferences?.terrainPreferenceDetails || "",
          viewPreferences: l.lifestylePreferences?.viewPreferences || [],
          viewPreferencesDetails: l.lifestylePreferences?.viewPreferencesDetails || "",
          communityFormat: l.lifestylePreferences?.communityFormat || "",
          communityFormatDetails: l.lifestylePreferences?.communityFormatDetails || "",
          gatedPreference: l.lifestylePreferences?.gatedPreference || "",
          communityFriendlyFor: l.lifestylePreferences?.communityFriendlyFor || [],
          communityFriendlyForDetails: l.lifestylePreferences?.communityFriendlyForDetails || "",
          outdoorAmenities: l.lifestylePreferences?.outdoorAmenities || [],
          lifestyleNotes: l.lifestylePreferences?.notes || "",
          vastuDirections: l.unitPreferences?.vastuDirections || [],
          furnishingLevel: l.unitPreferences?.furnishingLevel || "",
          furnishingLevelDetails: l.unitPreferences?.furnishingLevelDetails || "",
          interiorStyle: l.unitPreferences?.interiorStyle || "",
          interiorStyleDetails: l.unitPreferences?.interiorStyleDetails || "",
          smartHomeFeatures: l.unitPreferences?.smartHomeFeatures || [],
          smartHomeFeaturesDetails: l.unitPreferences?.smartHomeFeaturesDetails || "",
          mustHaveFeatures: l.unitPreferences?.mustHaveFeatures || [],
          mustHaveFeaturesDetails: l.unitPreferences?.mustHaveFeaturesDetails || "",
          unitNotes: l.unitPreferences?.notes || "",
          dreamHomeNotes: l.dreamHomeNotes || "",
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
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handleCheckboxChange = (field: keyof LeadFormData, value: string, checked: boolean) => {
    const currentValues = formData[field] as string[];
    if (checked) {
      handleInputChange(field, [...currentValues, value]);
    } else {
      handleInputChange(field, currentValues.filter(v => v !== value));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
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
          fullName: formData.fullName, email: formData.email, phone: formData.phone,
          residencyStatus: formData.residencyStatus, residencyDetails: formData.residencyDetails,
          discoverySource: formData.discoverySource, discoveryDetails: formData.discoveryDetails,
        },
        demographics: {
          ageGroup: formData.ageGroup, professions: formData.professions, householdSize: formData.householdSize,
          annualIncomeRange: formData.annualIncomeRange, notes: formData.demographicsNotes,
        },
        propertyVision: {
          propertiesPurchasedBefore: parseInt(formData.propertiesPurchasedBefore) || 0,
          propertyPurpose: formData.propertyPurpose, propertyPurposeDetails: formData.propertyPurposeDetails,
          buyingMotivation: formData.buyingMotivation, buyingMotivationDetails: formData.buyingMotivationDetails,
          shortTermRentalPreference: formData.shortTermRentalPreference, assetTypes: formData.assetTypes,
          assetTypesDetails: formData.assetTypesDetails, waterSourcePreference: formData.waterSourcePreference,
          unitConfigurations: formData.unitConfigurations, unitConfigurationsDetails: formData.unitConfigurationsDetails,
          farmlandSize: formData.farmlandSize, farmlandSizeDetails: formData.farmlandSizeDetails,
          farmlandSizeAcres: parseFloat(formData.farmlandSizeAcres) || undefined, farmlandVillaConfig: formData.farmlandVillaConfig,
          journeyStage: formData.journeyStage, journeyStageDetails: formData.journeyStageDetails,
          explorationDuration: formData.explorationDuration, explorationDurationDetails: formData.explorationDurationDetails,
          purchaseTimeline: formData.purchaseTimeline, purchaseTimelineDetails: formData.purchaseTimelineDetails,
          budgetRange: formData.budgetRange, budgetRangeDetails: formData.budgetRangeDetails, notes: formData.propertyVisionNotes,
        },
        investmentPreferences: {
          ownershipStructure: formData.ownershipStructure, ownershipStructureDetails: formData.ownershipStructureDetails,
          possessionTimeline: formData.possessionTimeline, possessionTimelineDetails: formData.possessionTimelineDetails,
          managementModel: formData.managementModel, managementModelDetails: formData.managementModelDetails,
          fundingType: formData.fundingType, fundingTypeDetails: formData.fundingTypeDetails, notes: formData.investmentNotes,
        },
        locationPreferences: {
          currentLocation: { city: formData.currentCity, state: formData.currentState, country: formData.currentCountry },
          buyingRegions: formData.buyingRegions, preferredCountries: formData.preferredCountries,
          preferredStates: formData.preferredStates, preferredCities: formData.preferredCities,
          preferredCitiesDetails: formData.preferredCitiesDetails, climateRisksToAvoid: formData.climateRisksToAvoid,
          climatePreference: formData.climatePreference, climatePreferenceDetails: formData.climatePreferenceDetails,
          locationPriorities: formData.locationPriorities, locationPrioritiesDetails: formData.locationPrioritiesDetails,
          expansionRadiusKm: formData.expansionRadiusKm, expansionRadiusDetails: formData.expansionRadiusDetails,
          notes: formData.locationNotes,
        },
        lifestylePreferences: {
          areaType: formData.areaType, areaTypeDetails: formData.areaTypeDetails, energyPreference: formData.energyPreference,
          energyPreferenceDetails: formData.energyPreferenceDetails, natureFeature: formData.natureFeature,
          natureFeatureDetails: formData.natureFeatureDetails, terrainPreference: formData.terrainPreference,
          terrainPreferenceDetails: formData.terrainPreferenceDetails, viewPreferences: formData.viewPreferences,
          viewPreferencesDetails: formData.viewPreferencesDetails, communityFormat: formData.communityFormat,
          communityFormatDetails: formData.communityFormatDetails, gatedPreference: formData.gatedPreference,
          communityFriendlyFor: formData.communityFriendlyFor, communityFriendlyForDetails: formData.communityFriendlyForDetails,
          outdoorAmenities: formData.outdoorAmenities, notes: formData.lifestyleNotes,
        },
        unitPreferences: {
          vastuDirections: formData.vastuDirections, furnishingLevel: formData.furnishingLevel,
          furnishingLevelDetails: formData.furnishingLevelDetails, interiorStyle: formData.interiorStyle,
          interiorStyleDetails: formData.interiorStyleDetails, smartHomeFeatures: formData.smartHomeFeatures,
          smartHomeFeaturesDetails: formData.smartHomeFeaturesDetails, mustHaveFeatures: formData.mustHaveFeatures,
          mustHaveFeaturesDetails: formData.mustHaveFeaturesDetails, notes: formData.unitNotes,
        },
        dreamHomeNotes: formData.dreamHomeNotes,
      });
      navigate(`/leads/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update lead");
    } finally {
      setLoading(false);
    }
  };

  const CheckboxGroup = ({ field, options, columns = 2 }: { field: keyof LeadFormData; options: string[]; columns?: number }) => (
    <div className={`grid grid-cols-${columns} gap-2`}>
      {options.map((option) => (
        <label key={option} className="flex items-center space-x-2 cursor-pointer">
          <Checkbox checked={(formData[field] as string[]).includes(option)} onCheckedChange={(checked) => handleCheckboxChange(field, option, !!checked)} />
          <span className="text-sm">{option}</span>
        </label>
      ))}
    </div>
  );

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
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
      <div className="bg-gray-900/50 border-b border-gray-800 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => navigate(`/leads/${id}`)} className="flex items-center gap-2 text-gray-400 hover:text-white transition">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Lead Profile</span>
            </button>
          </div>
          <h1 className="text-2xl font-bold">Edit Lead</h1>
          <p className="text-gray-400 text-sm mt-1">Update information for {lead.identity?.fullName}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Identity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center"><User className="h-4 w-4 text-blue-400" /></div>
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name <span className="text-red-400">*</span></Label>
                  <Input id="fullName" value={formData.fullName} onChange={(e) => handleInputChange("fullName", e.target.value)} className={errors.fullName ? 'border-red-500' : ''} />
                  {errors.fullName && <p className="text-red-400 text-sm">{errors.fullName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-red-400">*</span></Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} className={errors.email ? 'border-red-500' : ''} />
                  {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="residencyStatus">Residency Status</Label>
                  <Select id="residencyStatus" value={formData.residencyStatus} onChange={(e) => handleInputChange("residencyStatus", e.target.value)}>
                    <option value="">Select status</option>
                    <option value="Indian Resident">Indian Resident</option>
                    <option value="NRI">NRI</option>
                    <option value="Foreign Citizen">Foreign Citizen</option>
                    <option value="PIO">PIO</option>
                    <option value="OCI">OCI</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="residencyDetails">Residency Details</Label>
                  <Input id="residencyDetails" value={formData.residencyDetails} onChange={(e) => handleInputChange("residencyDetails", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discoverySource">Discovery Source</Label>
                  <Select id="discoverySource" value={formData.discoverySource} onChange={(e) => handleInputChange("discoverySource", e.target.value)}>
                    <option value="">Select source</option>
                    <option value="Google Search">Google Search</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Referral">Referral</option>
                    <option value="Advertisement">Advertisement</option>
                    <option value="Website">Website</option>
                    <option value="Event">Event</option>
                    <option value="Cold Call">Cold Call</option>
                    <option value="Email Campaign">Email Campaign</option>
                    <option value="Other">Other</option>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="discoveryDetails">Discovery Details</Label>
                  <Input id="discoveryDetails" value={formData.discoveryDetails} onChange={(e) => handleInputChange("discoveryDetails", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Demographics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center"><Users className="h-4 w-4 text-green-400" /></div>
                Demographics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="ageGroup">Age Group</Label>
                  <Select id="ageGroup" value={formData.ageGroup} onChange={(e) => handleInputChange("ageGroup", e.target.value)}>
                    <option value="">Select age group</option>
                    <option value="18-25">18-25</option><option value="26-35">26-35</option><option value="36-45">36-45</option>
                    <option value="46-55">46-55</option><option value="56-65">56-65</option><option value="65+">65+</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="householdSize">Household Size</Label>
                  <Select id="householdSize" value={formData.householdSize} onChange={(e) => handleInputChange("householdSize", e.target.value)}>
                    <option value="">Select size</option>
                    <option value="1">1</option><option value="2">2</option><option value="3-4">3-4</option><option value="5-6">5-6</option><option value="7+">7+</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annualIncomeRange">Annual Income Range</Label>
                  <Select id="annualIncomeRange" value={formData.annualIncomeRange} onChange={(e) => handleInputChange("annualIncomeRange", e.target.value)}>
                    <option value="">Select range</option>
                    <option value="Under ₹10 Lakhs">Under ₹10 Lakhs</option><option value="₹10-25 Lakhs">₹10-25 Lakhs</option>
                    <option value="₹25-50 Lakhs">₹25-50 Lakhs</option><option value="₹50 Lakhs - ₹1 Crore">₹50 Lakhs - ₹1 Crore</option>
                    <option value="₹1-2 Crores">₹1-2 Crores</option><option value="Above ₹2 Crores">Above ₹2 Crores</option>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Professions</Label>
                <CheckboxGroup field="professions" options={["Business Owner", "Salaried Professional", "Self Employed", "Doctor", "Lawyer", "IT Professional", "Investor", "Retired", "NRI Professional", "Other"]} columns={4} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demographicsNotes">Notes</Label>
                <Textarea id="demographicsNotes" value={formData.demographicsNotes} onChange={(e) => handleInputChange("demographicsNotes", e.target.value)} rows={2} />
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Property Vision */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center"><Target className="h-4 w-4 text-purple-400" /></div>
                Property Vision
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="propertiesPurchasedBefore">Properties Purchased Before</Label>
                  <Input id="propertiesPurchasedBefore" type="number" value={formData.propertiesPurchasedBefore} onChange={(e) => handleInputChange("propertiesPurchasedBefore", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortTermRentalPreference">Short Term Rental Preference</Label>
                  <Select id="shortTermRentalPreference" value={formData.shortTermRentalPreference} onChange={(e) => handleInputChange("shortTermRentalPreference", e.target.value)}>
                    <option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option><option value="Maybe">Maybe</option><option value="Open to it">Open to it</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waterSourcePreference">Water Source Preference</Label>
                  <Select id="waterSourcePreference" value={formData.waterSourcePreference} onChange={(e) => handleInputChange("waterSourcePreference", e.target.value)}>
                    <option value="">Select</option><option value="Borewell">Borewell</option><option value="Municipal">Municipal</option><option value="Lake/River nearby">Lake/River nearby</option><option value="Rainwater Harvesting">Rainwater Harvesting</option><option value="Any">Any</option>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Property Purpose</Label>
                <CheckboxGroup field="propertyPurpose" options={["Primary Residence", "Second Home", "Investment", "Rental Income", "Vacation Home", "Retirement", "Weekend Getaway", "Farmhouse Living"]} columns={4} />
                <Input className="mt-2" value={formData.propertyPurposeDetails} onChange={(e) => handleInputChange("propertyPurposeDetails", e.target.value)} placeholder="Additional details" />
              </div>
              <div className="space-y-2">
                <Label>Buying Motivation</Label>
                <CheckboxGroup field="buyingMotivation" options={["First Home", "Family Needs", "Passive Income", "Asset Appreciation", "Portfolio Diversification", "Leisure", "Tax Benefits", "Legacy Planning"]} columns={4} />
                <Input className="mt-2" value={formData.buyingMotivationDetails} onChange={(e) => handleInputChange("buyingMotivationDetails", e.target.value)} placeholder="Additional details" />
              </div>
              <div className="space-y-2">
                <Label>Asset Types</Label>
                <CheckboxGroup field="assetTypes" options={["Villa", "Apartment", "Farmland", "Plot", "Farmhouse", "Penthouse", "Row House", "Commercial"]} columns={4} />
                <Input className="mt-2" value={formData.assetTypesDetails} onChange={(e) => handleInputChange("assetTypesDetails", e.target.value)} placeholder="Additional details" />
              </div>
              <div className="space-y-2">
                <Label>Unit Configurations</Label>
                <CheckboxGroup field="unitConfigurations" options={["1BHK", "2BHK", "3BHK", "4BHK", "5BHK+", "Studio", "Duplex", "Triplex"]} columns={4} />
                <Input className="mt-2" value={formData.unitConfigurationsDetails} onChange={(e) => handleInputChange("unitConfigurationsDetails", e.target.value)} placeholder="Additional details" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="farmlandSize">Farmland Size</Label>
                  <Select id="farmlandSize" value={formData.farmlandSize} onChange={(e) => handleInputChange("farmlandSize", e.target.value)}>
                    <option value="">Select</option><option value="Less than 1 acre">Less than 1 acre</option><option value="1-2 acres">1-2 acres</option><option value="2-5 acres">2-5 acres</option><option value="5-10 acres">5-10 acres</option><option value="10+ acres">10+ acres</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="farmlandSizeAcres">Exact Acreage</Label>
                  <Input id="farmlandSizeAcres" type="number" step="0.1" value={formData.farmlandSizeAcres} onChange={(e) => handleInputChange("farmlandSizeAcres", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="farmlandVillaConfig">Farmland Villa Config</Label>
                  <Input id="farmlandVillaConfig" value={formData.farmlandVillaConfig} onChange={(e) => handleInputChange("farmlandVillaConfig", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="journeyStage">Journey Stage</Label>
                  <Select id="journeyStage" value={formData.journeyStage} onChange={(e) => handleInputChange("journeyStage", e.target.value)}>
                    <option value="">Select</option><option value="Just Started">Just Started</option><option value="Exploring">Exploring</option><option value="Researching">Researching</option><option value="Shortlisting">Shortlisting</option><option value="Site Visits">Site Visits</option><option value="Comparing Options">Comparing Options</option><option value="Ready to Purchase">Ready to Purchase</option><option value="Negotiation">Negotiation</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="explorationDuration">Exploration Duration</Label>
                  <Select id="explorationDuration" value={formData.explorationDuration} onChange={(e) => handleInputChange("explorationDuration", e.target.value)}>
                    <option value="">Select</option><option value="Just started">Just started</option><option value="1-3 months">1-3 months</option><option value="3-6 months">3-6 months</option><option value="6-12 months">6-12 months</option><option value="1+ year">1+ year</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchaseTimeline">Purchase Timeline</Label>
                  <Select id="purchaseTimeline" value={formData.purchaseTimeline} onChange={(e) => handleInputChange("purchaseTimeline", e.target.value)}>
                    <option value="">Select</option><option value="Immediate">Immediate</option><option value="Within 3 months">Within 3 months</option><option value="Within 6 months">Within 6 months</option><option value="6-12 months">6-12 months</option><option value="1+ year">1+ year</option><option value="Not decided">Not decided</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budgetRange">Budget Range</Label>
                  <Select id="budgetRange" value={formData.budgetRange} onChange={(e) => handleInputChange("budgetRange", e.target.value)}>
                    <option value="">Select</option><option value="Under ₹25 Lakhs">Under ₹25 Lakhs</option><option value="₹25-50 Lakhs">₹25-50 Lakhs</option><option value="₹50 Lakhs - ₹1 Crore">₹50 Lakhs - ₹1 Crore</option><option value="₹1-2 Crores">₹1-2 Crores</option><option value="₹2-5 Crores">₹2-5 Crores</option><option value="₹5-10 Crores">₹5-10 Crores</option><option value="Above ₹10 Crores">Above ₹10 Crores</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budgetRangeDetails">Budget Details</Label>
                  <Input id="budgetRangeDetails" value={formData.budgetRangeDetails} onChange={(e) => handleInputChange("budgetRangeDetails", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="propertyVisionNotes">Property Vision Notes</Label>
                <Textarea id="propertyVisionNotes" value={formData.propertyVisionNotes} onChange={(e) => handleInputChange("propertyVisionNotes", e.target.value)} rows={2} />
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Investment Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center"><Briefcase className="h-4 w-4 text-emerald-400" /></div>
                Investment Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="ownershipStructure">Ownership Structure</Label>
                  <Select id="ownershipStructure" value={formData.ownershipStructure} onChange={(e) => handleInputChange("ownershipStructure", e.target.value)}>
                    <option value="">Select</option><option value="Individual">Individual</option><option value="Joint">Joint</option><option value="Trust">Trust</option><option value="Company">Company</option><option value="Partnership">Partnership</option><option value="HUF">HUF</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownershipStructureDetails">Ownership Details</Label>
                  <Input id="ownershipStructureDetails" value={formData.ownershipStructureDetails} onChange={(e) => handleInputChange("ownershipStructureDetails", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="possessionTimeline">Possession Timeline</Label>
                  <Select id="possessionTimeline" value={formData.possessionTimeline} onChange={(e) => handleInputChange("possessionTimeline", e.target.value)}>
                    <option value="">Select</option><option value="Ready to move">Ready to move</option><option value="Within 6 months">Within 6 months</option><option value="Within 1 year">Within 1 year</option><option value="1-2 years">1-2 years</option><option value="Under construction OK">Under construction OK</option><option value="Flexible">Flexible</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="possessionTimelineDetails">Possession Details</Label>
                  <Input id="possessionTimelineDetails" value={formData.possessionTimelineDetails} onChange={(e) => handleInputChange("possessionTimelineDetails", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managementModel">Management Model</Label>
                  <Select id="managementModel" value={formData.managementModel} onChange={(e) => handleInputChange("managementModel", e.target.value)}>
                    <option value="">Select</option><option value="Self-managed">Self-managed</option><option value="Property Management Company">Property Management Company</option><option value="Caretaker">Caretaker</option><option value="Developer Managed">Developer Managed</option><option value="Undecided">Undecided</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="managementModelDetails">Management Details</Label>
                  <Input id="managementModelDetails" value={formData.managementModelDetails} onChange={(e) => handleInputChange("managementModelDetails", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fundingType">Funding Type</Label>
                  <Select id="fundingType" value={formData.fundingType} onChange={(e) => handleInputChange("fundingType", e.target.value)}>
                    <option value="">Select</option><option value="Self-funded">Self-funded</option><option value="Home Loan">Home Loan</option><option value="Bank Loan">Bank Loan</option><option value="Mixed">Mixed</option><option value="NRI Loan">NRI Loan</option><option value="Undecided">Undecided</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fundingTypeDetails">Funding Details</Label>
                  <Input id="fundingTypeDetails" value={formData.fundingTypeDetails} onChange={(e) => handleInputChange("fundingTypeDetails", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="investmentNotes">Investment Notes</Label>
                <Textarea id="investmentNotes" value={formData.investmentNotes} onChange={(e) => handleInputChange("investmentNotes", e.target.value)} rows={2} />
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Location Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center"><MapPin className="h-4 w-4 text-orange-400" /></div>
                Location Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2"><Label htmlFor="currentCity">Current City</Label><Input id="currentCity" value={formData.currentCity} onChange={(e) => handleInputChange("currentCity", e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="currentState">Current State</Label><Input id="currentState" value={formData.currentState} onChange={(e) => handleInputChange("currentState", e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="currentCountry">Current Country</Label><Input id="currentCountry" value={formData.currentCountry} onChange={(e) => handleInputChange("currentCountry", e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Buying Regions</Label><CheckboxGroup field="buyingRegions" options={["North India", "South India", "East India", "West India", "Central India", "Goa", "Hill Stations", "Coastal Areas"]} columns={4} /></div>
              <div className="space-y-2"><Label>Preferred States</Label><CheckboxGroup field="preferredStates" options={["Karnataka", "Tamil Nadu", "Kerala", "Andhra Pradesh", "Telangana", "Maharashtra", "Goa", "Rajasthan", "Himachal Pradesh", "Uttarakhand"]} columns={5} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><Label>Preferred Cities</Label><Input value={formData.preferredCities.join(", ")} onChange={(e) => handleInputChange("preferredCities", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} placeholder="Comma separated" /></div>
                <div className="space-y-2"><Label>Preferred Cities Details</Label><Input value={formData.preferredCitiesDetails} onChange={(e) => handleInputChange("preferredCitiesDetails", e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Climate Risks to Avoid</Label><CheckboxGroup field="climateRisksToAvoid" options={["Flood prone", "Earthquake zone", "Cyclone area", "Industrial area", "High pollution", "Water scarcity"]} columns={3} /></div>
              <div className="space-y-2"><Label>Climate Preference</Label><CheckboxGroup field="climatePreference" options={["Cool", "Moderate", "Warm", "Tropical", "Dry", "Humid"]} columns={3} /><Input className="mt-2" value={formData.climatePreferenceDetails} onChange={(e) => handleInputChange("climatePreferenceDetails", e.target.value)} /></div>
              <div className="space-y-2"><Label>Location Priorities</Label><CheckboxGroup field="locationPriorities" options={["Connectivity", "Appreciation Potential", "Proximity to Work", "Good Schools", "Hospitals Nearby", "Airport Access", "Scenic Beauty", "Privacy", "Security"]} columns={3} /><Input className="mt-2" value={formData.locationPrioritiesDetails} onChange={(e) => handleInputChange("locationPrioritiesDetails", e.target.value)} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><Label>Expansion Radius (km)</Label><Input value={formData.expansionRadiusKm} onChange={(e) => handleInputChange("expansionRadiusKm", e.target.value)} /></div>
                <div className="space-y-2"><Label>Expansion Radius Details</Label><Input value={formData.expansionRadiusDetails} onChange={(e) => handleInputChange("expansionRadiusDetails", e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Location Notes</Label><Textarea value={formData.locationNotes} onChange={(e) => handleInputChange("locationNotes", e.target.value)} rows={2} /></div>
            </CardContent>
          </Card>

          {/* Section 6: Lifestyle Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center"><Heart className="h-4 w-4 text-pink-400" /></div>
                Lifestyle & Community
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2"><Label>Area Type</Label><CheckboxGroup field="areaType" options={["Urban", "Suburban", "Rural", "Hill Station", "Coastal", "Forest"]} columns={3} /><Input className="mt-2" value={formData.areaTypeDetails} onChange={(e) => handleInputChange("areaTypeDetails", e.target.value)} /></div>
              <div className="space-y-2"><Label>Energy Preference</Label><CheckboxGroup field="energyPreference" options={["Solar", "Grid Power", "Off-grid capable", "Backup Generator", "Wind Energy"]} columns={3} /><Input className="mt-2" value={formData.energyPreferenceDetails} onChange={(e) => handleInputChange("energyPreferenceDetails", e.target.value)} /></div>
              <div className="space-y-2"><Label>Nature Features</Label><CheckboxGroup field="natureFeature" options={["Garden", "Forest", "Lake/Pond", "River", "Mountains", "Beach", "Orchards", "Farmland"]} columns={4} /><Input className="mt-2" value={formData.natureFeatureDetails} onChange={(e) => handleInputChange("natureFeatureDetails", e.target.value)} /></div>
              <div className="space-y-2"><Label>Terrain Preference</Label><CheckboxGroup field="terrainPreference" options={["Flat", "Hilly", "Sloped", "Valley", "Plateau"]} columns={5} /><Input className="mt-2" value={formData.terrainPreferenceDetails} onChange={(e) => handleInputChange("terrainPreferenceDetails", e.target.value)} /></div>
              <div className="space-y-2"><Label>View Preferences</Label><CheckboxGroup field="viewPreferences" options={["Garden View", "Mountain View", "Valley View", "Lake View", "City View", "Forest View", "Ocean View", "Pool View"]} columns={4} /><Input className="mt-2" value={formData.viewPreferencesDetails} onChange={(e) => handleInputChange("viewPreferencesDetails", e.target.value)} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Community Format</Label>
                  <Select value={formData.communityFormat} onChange={(e) => handleInputChange("communityFormat", e.target.value)}>
                    <option value="">Select</option><option value="Standalone">Standalone</option><option value="Gated Community">Gated Community</option><option value="Township">Township</option><option value="Apartment Complex">Apartment Complex</option><option value="Mixed Use">Mixed Use</option><option value="Farm Community">Farm Community</option>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Community Format Details</Label><Input value={formData.communityFormatDetails} onChange={(e) => handleInputChange("communityFormatDetails", e.target.value)} /></div>
                <div className="space-y-2">
                  <Label>Gated Community Preference</Label>
                  <Select value={formData.gatedPreference} onChange={(e) => handleInputChange("gatedPreference", e.target.value)}>
                    <option value="">Select</option><option value="Must Have">Must Have</option><option value="Preferred">Preferred</option><option value="Not Important">Not Important</option><option value="Not Preferred">Not Preferred</option>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label>Community Friendly For</Label><CheckboxGroup field="communityFriendlyFor" options={["Families", "Seniors", "Singles", "Couples", "Children", "Pets", "Work from Home"]} columns={4} /><Input className="mt-2" value={formData.communityFriendlyForDetails} onChange={(e) => handleInputChange("communityFriendlyForDetails", e.target.value)} /></div>
              <div className="space-y-2"><Label>Outdoor Amenities</Label><CheckboxGroup field="outdoorAmenities" options={["Swimming Pool", "Clubhouse", "Gym", "Tennis Court", "Jogging Track", "Children Play Area", "Landscaped Garden", "Private Pool", "Outdoor Kitchen", "Sports Facilities"]} columns={5} /></div>
              <div className="space-y-2"><Label>Lifestyle Notes</Label><Textarea value={formData.lifestyleNotes} onChange={(e) => handleInputChange("lifestyleNotes", e.target.value)} rows={2} /></div>
            </CardContent>
          </Card>

          {/* Section 7: Unit Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center"><Home className="h-4 w-4 text-indigo-400" /></div>
                Unit Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2"><Label>Vastu Directions</Label><CheckboxGroup field="vastuDirections" options={["East Facing", "North Facing", "West Facing", "South Facing", "North-East", "South-East", "North-West", "South-West", "Not Important"]} columns={3} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Furnishing Level</Label>
                  <Select value={formData.furnishingLevel} onChange={(e) => handleInputChange("furnishingLevel", e.target.value)}>
                    <option value="">Select</option><option value="Unfurnished">Unfurnished</option><option value="Semi Furnished">Semi Furnished</option><option value="Fully Furnished">Fully Furnished</option><option value="Luxury Furnished">Luxury Furnished</option>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Furnishing Details</Label><Input value={formData.furnishingLevelDetails} onChange={(e) => handleInputChange("furnishingLevelDetails", e.target.value)} /></div>
                <div className="space-y-2">
                  <Label>Interior Style</Label>
                  <Select value={formData.interiorStyle} onChange={(e) => handleInputChange("interiorStyle", e.target.value)}>
                    <option value="">Select</option><option value="Modern">Modern</option><option value="Contemporary">Contemporary</option><option value="Traditional">Traditional</option><option value="Rustic">Rustic</option><option value="Minimalist">Minimalist</option><option value="Luxury">Luxury</option><option value="Eclectic">Eclectic</option>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Interior Style Details</Label><Input value={formData.interiorStyleDetails} onChange={(e) => handleInputChange("interiorStyleDetails", e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Smart Home Features</Label><CheckboxGroup field="smartHomeFeatures" options={["Home Automation", "Security System", "Smart Lighting", "Climate Control", "Entertainment System", "Voice Control", "CCTV", "Smart Locks"]} columns={4} /><Input className="mt-2" value={formData.smartHomeFeaturesDetails} onChange={(e) => handleInputChange("smartHomeFeaturesDetails", e.target.value)} /></div>
              <div className="space-y-2"><Label>Must Have Features</Label><CheckboxGroup field="mustHaveFeatures" options={["Large Kitchen", "Multiple Parking", "Staff Quarters", "Home Office", "Prayer Room", "Terrace Garden", "Private Garden", "Basement", "Attic", "Utility Room"]} columns={5} /><Input className="mt-2" value={formData.mustHaveFeaturesDetails} onChange={(e) => handleInputChange("mustHaveFeaturesDetails", e.target.value)} /></div>
              <div className="space-y-2"><Label>Unit Preferences Notes</Label><Textarea value={formData.unitNotes} onChange={(e) => handleInputChange("unitNotes", e.target.value)} rows={2} /></div>
            </CardContent>
          </Card>

          {/* Section 8: Dream Home Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center"><MessageSquare className="h-4 w-4 text-cyan-400" /></div>
                Dream Home Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="dreamHomeNotes">Describe your dream home</Label>
                <Textarea id="dreamHomeNotes" value={formData.dreamHomeNotes} onChange={(e) => handleInputChange("dreamHomeNotes", e.target.value)} rows={4} />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-800">
            <Button type="button" variant="outline" onClick={() => navigate(`/leads/${id}`)} disabled={loading} className="px-8">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 px-8">
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Updating...</> : <><Save className="h-4 w-4 mr-2" />Update Lead</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLeadPage;
