export type ProjectStatus = 'Planning' | 'Under Construction' | 'Completed' | 'Ready to Move';
export type OwnershipStructure = 'Freehold' | 'Leasehold' | 'Co-operative';

export interface Price {
    value: number;
    currency: string;
    display_value?: string;
}

export interface Developer {
    developer_id: string;
}

export interface ProjectDetails {
    developer_id?: string;
    developer_name?: string;
    total_units?: number;
    available_units?: number | null;
    sold_units?: number | null;
    unit_types_available?: string[];
    phase_number?: number | null;
}

export interface BuildingDetails {
    totalFloors?: number | null;
    totalUnits?: number;
    constructionYear?: number | null;
    buildingType?: string;
    constructionQuality?: string | null;
}

export interface Timeline {
    launch_date?: string | null;
    construction_start_date?: string | null;
    estimated_completion_date?: string | null;
    actual_completion_date?: string | null;
    possession_start_date?: string | null;
    warranty_period_months?: number | null;
}

export interface ProjectPricing {
    min_price: Price;
    max_price: Price;
    average_price: number;
    price_trend?: string;
}

export interface Compliance {
    reraApproved: boolean;
    reraNumber?: string;
    occupancyCertificate: boolean;
    fireNOC: boolean;
    permits?: string[];
}

export interface ProjectAmenities {
    recreational?: string[];
    outdoor?: string[];
    security?: string[];
    convenience?: string[];
}

export interface ProjectFeatures {
    design_approach?: string;
    construction_quality?: string;
    unique_selling_points?: string[];
}

export interface LocationContext {
    location_description?: string;
    strategic_location_benefits?: string;
    nearby_attractions?: string[];
    infrastructure_development?: string[];
}

export interface Sustainability {
    energyEfficiency?: {
        solar?: boolean;
        wind?: boolean;
    };
    waterManagement?: {
        recycling?: boolean;
    };
    carbonFootprint?: string;
    greenCertifications?: string[];
}

export interface Infrastructure {
    powerBackup?: {
        generator?: boolean;
    };
    waterSupply?: {
        storage?: string;
    };
    evChargingInfra?: boolean;
    digitalConnectivity?: string;
}

export interface Security {
    gatedCommunity?: boolean;
    surveillance?: {
        cctv?: boolean;
    };
    fireAndSafety?: boolean;
}

export interface Parking {
    covered?: boolean;
    open?: boolean;
    visitorParking?: boolean;
    evCharging?: boolean;
}

export interface AcousticPerformance {
    soundInsulationRating?: string;
    interUnitSoundproofing?: boolean;
}

export interface TargetMarket {
    segment?: string;
    demographics?: string[];
}

export interface FinancialMetrics {
    roi?: string;
    resalePotential?: string;
    occupancyRate?: string;
}

export interface SpecialFeatures {
    waterfront?: boolean;
    helipad?: boolean;
    culturalElements?: string;
}

export interface Policies {
    petPolicy?: string;
    rentalPolicies?: string;
    maxOccupancy?: string;
}

export interface PropertyProject {
    _id: string;
    name: string;
    subtitle?: string;
    project_type: string;
    project_status: ProjectStatus;
    description_short?: string;
    description_full?: string;
    location_id?: string;
    developer?: Developer;
    project_details?: ProjectDetails;
    buildingDetails?: BuildingDetails;
    timeline?: Timeline;
    project_pricing?: ProjectPricing;
    compliance?: Compliance;
    project_amenities?: ProjectAmenities;
    project_features?: ProjectFeatures;
    location_context?: LocationContext;
    units_inventory?: Record<string, any>;
    project_media?: Record<string, any>;
    sustainability?: Sustainability;
    infrastructure?: Infrastructure;
    security?: Security;
    parking?: Parking;
    maintenance?: Record<string, any>;
    acousticPerformance?: AcousticPerformance;
    targetMarket?: TargetMarket;
    financialMetrics?: FinancialMetrics;
    governance?: Record<string, any>;
    specialFeatures?: SpecialFeatures;
    policies?: Policies;
    ownershipStructure?: OwnershipStructure;
    availabilityStatus?: string;
    unitName?: string | null;
    unitNumber?: string | null;
    projectName?: string;
    created_at?: string;
    updated_at?: string;
}
