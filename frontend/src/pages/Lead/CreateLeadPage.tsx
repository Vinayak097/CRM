import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, User, Mail, Phone, MapPin, DollarSign, Calendar, MessageSquare, Users, Target, Briefcase, Heart, Home } from "lucide-react";
import { leadService } from "../../services/leadService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface LeadFormData {
  // Basic Informationle
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

const CreateLeadPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    if (!formData.currentCity.trim()) newErrors.currentCity = "Current city is required";
    if (!formData.budgetRange) newErrors.budgetRange = "Budget range is required";
    if (formData.propertyPurpose.length === 0) newErrors.propertyPurpose = "Property purpose is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      await leadService.createLead({
        identity: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          residencyStatus: formData.residencyStatus,
          residencyDetails: formData.residencyDetails,
          discoverySource: formData.discoverySource,
          discoveryDetails: formData.discoveryDetails,
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

      navigate("/leads");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gray-900/50 border-b border-gray-800 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/leads")}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Leads</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Create New Lead</h1>
              <p className="text-gray-400 text-sm mt-1">Fill in the details to create a new lead</p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/leads")}
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
                {loading ? "Creating..." : "Create Lead"}
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-400" />
                </div>
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Full Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className={errors.fullName ? 'border-red-500' : ''}
                    placeholder="Enter full name"
                  />
                  {errors.fullName && (
                    <p className="text-red-400 text-sm">{errors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={errors.email ? 'border-red-500' : ''}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={errors.phone ? 'border-red-500' : ''}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-sm">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="residencyStatus">
                    Residency Status <span className="text-red-400">*</span>
                  </Label>
                  <Select
                    id="residencyStatus"
                    value={formData.residencyStatus}
                    onChange={(e) => handleInputChange("residencyStatus", e.target.value)}
                    className={errors.residencyStatus ? 'border-red-500' : ''}
                  >
                    <option value="">Select residency status</option>
                    <option value="Indian Resident">Indian Resident</option>
                    <option value="NRI">NRI</option>
                    <option value="Foreign Citizen">Foreign Citizen</option>
                    <option value="PIO">PIO</option>
                  </Select>
                  {errors.residencyStatus && (
                    <p className="text-red-400 text-sm">{errors.residencyStatus}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="residencyDetails">Residency Details</Label>
                  <Input
                    id="residencyDetails"
                    type="text"
                    value={formData.residencyDetails}
                    onChange={(e) => handleInputChange("residencyDetails", e.target.value)}
                    placeholder="Additional residency details (optional)"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Demographics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Users className="h-4 w-4 text-purple-400" />
                </div>
                Demographics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="ageGroup">Age Group</Label>
                  <Select
                    id="ageGroup"
                    value={formData.ageGroup}
                    onChange={(e) => handleInputChange("ageGroup", e.target.value)}
                  >
                    <option value="">Select age group</option>
                    <option value="18-25">18-25 years</option>
                    <option value="26-35">26-35 years</option>
                    <option value="36-45">36-45 years</option>
                    <option value="46-55">46-55 years</option>
                    <option value="56-65">56-65 years</option>
                    <option value="65+">65+ years</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="householdSize">Household Size</Label>
                  <Select
                    id="householdSize"
                    value={formData.householdSize}
                    onChange={(e) => handleInputChange("householdSize", e.target.value)}
                  >
                    <option value="">Select household size</option>
                    <option value="Single">Single</option>
                    <option value="2">2 people</option>
                    <option value="3-4">3-4 people</option>
                    <option value="5+">5+ people</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annualIncomeRange">Annual Income Range</Label>
                  <Select
                    id="annualIncomeRange"
                    value={formData.annualIncomeRange}
                    onChange={(e) => handleInputChange("annualIncomeRange", e.target.value)}
                  >
                    <option value="">Select income range</option>
                    <option value="Under ₹5 Lakhs">Under ₹5 Lakhs</option>
                    <option value="₹5-15 Lakhs">₹5-15 Lakhs</option>
                    <option value="₹15-30 Lakhs">₹15-30 Lakhs</option>
                    <option value="₹30-50 Lakhs">₹30-50 Lakhs</option>
                    <option value="₹50 Lakhs - ₹1 Crore">₹50 Lakhs - ₹1 Crore</option>
                    <option value="Above ₹1 Crore">Above ₹1 Crore</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="professions">Profession(s)</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-700 rounded-md p-2">
                    {["Business Owner", "Salaried Professional", "Self Employed", "Doctor", "Engineer", "Teacher", "Retired", "Student", "Other"].map((profession) => (
                      <label key={profession} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-800 p-1 rounded">
                        <Checkbox
                          checked={formData.professions.includes(profession)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleInputChange("professions", [...formData.professions, profession]);
                            } else {
                              handleInputChange("professions", formData.professions.filter(p => p !== profession));
                            }
                          }}
                        />
                        <span className="text-sm">{profession}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-green-400" />
                </div>
                Location Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currentCity">
                    Current City <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="currentCity"
                    type="text"
                    value={formData.currentCity}
                    onChange={(e) => handleInputChange("currentCity", e.target.value)}
                    className={errors.currentCity ? 'border-red-500' : ''}
                    placeholder="Enter current city"
                  />
                  {errors.currentCity && (
                    <p className="text-red-400 text-sm">{errors.currentCity}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentState">Current State</Label>
                  <Input
                    id="currentState"
                    type="text"
                    value={formData.currentState}
                    onChange={(e) => handleInputChange("currentState", e.target.value)}
                    placeholder="Enter current state"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentCountry">Country</Label>
                  <Input
                    id="currentCountry"
                    type="text"
                    value={formData.currentCountry}
                    onChange={(e) => handleInputChange("currentCountry", e.target.value)}
                    placeholder="Enter country"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredCities">Preferred Cities</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-700 rounded-md p-2">
                    {["Mumbai", "Delhi", "Bangalore", "Chennai", "Pune", "Hyderabad", "Ahmedabad", "Jaipur", "Goa", "Other"].map((city) => (
                      <label key={city} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-800 p-1 rounded">
                        <Checkbox
                          checked={formData.preferredCities.includes(city)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleInputChange("preferredCities", [...formData.preferredCities, city]);
                            } else {
                              handleInputChange("preferredCities", formData.preferredCities.filter(c => c !== city));
                            }
                          }}
                        />
                        <span className="text-sm">{city}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Vision */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Target className="h-4 w-4 text-purple-400" />
                </div>
                Property Vision
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="propertiesPurchasedBefore">Properties Purchased Before</Label>
                  <Select
                    id="propertiesPurchasedBefore"
                    value={formData.propertiesPurchasedBefore}
                    onChange={(e) => handleInputChange("propertiesPurchasedBefore", e.target.value)}
                  >
                    <option value="">Select option</option>
                    <option value="None">None</option>
                    <option value="1">1 property</option>
                    <option value="2-3">2-3 properties</option>
                    <option value="4+">4+ properties</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budgetRange">
                    Budget Range <span className="text-red-400">*</span>
                  </Label>
                  <Select
                    id="budgetRange"
                    value={formData.budgetRange}
                    onChange={(e) => handleInputChange("budgetRange", e.target.value)}
                    className={errors.budgetRange ? 'border-red-500' : ''}
                  >
                    <option value="">Select budget range</option>
                    <option value="Under ₹50 Lakhs">Under ₹50 Lakhs</option>
                    <option value="₹50 Lakhs - ₹1 Crore">₹50 Lakhs - ₹1 Crore</option>
                    <option value="₹1 Crore - ₹2 Crores">₹1 Crore - ₹2 Crores</option>
                    <option value="₹2 Crores - ₹5 Crores">₹2 Crores - ₹5 Crores</option>
                    <option value="Above ₹5 Crores">Above ₹5 Crores</option>
                  </Select>
                  {errors.budgetRange && (
                    <p className="text-red-400 text-sm">{errors.budgetRange}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="journeyStage">Journey Stage</Label>
                  <Select
                    id="journeyStage"
                    value={formData.journeyStage}
                    onChange={(e) => handleInputChange("journeyStage", e.target.value)}
                  >
                    <option value="">Select journey stage</option>
                    <option value="Just Started">Just Started</option>
                    <option value="Researching">Researching</option>
                    <option value="Comparing Options">Comparing Options</option>
                    <option value="Ready to Purchase">Ready to Purchase</option>
                    <option value="Site Visits">Site Visits</option>
                    <option value="Negotiation">Negotiation</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchaseTimeline">Purchase Timeline</Label>
                  <Select
                    id="purchaseTimeline"
                    value={formData.purchaseTimeline}
                    onChange={(e) => handleInputChange("purchaseTimeline", e.target.value)}
                  >
                    <option value="">Select timeline</option>
                    <option value="Immediately">Immediately</option>
                    <option value="1-3 months">1-3 months</option>
                    <option value="3-6 months">3-6 months</option>
                    <option value="6-12 months">6-12 months</option>
                    <option value="1-2 years">1-2 years</option>
                    <option value="Just Researching">Just Researching</option>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="propertyPurpose">
                    Property Purpose <span className="text-red-400">*</span>
                  </Label>
                  <div className="space-y-2">
                    {["Investment", "Self Occupation", "Rental Income", "Vacation Home", "Retirement"].map((purpose) => (
                      <label key={purpose} className="flex items-center space-x-2 cursor-pointer">
                        <Checkbox
                          checked={formData.propertyPurpose.includes(purpose)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleInputChange("propertyPurpose", [...formData.propertyPurpose, purpose]);
                            } else {
                              handleInputChange("propertyPurpose", formData.propertyPurpose.filter(p => p !== purpose));
                            }
                          }}
                        />
                        <span className="text-sm">{purpose}</span>
                      </label>
                    ))}
                  </div>
                  {errors.propertyPurpose && (
                    <p className="text-red-400 text-sm">{errors.propertyPurpose}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buyingMotivation">Buying Motivation</Label>
                  <div className="space-y-2">
                    {["Appreciation", "Rental Yield", "Lifestyle", "Tax Benefits"].map((motivation) => (
                      <label key={motivation} className="flex items-center space-x-2 cursor-pointer">
                        <Checkbox
                          checked={formData.buyingMotivation.includes(motivation)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleInputChange("buyingMotivation", [...formData.buyingMotivation, motivation]);
                            } else {
                              handleInputChange("buyingMotivation", formData.buyingMotivation.filter(m => m !== motivation));
                            }
                          }}
                        />
                        <span className="text-sm">{motivation}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assetTypes">Asset Types Interested In</Label>
                  <div className="space-y-2">
                    {["Apartment", "Villa", "Plot", "Commercial", "Farm Land"].map((asset) => (
                      <label key={asset} className="flex items-center space-x-2 cursor-pointer">
                        <Checkbox
                          checked={formData.assetTypes.includes(asset)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleInputChange("assetTypes", [...formData.assetTypes, asset]);
                            } else {
                              handleInputChange("assetTypes", formData.assetTypes.filter(a => a !== asset));
                            }
                          }}
                        />
                        <span className="text-sm">{asset}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investment Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-yellow-400" />
                </div>
                Investment Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="ownershipStructure">Ownership Structure</Label>
                  <Select
                    id="ownershipStructure"
                    value={formData.ownershipStructure}
                    onChange={(e) => handleInputChange("ownershipStructure", e.target.value)}
                  >
                    <option value="">Select ownership</option>
                    <option value="Individual">Individual</option>
                    <option value="Joint">Joint</option>
                    <option value="Trust">Trust</option>
                    <option value="Company">Company</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fundingType">Funding Type</Label>
                  <Select
                    id="fundingType"
                    value={formData.fundingType}
                    onChange={(e) => handleInputChange("fundingType", e.target.value)}
                  >
                    <option value="">Select funding type</option>
                    <option value="Self Funded">Self Funded</option>
                    <option value="Bank Loan">Bank Loan</option>
                    <option value="Home Loan">Home Loan</option>
                    <option value="Mixed">Mixed</option>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lifestyle Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                  <Heart className="h-4 w-4 text-pink-400" />
                </div>
                Lifestyle Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="areaType">Preferred Area Type</Label>
                  <div className="space-y-2">
                    {["Urban", "Suburban", "Rural", "Hill Station"].map((area) => (
                      <label key={area} className="flex items-center space-x-2 cursor-pointer">
                        <Checkbox
                          checked={formData.areaType.includes(area)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleInputChange("areaType", [...formData.areaType, area]);
                            } else {
                              handleInputChange("areaType", formData.areaType.filter(a => a !== area));
                            }
                          }}
                        />
                        <span className="text-sm">{area}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="communityFormat">Community Format</Label>
                  <Select
                    id="communityFormat"
                    value={formData.communityFormat}
                    onChange={(e) => handleInputChange("communityFormat", e.target.value)}
                  >
                    <option value="">Select community format</option>
                    <option value="Standalone">Standalone</option>
                    <option value="Gated Community">Gated Community</option>
                    <option value="Township">Township</option>
                    <option value="Mixed Use">Mixed Use</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gatedPreference">Gated Community Preference</Label>
                  <Select
                    id="gatedPreference"
                    value={formData.gatedPreference}
                    onChange={(e) => handleInputChange("gatedPreference", e.target.value)}
                  >
                    <option value="">Select preference</option>
                    <option value="Must Have">Must Have</option>
                    <option value="Preferred">Preferred</option>
                    <option value="Not Important">Not Important</option>
                    <option value="Not Preferred">Not Preferred</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="furnishingLevel">Furnishing Level</Label>
                  <Select
                    id="furnishingLevel"
                    value={formData.furnishingLevel}
                    onChange={(e) => handleInputChange("furnishingLevel", e.target.value)}
                  >
                    <option value="">Select furnishing level</option>
                    <option value="Unfurnished">Unfurnished</option>
                    <option value="Semi Furnished">Semi Furnished</option>
                    <option value="Fully Furnished">Fully Furnished</option>
                    <option value="Luxury Furnished">Luxury Furnished</option>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unit Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <Home className="h-4 w-4 text-indigo-400" />
                </div>
                Unit Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="smartHomeFeatures">Smart Home Features</Label>
                  <div className="space-y-2">
                    {["Home Automation", "Security System", "Smart Lighting", "Climate Control", "Entertainment System"].map((feature) => (
                      <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                        <Checkbox
                          checked={formData.smartHomeFeatures.includes(feature)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleInputChange("smartHomeFeatures", [...formData.smartHomeFeatures, feature]);
                            } else {
                              handleInputChange("smartHomeFeatures", formData.smartHomeFeatures.filter(f => f !== feature));
                            }
                          }}
                        />
                        <span className="text-sm">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lead Source */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-orange-400" />
                </div>
                Lead Source
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="discoverySource">
                    How did you hear about us? <span className="text-red-400">*</span>
                  </Label>
                  <Select
                    id="discoverySource"
                    value={formData.discoverySource}
                    onChange={(e) => handleInputChange("discoverySource", e.target.value)}
                    className={errors.discoverySource ? 'border-red-500' : ''}
                  >
                    <option value="">Select discovery source</option>
                    <option value="Google Search">Google Search</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Referral">Referral</option>
                    <option value="Advertisement">Advertisement</option>
                    <option value="Website">Website</option>
                    <option value="Event">Event</option>
                    <option value="Other">Other</option>
                  </Select>
                  {errors.discoverySource && (
                    <p className="text-red-400 text-sm">{errors.discoverySource}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discoveryDetails">Discovery Details</Label>
                  <Input
                    id="discoveryDetails"
                    type="text"
                    value={formData.discoveryDetails}
                    onChange={(e) => handleInputChange("discoveryDetails", e.target.value)}
                    placeholder="Additional details about how you found us"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-cyan-400" />
                </div>
                Additional Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Any additional notes or requirements..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/leads")}
              disabled={loading}
              className="px-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Lead
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLeadPage;
