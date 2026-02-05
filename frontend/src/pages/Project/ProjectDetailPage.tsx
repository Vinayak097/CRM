import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Edit2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { projectService } from "@/services/projectService";
import type { PropertyProject } from "@/types/project";
import { useUser } from "@/hooks/useAuth";

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const canEdit = user?.role === "admin" || user?.role === "onboarding_agent";
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    details: false,
    building: false,
    timeline: false,
    pricing: true,
    amenities: false,
    features: false,
    location: false,
    sustainability: false,
    infrastructure: false,
    security: false,
    parking: false,
    compliance: false,
    financial: false,
    target: false,
    special: false,
    policies: false,
    media: false,
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
  
  const [project, setProject] = useState<PropertyProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await projectService.getProjectById(id);
        setProject(response.data);
      } catch (err) {
        setError("Failed to fetch project details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !confirm("Are you sure you want to delete this project?")) return;
    setDeleting(true);
    try {
      await projectService.deleteProject(id);
      navigate("/projects");
    } catch {
      alert("Failed to delete project");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-400">
        Loading project details...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/projects")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="p-4 bg-red-500/20 border border-red-500 rounded text-red-400">
          {error || "Project not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 text-white bg-background min-h-screen w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/projects")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-semibold">{project.name}</h1>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/projects/${id}/edit`)}
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
        {/* Description */}
        {project.description_full && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-300 whitespace-pre-wrap">
              {project.description_full}
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
            {renderField('Project Type', project.project_type)}
            {renderField('Project Status', project.project_status)}
            {renderField('Availability Status', project.availabilityStatus)}
            {renderField('Subtitle', project.subtitle)}
            {renderField('Description Short', project.description_short)}
            {renderField('Location ID', project.location_id)}
            {renderField('Project Name', project.projectName)}
            {renderField('Unit Name', project.unitName)}
            {renderField('Unit Number', project.unitNumber)}
          </div>
        </CollapsibleSection>

        {/* Project Details */}
        {project.project_details && (
          <CollapsibleSection 
            title="Project Details" 
            isExpanded={expandedSections['details']}
            onToggle={() => toggleSection('details')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Developer ID', project.project_details.developer_id)}
              {renderField('Developer Name', project.project_details.developer_name)}
              {renderField('Total Units', project.project_details.total_units)}
              {renderField('Available Units', project.project_details.available_units)}
              {renderField('Sold Units', project.project_details.sold_units)}
              {renderField('Unit Types', project.project_details.unit_types_available)}
              {renderField('Phase Number', project.project_details.phase_number)}
            </div>
          </CollapsibleSection>
        )}

        {/* Building Details */}
        {project.buildingDetails && (
          <CollapsibleSection 
            title="Building Details" 
            isExpanded={expandedSections['building']}
            onToggle={() => toggleSection('building')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Total Floors', project.buildingDetails.totalFloors)}
              {renderField('Total Units', project.buildingDetails.totalUnits)}
              {renderField('Construction Year', project.buildingDetails.constructionYear)}
              {renderField('Building Type', project.buildingDetails.buildingType)}
              {renderField('Construction Quality', project.buildingDetails.constructionQuality)}
            </div>
          </CollapsibleSection>
        )}

        {/* Timeline */}
        {project.timeline && (
          <CollapsibleSection 
            title="Project Timeline" 
            isExpanded={expandedSections['timeline']}
            onToggle={() => toggleSection('timeline')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Launch Date', project.timeline.launch_date)}
              {renderField('Construction Start', project.timeline.construction_start_date)}
              {renderField('Estimated Completion', project.timeline.estimated_completion_date)}
              {renderField('Actual Completion', project.timeline.actual_completion_date)}
              {renderField('Possession Start', project.timeline.possession_start_date)}
              {renderField('Warranty Period (months)', project.timeline.warranty_period_months)}
            </div>
          </CollapsibleSection>
        )}

        {/* Pricing */}
        {project.project_pricing && (
          <CollapsibleSection 
            title="Pricing" 
            isExpanded={expandedSections['pricing']}
            onToggle={() => toggleSection('pricing')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.project_pricing.min_price && (
                renderField('Min Price', 
                  `${project.project_pricing.min_price.display_value || project.project_pricing.min_price.value} ${project.project_pricing.min_price.currency}`
                )
              )}
              {project.project_pricing.max_price && (
                renderField('Max Price', 
                  `${project.project_pricing.max_price.display_value || project.project_pricing.max_price.value} ${project.project_pricing.max_price.currency}`
                )
              )}
              {renderField('Average Price', project.project_pricing.average_price)}
              {renderField('Price Trend', project.project_pricing.price_trend)}
            </div>
          </CollapsibleSection>
        )}

        {/* Developer */}
        {project.developer && (
          <CollapsibleSection 
            title="Developer Information" 
            isExpanded={expandedSections['details']}
            onToggle={() => toggleSection('details')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Developer ID', project.developer.developer_id)}
            </div>
          </CollapsibleSection>
        )}

        {/* Amenities */}
        {project.project_amenities && (
          <CollapsibleSection 
            title="Project Amenities" 
            isExpanded={expandedSections['amenities']}
            onToggle={() => toggleSection('amenities')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Recreational', project.project_amenities.recreational)}
              {renderField('Outdoor', project.project_amenities.outdoor)}
              {renderField('Security', project.project_amenities.security)}
              {renderField('Convenience', project.project_amenities.convenience)}
            </div>
          </CollapsibleSection>
        )}

        {/* Features */}
        {project.project_features && (
          <CollapsibleSection 
            title="Project Features" 
            isExpanded={expandedSections['features']}
            onToggle={() => toggleSection('features')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Design Approach', project.project_features.design_approach)}
              {renderField('Construction Quality', project.project_features.construction_quality)}
              {renderField('Unique Selling Points', project.project_features.unique_selling_points)}
            </div>
          </CollapsibleSection>
        )}

        {/* Location Context */}
        {project.location_context && (
          <CollapsibleSection 
            title="Location Context" 
            isExpanded={expandedSections['location']}
            onToggle={() => toggleSection('location')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Location Description', project.location_context.location_description)}
              {renderField('Strategic Benefits', project.location_context.strategic_location_benefits)}
              {renderField('Nearby Attractions', project.location_context.nearby_attractions)}
              {renderField('Infrastructure Development', project.location_context.infrastructure_development)}
            </div>
          </CollapsibleSection>
        )}

        {/* Sustainability */}
        {project.sustainability && (
          <CollapsibleSection 
            title="Sustainability" 
            isExpanded={expandedSections['sustainability']}
            onToggle={() => toggleSection('sustainability')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Energy Efficiency', project.sustainability.energyEfficiency)}
              {renderField('Water Management', project.sustainability.waterManagement)}
              {renderField('Carbon Footprint', project.sustainability.carbonFootprint)}
              {renderField('Green Certifications', project.sustainability.greenCertifications)}
            </div>
          </CollapsibleSection>
        )}

        {/* Infrastructure */}
        {project.infrastructure && (
          <CollapsibleSection 
            title="Infrastructure" 
            isExpanded={expandedSections['infrastructure']}
            onToggle={() => toggleSection('infrastructure')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Power Backup', project.infrastructure.powerBackup)}
              {renderField('Water Supply', project.infrastructure.waterSupply)}
              {renderField('EV Charging Infrastructure', project.infrastructure.evChargingInfra)}
              {renderField('Digital Connectivity', project.infrastructure.digitalConnectivity)}
            </div>
          </CollapsibleSection>
        )}

        {/* Security */}
        {project.security && (
          <CollapsibleSection 
            title="Security Features" 
            isExpanded={expandedSections['security']}
            onToggle={() => toggleSection('security')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Gated Community', project.security.gatedCommunity)}
              {renderField('Surveillance', project.security.surveillance)}
              {renderField('Fire & Safety', project.security.fireAndSafety)}
            </div>
          </CollapsibleSection>
        )}

        {/* Parking */}
        {project.parking && (
          <CollapsibleSection 
            title="Parking Details" 
            isExpanded={expandedSections['parking']}
            onToggle={() => toggleSection('parking')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Covered Parking', project.parking.covered)}
              {renderField('Open Parking', project.parking.open)}
              {renderField('Visitor Parking', project.parking.visitorParking)}
              {renderField('EV Charging', project.parking.evCharging)}
            </div>
          </CollapsibleSection>
        )}

        {/* Compliance */}
        {project.compliance && (
          <CollapsibleSection 
            title="Compliance & Approvals" 
            isExpanded={expandedSections['compliance']}
            onToggle={() => toggleSection('compliance')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('RERA Approved', project.compliance.reraApproved)}
              {renderField('RERA Number', project.compliance.reraNumber)}
              {renderField('Occupancy Certificate', project.compliance.occupancyCertificate)}
              {renderField('Fire NOC', project.compliance.fireNOC)}
              {renderField('Permits', project.compliance.permits)}
            </div>
          </CollapsibleSection>
        )}

        {/* Acoustic Performance */}
        {project.acousticPerformance && (
          <CollapsibleSection 
            title="Acoustic Performance" 
            isExpanded={false}
            onToggle={() => toggleSection('acoustic')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Sound Insulation Rating', project.acousticPerformance.soundInsulationRating)}
              {renderField('Inter-Unit Soundproofing', project.acousticPerformance.interUnitSoundproofing)}
            </div>
          </CollapsibleSection>
        )}

        {/* Target Market */}
        {project.targetMarket && (
          <CollapsibleSection 
            title="Target Market" 
            isExpanded={expandedSections['target']}
            onToggle={() => toggleSection('target')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Segment', project.targetMarket.segment)}
              {renderField('Demographics', project.targetMarket.demographics)}
            </div>
          </CollapsibleSection>
        )}

        {/* Financial Metrics */}
        {project.financialMetrics && (
          <CollapsibleSection 
            title="Financial Metrics" 
            isExpanded={expandedSections['financial']}
            onToggle={() => toggleSection('financial')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('ROI', project.financialMetrics.roi)}
              {renderField('Resale Potential', project.financialMetrics.resalePotential)}
              {renderField('Occupancy Rate', project.financialMetrics.occupancyRate)}
            </div>
          </CollapsibleSection>
        )}

        {/* Special Features */}
        {project.specialFeatures && (
          <CollapsibleSection 
            title="Special Features" 
            isExpanded={expandedSections['special']}
            onToggle={() => toggleSection('special')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Waterfront', project.specialFeatures.waterfront)}
              {renderField('Helipad', project.specialFeatures.helipad)}
              {renderField('Cultural Elements', project.specialFeatures.culturalElements)}
            </div>
          </CollapsibleSection>
        )}

        {/* Policies */}
        {project.policies && (
          <CollapsibleSection 
            title="Policies" 
            isExpanded={expandedSections['policies']}
            onToggle={() => toggleSection('policies')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Pet Policy', project.policies.petPolicy)}
              {renderField('Rental Policies', project.policies.rentalPolicies)}
              {renderField('Max Occupancy', project.policies.maxOccupancy)}
            </div>
          </CollapsibleSection>
        )}

        {/* Ownership Structure */}
        {project.ownershipStructure && (
          <CollapsibleSection 
            title="Ownership Structure" 
            isExpanded={false}
            onToggle={() => toggleSection('ownership')}
          >
            <div className="grid grid-cols-1 gap-4">
              {renderField('Ownership Type', project.ownershipStructure)}
            </div>
          </CollapsibleSection>
        )}

        {/* Governance */}
        {project.governance && (
          <CollapsibleSection 
            title="Governance" 
            isExpanded={false}
            onToggle={() => toggleSection('governance')}
          >
            <div className="grid grid-cols-1 gap-4">
              {renderField('Governance Details', project.governance)}
            </div>
          </CollapsibleSection>
        )}

        {/* Maintenance */}
        {project.maintenance && (
          <CollapsibleSection 
            title="Maintenance" 
            isExpanded={false}
            onToggle={() => toggleSection('maintenance')}
          >
            <div className="grid grid-cols-1 gap-4">
              {renderField('Maintenance Details', project.maintenance)}
            </div>
          </CollapsibleSection>
        )}

        {/* Units Inventory */}
        {project.units_inventory && (
          <CollapsibleSection 
            title="Units Inventory" 
            isExpanded={false}
            onToggle={() => toggleSection('inventory')}
          >
            <div className="grid grid-cols-1 gap-4">
              {renderField('Inventory', project.units_inventory)}
            </div>
          </CollapsibleSection>
        )}

        {/* Project Media */}
        {project.project_media && (
          <CollapsibleSection 
            title="Project Media" 
            isExpanded={expandedSections['media']}
            onToggle={() => toggleSection('media')}
          >
            <div className="grid grid-cols-1 gap-4">
              {renderField('Media', project.project_media)}
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
            {renderField('Created At', project.created_at)}
            {renderField('Updated At', project.updated_at)}
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
