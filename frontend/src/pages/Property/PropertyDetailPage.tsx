import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Edit2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { propertyService } from "@/services/propertyService";
import type { Property } from "@/types/property";
import { useUser } from "@/hooks/useAuth";

const PropertyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const canEdit = user?.role === "admin" || user?.role === "onboarding_agent";
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    location: false,
    area: false,
    pricing: true,
    specifications: false,
    amenities: false,
    features: false,
    project: false,
    developer: false,
    visual: false,
    badges: false,
    engagement: false,
    financial: false,
    legal: false,
    parking: false,
    accessibility: false,
    furnishing: false,
    tags: false,
    dates: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderField = (label: string, value: any) => {
    if (value === null || value === undefined || value === '') return null;
    const displayValue = typeof value === 'object' 
      ? JSON.stringify(value, null, 2)
      : String(value);
    return (
      <div key={label}>
        <div className="text-gray-400 text-sm">{label}</div>
        <div className="text-gray-300 break-all whitespace-pre-wrap">{displayValue}</div>
      </div>
    );
  };

  const CollapsibleSection = ({ 
    title, 
    isExpanded, 
    onToggle, 
    children 
  }: { 
    title: string; 
    isExpanded: boolean; 
    onToggle: () => void;
    children: React.ReactNode;
  }) => (
    <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800 transition-colors"
      >
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-700 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await propertyService.getPropertyById(id);
        setProperty(response.data);
      } catch (err) {
        setError("Failed to fetch property details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !confirm("Are you sure you want to delete this property?")) return;
    setDeleting(true);
    try {
      await propertyService.deleteProperty(id);
      navigate("/property");
    } catch {
      alert("Failed to delete property");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-400">
        Loading property details...
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/property")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="p-4 bg-red-500/20 border border-red-500 rounded text-red-400">
          {error || "Property not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 text-white bg-background min-h-screen w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/property")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-semibold">{property.title}</h1>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/property/${id}/edit`)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-6 max-w-6xl">
        {/* Images */}
        {property.images && property.images.length > 0 && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
            <div className="aspect-video bg-gray-800 flex items-center justify-center">
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Description */}
        {(property.description_full || property.description_long || property.description_short) && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-300 whitespace-pre-wrap">
              {property.description_full || property.description_long || property.description_short}
            </p>
          </div>
        )}

        {/* Basic Details */}
        <CollapsibleSection 
          title="Basic Details" 
          isExpanded={expandedSections['basic']}
          onToggle={() => toggleSection('basic')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('Property Type', property.property_type)}
            {renderField('Listing Type', property.listing_type)}
            {renderField('Status', property.status)}
            {renderField('Listing ID', property.listing_id)}
            {renderField('Property ID', property.id)}
            {renderField('Subtitle', property.subtitle)}
            {renderField('Description Short', property.description_short)}
            {renderField('Description Long', property.description_long)}
          </div>
        </CollapsibleSection>

        {/* Location Details */}
        {property.location && (
          <CollapsibleSection 
            title="Location Details" 
            isExpanded={expandedSections['location']}
            onToggle={() => toggleSection('location')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('City', property.location.city)}
              {renderField('Region', property.location.region)}
              {renderField('State', property.location.state)}
              {renderField('Country', property.location.country)}
              {renderField('Full Address', property.location.full_address)}
              {renderField('Zip Code', property.location.zip_code)}
              {renderField('Timezone', property.location.timezone)}
              {property.location.coordinates && (
                <>
                  {renderField('Latitude', property.location.coordinates.latitude)}
                  {renderField('Longitude', property.location.coordinates.longitude)}
                </>
              )}
            </div>
          </CollapsibleSection>
        )}

        {/* Specific Address */}
        {property.specificAddress && (
          <CollapsibleSection 
            title="Specific Address" 
            isExpanded={expandedSections['location']}
            onToggle={() => toggleSection('location')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Street', property.specificAddress.street)}
              {renderField('Area', property.specificAddress.area)}
              {renderField('City', property.specificAddress.city)}
              {renderField('State', property.specificAddress.state)}
              {renderField('Country', property.specificAddress.country)}
              {renderField('Region', property.specificAddress.region)}
              {renderField('Pincode', property.specificAddress.pincode)}
            </div>
          </CollapsibleSection>
        )}

        {/* Area Details */}
        {property.area && (
          <CollapsibleSection 
            title="Area Details" 
            isExpanded={expandedSections['area']}
            onToggle={() => toggleSection('area')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Carpet Area (sqft)', property.area.carpet_area_sqft)}
              {renderField('Built Up Area (sqft)', property.area.built_up_area_sqft)}
              {renderField('Balcony Area (sqft)', property.area.balcony_area_sqft)}
              {renderField('Living Area (sqft)', property.area.living_area_sqft)}
              {renderField('Living Area (sqm)', property.area.living_area_sqm)}
              {renderField('Plot Area (sqft)', property.area.plot_area_sqft)}
              {renderField('Total Area (sqft)', property.area.total_area_sqft)}
            </div>
          </CollapsibleSection>
        )}

        {/* Pricing */}
        {property.pricing && (
          <CollapsibleSection 
            title="Pricing" 
            isExpanded={expandedSections['pricing']}
            onToggle={() => toggleSection('pricing')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {property.pricing.total_price && (
                renderField('Total Price', 
                  typeof property.pricing.total_price === 'object'
                    ? `${(property.pricing.total_price as any).display_value || (property.pricing.total_price as any).value} ${(property.pricing.total_price as any).currency || ''}`
                    : property.pricing.total_price
                )
              )}
              {property.pricing.price_per_sqft && (
                renderField('Price per sq.ft', 
                  typeof property.pricing.price_per_sqft === 'object'
                    ? `${(property.pricing.price_per_sqft as any).display_value || (property.pricing.price_per_sqft as any).value} ${(property.pricing.price_per_sqft as any).currency || ''}`
                    : property.pricing.price_per_sqft
                )
              )}
              {renderField('Original Price', property.pricing.original_price)}
              {renderField('Discount %', property.pricing.discount_percentage)}
            </div>
          </CollapsibleSection>
        )}

        {/* Specifications */}
        {property.specifications && (
          <CollapsibleSection 
            title="Specifications" 
            isExpanded={expandedSections['specifications']}
            onToggle={() => toggleSection('specifications')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Bedrooms', property.specifications.bedrooms)}
              {renderField('Bathrooms', property.specifications.bathrooms)}
              {renderField('Half Bathrooms', property.specifications.half_bathrooms)}
              {renderField('Parking Spaces', property.specifications.parking_spaces)}
              {renderField('Property Age', property.specifications.property_age)}
              {renderField('Year Built', property.specifications.year_built)}
              {renderField('Floors', property.specifications.floors)}
            </div>
          </CollapsibleSection>
        )}

        {/* Spatial Details */}
        {property.spatialDetails && (
          <CollapsibleSection 
            title="Spatial Details" 
            isExpanded={expandedSections['specifications']}
            onToggle={() => toggleSection('specifications')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Bedrooms', property.spatialDetails.bedrooms)}
              {renderField('Bathrooms', property.spatialDetails.bathrooms)}
              {renderField('Balconies', property.spatialDetails.balconies)}
              {renderField('Half Bathrooms', property.spatialDetails.half_bathrooms)}
              {renderField('Facing', property.spatialDetails.facing)}
              {renderField('Floor Number', property.spatialDetails.floorNumber)}
              {renderField('Layout Type', property.spatialDetails.layoutType)}
              {renderField('View Quality', property.spatialDetails.viewQuality)}
              {property.spatialDetails.area && renderField('Area Details', property.spatialDetails.area)}
            </div>
          </CollapsibleSection>
        )}

        {/* Amenities */}
        {property.amenities && (
          <CollapsibleSection 
            title="Amenities" 
            isExpanded={expandedSections['amenities']}
            onToggle={() => toggleSection('amenities')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Indoor Amenities', property.amenities.indoor_amenities)}
              {renderField('Outdoor Amenities', property.amenities.outdoor_amenities)}
              {renderField('Parking Amenities', property.amenities.parking_amenities)}
              {renderField('Security Amenities', property.amenities.security_amenities)}
              {renderField('Other Amenities', property.amenities.other_amenities)}
            </div>
          </CollapsibleSection>
        )}

        {/* Amenities Summary */}
        {property.amenities_summary && (
          <CollapsibleSection 
            title="Amenities Summary" 
            isExpanded={expandedSections['amenities']}
            onToggle={() => toggleSection('amenities')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Total Amenities', property.amenities_summary.total_amenities_count)}
              {renderField('Primary Amenities', property.amenities_summary.primary_amenities)}
              {renderField('Additional Amenities Count', property.amenities_summary.additional_amenities_count)}
            </div>
          </CollapsibleSection>
        )}

        {/* Features */}
        {property.features && (
          <CollapsibleSection 
            title="Features" 
            isExpanded={expandedSections['features']}
            onToggle={() => toggleSection('features')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Construction Quality', property.features.construction_quality)}
              {renderField('Design Features', property.features.design_features)}
              {renderField('Special Features', property.features.special_features)}
              {renderField('Fittings Quality', property.features.fittings_quality)}
              {renderField('Window Features', property.features.window_features)}
            </div>
          </CollapsibleSection>
        )}

        {/* Investment Highlights */}
        {property.investment_highlights && property.investment_highlights.length > 0 && (
          <CollapsibleSection 
            title="Investment Highlights" 
            isExpanded={expandedSections['features']}
            onToggle={() => toggleSection('features')}
          >
            <div className="grid grid-cols-1 gap-4">
              {renderField('Investment Highlights', property.investment_highlights)}
            </div>
          </CollapsibleSection>
        )}

        {/* Project Info */}
        {property.project_info && (
          <CollapsibleSection 
            title="Project Information" 
            isExpanded={expandedSections['project']}
            onToggle={() => toggleSection('project')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Part of Project', property.project_info.is_part_of_project)}
              {renderField('Project ID', property.project_info.project_id)}
              {renderField('Project Name', property.project_info.project_name)}
              {renderField('Project Type', property.project_info.project_type)}
              {renderField('Project Status', property.project_info.project_status)}
              {renderField('Possession Date', property.project_info.possession_date)}
              {renderField('Completion Date', property.project_info.completion_date)}
              {renderField('RARERA Number', property.project_info.rarera_number)}
            </div>
          </CollapsibleSection>
        )}

        {/* Developer */}
        {property.developer && (
          <CollapsibleSection 
            title="Developer Information" 
            isExpanded={expandedSections['developer']}
            onToggle={() => toggleSection('developer')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Developer ID', property.developer.developer_id)}
              {renderField('Developer Name', property.developer.name)}
              {property.developer.logo && renderField('Developer Logo', property.developer.logo)}
            </div>
          </CollapsibleSection>
        )}

        {/* Visual Assets */}
        {property.visual_assets && (
          <CollapsibleSection 
            title="Visual Assets" 
            isExpanded={expandedSections['visual']}
            onToggle={() => toggleSection('visual')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Main Image URL', property.visual_assets.main_image_url)}
              {renderField('Thumbnail URL', property.visual_assets.thumbnail_url)}
              {renderField('Video URL', property.visual_assets.video_url)}
              {renderField('Virtual Tour URL', property.visual_assets.virtual_tour_url)}
              {renderField('Floor Plan URL', property.visual_assets.floor_plan_url)}
              {property.visual_assets.images && renderField('Images', property.visual_assets.images)}
            </div>
          </CollapsibleSection>
        )}

        {/* Badges */}
        {property.badges && (
          <CollapsibleSection 
            title="Badges & Labels" 
            isExpanded={expandedSections['badges']}
            onToggle={() => toggleSection('badges')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Featured', property.badges.is_featured)}
              {renderField('New Listing', property.badges.is_new_listing)}
              {renderField('Pre-Launch', property.badges.is_pre_launch)}
              {renderField('Premium', property.badges.is_premium)}
              {renderField('Verified', property.badges.is_verified)}
            </div>
          </CollapsibleSection>
        )}

        {/* Engagement Metrics */}
        {property.engagement && (
          <CollapsibleSection 
            title="Engagement Metrics" 
            isExpanded={expandedSections['engagement']}
            onToggle={() => toggleSection('engagement')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Views Count', property.engagement.views_count)}
              {renderField('Views This Week', property.engagement.views_this_week)}
              {renderField('Saved Count', property.engagement.saved_count)}
              {renderField('Share Count', property.engagement.share_count)}
              {renderField('Last Viewed', property.engagement.last_viewed_at)}
            </div>
          </CollapsibleSection>
        )}

        {/* Capital Appreciation */}
        {property.capital_appreciation && (
          <CollapsibleSection 
            title="Capital Appreciation" 
            isExpanded={expandedSections['financial']}
            onToggle={() => toggleSection('financial')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('High Appreciation Potential', property.capital_appreciation.has_high_appreciation_potential)}
              {renderField('Projected Rate %', property.capital_appreciation.projected_appreciation_rate)}
              {renderField('Prospects', property.capital_appreciation.prospects)}
            </div>
          </CollapsibleSection>
        )}

        {/* Rental Potential */}
        {property.rental_potential && (
          <CollapsibleSection 
            title="Rental Potential" 
            isExpanded={expandedSections['financial']}
            onToggle={() => toggleSection('financial')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('High Rental Yield', property.rental_potential.has_high_rental_yield)}
              {renderField('Yield %', property.rental_potential.yield_percentage)}
              {property.rental_potential.seasonal_demand && (
                renderField('Seasonal Demand', property.rental_potential.seasonal_demand)
              )}
            </div>
          </CollapsibleSection>
        )}

        {/* Financial Metrics */}
        {property.financial_metrics && (
          <CollapsibleSection 
            title="Financial Metrics" 
            isExpanded={expandedSections['financial']}
            onToggle={() => toggleSection('financial')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('ROI %', property.financial_metrics.roi_percentage)}
            </div>
          </CollapsibleSection>
        )}

        {/* Financial Benefits */}
        {property.financial_benefits && (
          <CollapsibleSection 
            title="Financial Benefits" 
            isExpanded={expandedSections['financial']}
            onToggle={() => toggleSection('financial')}
          >
            <div className="grid grid-cols-1 gap-4">
              {renderField('Benefits', property.financial_benefits)}
            </div>
          </CollapsibleSection>
        )}

        {/* Legal Info */}
        {property.legal_info && (
          <CollapsibleSection 
            title="Legal Information" 
            isExpanded={expandedSections['legal']}
            onToggle={() => toggleSection('legal')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('RERA Approved', property.legal_info.reraApproved)}
              {renderField('RERA Number', property.legal_info.reraNumber)}
              {renderField('Fire NOC', property.legal_info.fireNOC)}
              {renderField('Occupancy Certificate', property.legal_info.occupancyCertificate)}
              {renderField('Permits', property.legal_info.permits)}
            </div>
          </CollapsibleSection>
        )}

        {/* Parking */}
        {property.parking && (
          <CollapsibleSection 
            title="Parking Details" 
            isExpanded={expandedSections['parking']}
            onToggle={() => toggleSection('parking')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Covered Parking', property.parking.covered)}
              {renderField('Open Parking', property.parking.open)}
              {renderField('EV Charging', property.parking.evCharging)}
              {renderField('Visitor Parking', property.parking.visitorParking)}
            </div>
          </CollapsibleSection>
        )}

        {/* Property Tags */}
        {property.property_tags && property.property_tags.length > 0 && (
          <CollapsibleSection 
            title="Tags" 
            isExpanded={expandedSections['tags']}
            onToggle={() => toggleSection('tags')}
          >
            <div className="grid grid-cols-1 gap-4">
              {renderField('Tags', property.property_tags)}
            </div>
          </CollapsibleSection>
        )}

        {/* Accessibility */}
        {property.accessibility && (
          <CollapsibleSection 
            title="Accessibility" 
            isExpanded={expandedSections['accessibility']}
            onToggle={() => toggleSection('accessibility')}
          >
            <div className="grid grid-cols-1 gap-4">
              {renderField('Accessibility Details', property.accessibility)}
            </div>
          </CollapsibleSection>
        )}

        {/* Furnishing */}
        {property.furnishing && (
          <CollapsibleSection 
            title="Furnishing" 
            isExpanded={expandedSections['furnishing']}
            onToggle={() => toggleSection('furnishing')}
          >
            <div className="grid grid-cols-1 gap-4">
              {renderField('Furnishing Details', property.furnishing)}
            </div>
          </CollapsibleSection>
        )}

        {/* Other Details */}
        {(property.age || property.documentation || property.possession || property.rental_info) && (
          <CollapsibleSection 
            title="Additional Details" 
            isExpanded={false}
            onToggle={() => toggleSection('other')}
          >
            <div className="grid grid-cols-1 gap-4">
              {renderField('Age', property.age)}
              {renderField('Documentation', property.documentation)}
              {renderField('Possession', property.possession)}
              {renderField('Rental Info', property.rental_info)}
              {renderField('Accessibility', property.accessibility)}
              {renderField('In Unit Features', property.inUnitFeatures)}
              {renderField('Location Details', property.location_details)}
              {renderField('Special Considerations', property.specialConsiderations)}
            </div>
          </CollapsibleSection>
        )}

        {/* Dates */}
        <CollapsibleSection 
          title="Dates & Timeline" 
          isExpanded={expandedSections['dates']}
          onToggle={() => toggleSection('dates')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('Listed Date', property.listedDate)}
            {renderField('Published At', property.published_at)}
            {renderField('Created At', property.created_at)}
            {renderField('Updated At', property.updated_at)}
            {renderField('Last Price Update', property.lastPriceUpdate)}
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
};

export default PropertyDetailPage;
