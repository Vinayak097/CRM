import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { leadService } from "../../services/leadService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Lead, LeadIdentity, LeadLocation, LeadProperty } from "@/types";
import {
  residencyOptions,
  discoverySourceOptions,
  ageGroupOptions,
  professionOptions,
  householdSizeOptions,
  incomeRangeOptions,
  propertiesPurchasedOptions,
  propertyPurposeOptions,
  buyingMotivationOptions,
  shortTermRentalOptions,
  assetTypeOptions,
  waterSourceOptions,
  unitConfigurationOptions,
  farmlandSizeOptions,
  journeyStageOptions,
  explorationDurationOptions,
  purchaseTimelineOptions,
  ownershipStructureOptions,
  possessionTimelineOptions,
  managementModelOptions,
  fundingTypeOptions,
  countryOptions,
  
  
  locationPriorityOptions,
  
  natureFeatureOptions,
  communityFormatOptions,
  communityFriendlyOptions,
  outdoorAmenitiesOptions,
  vastuDirectionOptions,
  furnishingLevelOptions,
  interiorStyleOptions,
  smartHomeFeatureOptions,
  mustHaveFeatureOptions,
  HomecountryOptions,
  relationShipStatus,
} from "../../components/LeadFormWizard/formOptions";

const EditLeadPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
const [household, setHousehold] = useState({
  hasSeniorCitizen: "",
  hasChildren: "",
  hasPets: "",
});
  // Form data
  const [identity, setIdentity] = useState<LeadIdentity>({
    propertyRolePrimary: [],
    relationShipStatus:'',
    searchTrigger: [],
  });
  const [location, setLocation] = useState<LeadLocation>({
    targetStatesRegions: [],
    
    targetLocations: [],
    
    locationPriorities: [],
    
    sorroundings: [],
  });
  const [property, setProperty] = useState<LeadProperty>({
    assetTypeInterest: [],
    unitConfiguration: [],
    farmlandLandSizeBucket: [],
    communityFriendlyFor: [],
    communityOutdoorAmenitiesTop: [],
    vastuPreferredDirections: [],
    homeMustHaveFeatures: [],
    homeNiceToHaveFeatures: [],
    smartHomeSecurityFeatures: [],
    privateOutdoorFeatures: [],
  });

  useEffect(() => {
    const fetchLead = async () => {
      if (!id) return;
      try {
        const response = await leadService.getLeadById(id);
        const lead: Lead = response.data;

        if (lead.identity) setIdentity(lead.identity);
        if (lead.location) setLocation(lead.location);
        if (lead.property) setProperty(lead.property);
        if(lead.identity && lead.identity.household) setHousehold(lead.identity.household)
      } catch (error) {
        console.error("Failed to fetch lead:", error);
        alert("Failed to load lead data");
        navigate("/leads");
      } finally {
        setFetching(false);
      }
    };

    fetchLead();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setLoading(true);

    try {
      const leadData = {
        identity,
        location,
        property,
      };

      await leadService.updateLead(id, leadData);
      navigate(`/leads/${id}`);
    } catch (error) {
      console.error("Failed to update lead:", error);
      alert("Failed to update lead. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleArrayField = (
    section: 'identity' | 'location' | 'property',
    field: string,
    value: string,
    checked: boolean
  ) => {
    if (section === 'identity') {
      const currentArray = (identity as any)[field] || [];
      const newArray = checked
        ? [...currentArray, value]
        : currentArray.filter((item: string) => item !== value);
      setIdentity({ ...identity, [field]: newArray });
    } else if (section === 'location') {
      const currentArray = (location as any)[field] || [];
      const newArray = checked
        ? [...currentArray, value]
        : currentArray.filter((item: string) => item !== value);
      setLocation({ ...location, [field]: newArray });
    } else if (section === 'property') {
      const currentArray = (property as any)[field] || [];
      const newArray = checked
        ? [...currentArray, value]
        : currentArray.filter((item: string) => item !== value);
      setProperty({ ...property, [field]: newArray });
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Loading lead data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(`/leads/${id}`)}
            className="flex items-center gap-2 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Lead Profile
          </button>
          <h1 className="text-3xl font-bold">Edit Lead</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Identity Section */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl">Identity & Demographics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={identity.firstName || ""}
                    onChange={(e) => setIdentity({ ...identity, firstName: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={identity.lastName || ""}
                    onChange={(e) => setIdentity({ ...identity, lastName: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={identity.phone || ""}
                    onChange={(e) => setIdentity({ ...identity, phone: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={identity.email || ""}
                    onChange={(e) => setIdentity({ ...identity, email: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                               <Label htmlFor="homeCountry">Home Country</Label>
                               <Select
                                 id="homeCountry"
                                 value={identity.homeCountry || ""}
                                 onChange={(e) => setIdentity({ ...identity, homeCountry: e.target.value })}
                                 className="bg-gray-800 border-gray-700"
                               >
                               <option value="" > select country</option>
                               {HomecountryOptions.map(option=>(
                                 <option key={option} value={option}>{option}</option>
                               ))}
                               </Select>
                             </div>
                <div>
                  <Label htmlFor="visaResidencyStatus">Visa Residency Status</Label>
                  <Select
                    id="visaResidencyStatus"
                    value={identity.visaResidencyStatus || ""}
                    onChange={(e) => setIdentity({ ...identity, visaResidencyStatus: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  >
                    <option value="">Select visa status</option>
                    {residencyOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="leadSource">Lead Source</Label>
                  <Select
                    id="leadSource"
                    value={identity.leadSource || ""}
                    onChange={(e) => setIdentity({ ...identity, leadSource: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  >
                    <option value="">Select lead source</option>
                    {discoverySourceOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="ageYears">Age</Label>
                  <Select
                    id="ageYears"
                    value={identity.ageYears?.toString() || ""}
                    onChange={(e) => setIdentity({ ...identity, ageYears: parseInt(e.target.value) || undefined })}
                    className="bg-gray-800 border-gray-700"
                  >
                    <option value="">Select age group</option>
                    {ageGroupOptions.map((option) => (
                      <option key={option} value={option.split(" ")[0]}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="profession">Profession</Label>
                  <Select
                    id="profession"
                    value={identity.profession || ""}
                    onChange={(e) => setIdentity({ ...identity, profession: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  >
                    <option value="">Select profession</option>
                    {professionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </div>


                <div>
                                  <Label htmlFor="">
                                    What’s your current relationship status?
                                    
                                    <Select
                                    id="relationShip_status"
                                    value={identity.relationShipStatus}
                                    onChange={(e)=>setIdentity({...identity,relationShipStatus:e.target.value})}
                                    className="bg-gray-800 border-gray-700"
                                    >
                                      
                                      {relationShipStatus.map((option)=>(
                                        <option key={option} value={option}>
                                          {option}
                                        </option>
                                      ))}
                                    </Select>
                
                                  </Label>
                                </div>
                
                
                                <div className="space-y-4">
                  
                
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Senior Citizens */}
                    <div>
                      <Label>Senior citizen(s) living</Label>
                      <Select
                        value={household.hasSeniorCitizen || ""}
                        onChange={(e) =>
                          setHousehold({ ...household, hasSeniorCitizen: e.target.value })
                        }
                        className="bg-gray-800 border-gray-700"
                      >
                        <option value="">Select</option>
                          {householdSizeOptions.map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))}
                      </Select>
                    </div>
                
                    {/* Children */}
                    <div>
                      <Label>Children living</Label>
                      <Select
                        value={household.hasChildren || ""}
                        onChange={(e) =>
                          setHousehold({ ...household, hasChildren: e.target.value })
                        }
                        className="bg-gray-800 border-gray-700"
                      >
                        <option value="">Select</option>
                         {householdSizeOptions.map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))}
                      </Select>
                    </div>
                
                    {/* Pets */}
                    <div>
                      <Label>Pets living</Label>
                      <Select
                        value={household.hasPets || ""}
                        onChange={(e) =>
                          setHousehold({ ...household, hasPets: e.target.value })
                        }
                        className="bg-gray-800 border-gray-700"
                      >
                        <option value="">Select</option>
                          {householdSizeOptions.map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))}
                      </Select>
                    </div>
                  </div>
                </div>
                
                


                <div>
                  <Label htmlFor="householdSize">Household Size</Label>
                  <Select
                    id="householdSize"
                    value={identity.householdSize || ""}
                    onChange={(e) => setIdentity({ ...identity, householdSize: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  >
                    <option value="">Select household size</option>
                    {householdSizeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="householdIncomeBandInr">Income Range</Label>
                <Select
                  id="householdIncomeBandInr"
                  value={identity.householdIncomeBandInr || ""}
                  onChange={(e) => setIdentity({ ...identity, householdIncomeBandInr: e.target.value })}
                  className="bg-gray-800 border-gray-700"
                >
                  <option value="">Select income range</option>
                  {incomeRangeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-medium mb-3 block">Property Role (Primary)</Label>
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                    {propertyPurposeOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`propertyRole-${option}`}
                          checked={identity.propertyRolePrimary?.includes(option) || false}
                          onCheckedChange={(checked) =>
                            handleArrayField('identity', 'propertyRolePrimary', option, checked as boolean)
                          }
                        />
                        <Label htmlFor={`propertyRole-${option}`} className="text-sm">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium mb-3 block">Search Triggers</Label>
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                    {buyingMotivationOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`searchTrigger-${option}`}
                          checked={identity.searchTrigger?.includes(option) || false}
                          onCheckedChange={(checked) =>
                            handleArrayField('identity', 'searchTrigger', option, checked as boolean)
                          }
                        />
                        <Label htmlFor={`searchTrigger-${option}`} className="text-sm">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="priorPropertiesPurchased">Properties Purchased</Label>
                  <Select
                    id="priorPropertiesPurchased"
                    value={identity.priorPropertiesPurchased || ""}
                    onChange={(e) => setIdentity({ ...identity, priorPropertiesPurchased: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  >
                    <option value="">Select</option>
                    {propertiesPurchasedOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="buyingJourneyStage">Journey Stage</Label>
                  <Select
                    id="buyingJourneyStage"
                    value={identity.buyingJourneyStage || ""}
                    onChange={(e) => setIdentity({ ...identity, buyingJourneyStage: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  >
                    <option value="">Select</option>
                    {journeyStageOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="explorationDuration">Exploration Duration</Label>
                  <Select
                    id="explorationDuration"
                    value={identity.explorationDuration || ""}
                    onChange={(e) => setIdentity({ ...identity, explorationDuration: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  >
                    <option value="">Select</option>
                    {explorationDurationOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="purchaseTimeline">Purchase Timeline</Label>
                <Select
                  id="purchaseTimeline"
                  value={identity.purchaseTimeline || ""}
                  onChange={(e) => setIdentity({ ...identity, purchaseTimeline: e.target.value })}
                  className="bg-gray-800 border-gray-700"
                >
                  <option value="">Select</option>
                  {purchaseTimelineOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="aboutYouNotes">About You Notes</Label>
                  <Textarea
                    id="aboutYouNotes"
                    value={identity.aboutYouNotes || ""}
                    onChange={(e) => setIdentity({ ...identity, aboutYouNotes: e.target.value })}
                    className="bg-gray-800 border-gray-700 min-h-[100px]"
                    placeholder="Additional notes about the person..."
                  />
                </div>
                <div>
                  <Label htmlFor="ownershipTimelineNotes">Ownership Timeline Notes</Label>
                  <Textarea
                    id="ownershipTimelineNotes"
                    value={identity.ownershipTimelineNotes || ""}
                    onChange={(e) => setIdentity({ ...identity, ownershipTimelineNotes: e.target.value })}
                    className="bg-gray-800 border-gray-700 min-h-[100px]"
                    placeholder="Notes about ownership timeline..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Section */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl">Location Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="buyingCountryFocus">Country Focus</Label>
                <Select
                  id="buyingCountryFocus"
                  value={location.buyingCountryFocus || ""}
                  onChange={(e) => setLocation({ ...location, buyingCountryFocus: e.target.value })}
                  className="bg-gray-800 border-gray-700"
                >
                  <option value="">Select country</option>
                  {countryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </div>

             

           

              <div>
                <Label className="text-base font-medium mb-3 block">Location Priorities</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {locationPriorityOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`locationPriority-${option}`}
                        checked={location.locationPriorities?.includes(option) || false}
                        onCheckedChange={(checked) =>
                          handleArrayField('location', 'locationPriorities', option, checked as boolean)
                        }
                      />
                      <Label htmlFor={`locationPriority-${option}`} className="text-sm">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

            
              <div>
                <Label className="text-base font-medium mb-3 block">sorroundings</Label>
                <div className="grid grid-cols-1 gap-2">
                  {natureFeatureOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sorroundings-${option}`}
                        checked={location.sorroundings?.includes(option) || false}
                        onCheckedChange={(checked) =>
                          handleArrayField('location', 'sorroundings', option, checked as boolean)
                        }
                      />
                      <Label htmlFor={`sorroundings-${option}`} className="text-sm">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="locationDealbreakerNotes">Location Deal-breakers Notes</Label>
                <Textarea
                  id="locationDealbreakerNotes"
                  value={location.locationDealbreakerNotes || ""}
                  onChange={(e) => setLocation({ ...location, locationDealbreakerNotes: e.target.value })}
                  className="bg-gray-800 border-gray-700 min-h-[100px]"
                  placeholder="Any location deal-breakers or concerns..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Property Section */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl">Property Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="strPermissionImportance">STR Permission Importance</Label>
                <Select
                  id="strPermissionImportance"
                  value={property.strPermissionImportance || ""}
                  onChange={(e) => setProperty({ ...property, strPermissionImportance: e.target.value })}
                  className="bg-gray-800 border-gray-700"
                >
                  <option value="">Select STR importance</option>
                  {shortTermRentalOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block">Asset Types of Interest</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {assetTypeOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`assetType-${option}`}
                        checked={property.assetTypeInterest?.includes(option) || false}
                        onCheckedChange={(checked) =>
                          handleArrayField('property', 'assetTypeInterest', option, checked as boolean)
                        }
                      />
                      <Label htmlFor={`assetType-${option}`} className="text-sm">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="farmlandWaterSourcePreference">Farmland Water Source Preference</Label>
                <Select
                  id="farmlandWaterSourcePreference"
                  value={property.farmlandWaterSourcePreference || ""}
                  onChange={(e) => setProperty({ ...property, farmlandWaterSourcePreference: e.target.value })}
                  className="bg-gray-800 border-gray-700"
                >
                  <option value="">Select water source</option>
                  {waterSourceOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block">Unit Configuration</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {unitConfigurationOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`unitConfig-${option}`}
                        checked={property.unitConfiguration?.includes(option) || false}
                        onCheckedChange={(checked) =>
                          handleArrayField('property', 'unitConfiguration', option, checked as boolean)
                        }
                      />
                      <Label htmlFor={`unitConfig-${option}`} className="text-sm">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block">Farmland Land Size Bucket</Label>
                <div className="grid grid-cols-1 gap-2">
                  {farmlandSizeOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`landSize-${option}`}
                        checked={property.farmlandLandSizeBucket?.includes(option) || false}
                        onCheckedChange={(checked) =>
                          handleArrayField('property', 'farmlandLandSizeBucket', option, checked as boolean)
                        }
                      />
                      <Label htmlFor={`landSize-${option}`} className="text-sm">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ownershipStructurePreference">Ownership Structure</Label>
                  <Select
                    id="ownershipStructurePreference"
                    value={property.ownershipStructurePreference || ""}
                    onChange={(e) => setProperty({ ...property, ownershipStructurePreference: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  >
                    <option value="">Select ownership</option>
                    {ownershipStructureOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="possessionStagePreference">Possession Stage</Label>
                  <Select
                    id="possessionStagePreference"
                    value={property.possessionStagePreference || ""}
                    onChange={(e) => setProperty({ ...property, possessionStagePreference: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  >
                    <option value="">Select possession stage</option>
                    {possessionTimelineOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="possessionTimelineBucket">Possession Timeline</Label>
                  <Select
                    id="possessionTimelineBucket"
                    value={property.possessionTimelineBucket || ""}
                    onChange={(e) => setProperty({ ...property, possessionTimelineBucket: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  >
                    <option value="">Select timeline</option>
                    {possessionTimelineOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="managementModelPreference">Management Model</Label>
                  <Select
                    id="managementModelPreference"
                    value={property.managementModelPreference || ""}
                    onChange={(e) => setProperty({ ...property, managementModelPreference: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  >
                    <option value="">Select management model</option>
                    {managementModelOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fundingPreference">Funding Preference</Label>
                  <Select
                    id="fundingPreference"
                    value={property.fundingPreference || ""}
                    onChange={(e) => setProperty({ ...property, fundingPreference: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  >
                    <option value="">Select funding</option>
                    {fundingTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="communityFormatPreference">Community Format</Label>
                  <Select
                    id="communityFormatPreference"
                    value={property.communityFormatPreference || ""}
                    onChange={(e) => setProperty({ ...property, communityFormatPreference: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  >
                    <option value="">Select community format</option>
                    {communityFormatOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block">Community Friendly For</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {communityFriendlyOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`communityFriendly-${option}`}
                        checked={property.communityFriendlyFor?.includes(option) || false}
                        onCheckedChange={(checked) =>
                          handleArrayField('property', 'communityFriendlyFor', option, checked as boolean)
                        }
                      />
                      <Label htmlFor={`communityFriendly-${option}`} className="text-sm">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block">Community Outdoor Amenities (Top)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {outdoorAmenitiesOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`outdoorAmenities-${option}`}
                        checked={property.communityOutdoorAmenitiesTop?.includes(option) || false}
                        onCheckedChange={(checked) =>
                          handleArrayField('property', 'communityOutdoorAmenitiesTop', option, checked as boolean)
                        }
                      />
                      <Label htmlFor={`outdoorAmenities-${option}`} className="text-sm">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block">Vastu Preferred Directions</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {vastuDirectionOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`vastu-${option}`}
                        checked={property.vastuPreferredDirections?.includes(option) || false}
                        onCheckedChange={(checked) =>
                          handleArrayField('property', 'vastuPreferredDirections', option, checked as boolean)
                        }
                      />
                      <Label htmlFor={`vastu-${option}`} className="text-sm">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="furnishingLevelPreference">Furnishing Level</Label>
                  <Select
                    id="furnishingLevelPreference"
                    value={property.furnishingLevelPreference || ""}
                    onChange={(e) => setProperty({ ...property, furnishingLevelPreference: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  >
                    <option value="">Select furnishing level</option>
                    {furnishingLevelOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="interiorFinishLevel">Interior Finish Level</Label>
                  <Select
                    id="interiorFinishLevel"
                    value={property.interiorFinishLevel || ""}
                    onChange={(e) => setProperty({ ...property, interiorFinishLevel: e.target.value })}
                    className="bg-gray-800 border-gray-700"
                  >
                    <option value="">Select interior finish</option>
                    {interiorStyleOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block">Must-Have Features</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {mustHaveFeatureOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`mustHave-${option}`}
                        checked={property.homeMustHaveFeatures?.includes(option) || false}
                        onCheckedChange={(checked) =>
                          handleArrayField('property', 'homeMustHaveFeatures', option, checked as boolean)
                        }
                      />
                      <Label htmlFor={`mustHave-${option}`} className="text-sm">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block">Nice-to-Have Features</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {mustHaveFeatureOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`niceToHave-${option}`}
                        checked={property.homeNiceToHaveFeatures?.includes(option) || false}
                        onCheckedChange={(checked) =>
                          handleArrayField('property', 'homeNiceToHaveFeatures', option, checked as boolean)
                        }
                      />
                      <Label htmlFor={`niceToHave-${option}`} className="text-sm">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block">Smart Home & Security Features</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {smartHomeFeatureOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`smartHome-${option}`}
                        checked={property.smartHomeSecurityFeatures?.includes(option) || false}
                        onCheckedChange={(checked) =>
                          handleArrayField('property', 'smartHomeSecurityFeatures', option, checked as boolean)
                        }
                      />
                      <Label htmlFor={`smartHome-${option}`} className="text-sm">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block">Private Outdoor Features</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {mustHaveFeatureOptions.filter(option => option.includes('Balcony') || option.includes('Terrace') || option.includes('Garden')).map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`privateOutdoor-${option}`}
                        checked={property.privateOutdoorFeatures?.includes(option) || false}
                        onCheckedChange={(checked) =>
                          handleArrayField('property', 'privateOutdoorFeatures', option, checked as boolean)
                        }
                      />
                      <Label htmlFor={`privateOutdoor-${option}`} className="text-sm">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="propertyVisionNotes">Property Vision Notes</Label>
                  <Textarea
                    id="propertyVisionNotes"
                    value={property.propertyVisionNotes || ""}
                    onChange={(e) => setProperty({ ...property, propertyVisionNotes: e.target.value })}
                    className="bg-gray-800 border-gray-700 min-h-[100px]"
                    placeholder="Describe the ideal property vision..."
                  />
                </div>
                <div>
                  <Label htmlFor="idealHomeNotes">Ideal Home Notes</Label>
                  <Textarea
                    id="idealHomeNotes"
                    value={property.idealHomeNotes || ""}
                    onChange={(e) => setProperty({ ...property, idealHomeNotes: e.target.value })}
                    className="bg-gray-800 border-gray-700 min-h-[100px]"
                    placeholder="Describe the ideal home..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="finalNotes">Final Notes</Label>
                <Textarea
                  id="finalNotes"
                  value={property.finalNotes || ""}
                  onChange={(e) => setProperty({ ...property, finalNotes: e.target.value })}
                  className="bg-gray-800 border-gray-700 min-h-[100px]"
                  placeholder="Any additional notes or requirements..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-2"
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
