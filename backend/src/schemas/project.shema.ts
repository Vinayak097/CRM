import z from 'zod'

// Sub-schemas
const PriceSchema = z.object({
    value: z.number(),
    currency: z.string().default('INR'),
    display_value: z.string().optional()
});

const DeveloperSchema = z.object({
    developer_id: z.string()
});

const ProjectDetailsSchema = z.object({
    developer_id: z.string().optional(),
    developer_name: z.string().optional(),
    total_units: z.number().optional(),
    available_units: z.number().optional().nullable(),
    sold_units: z.number().optional().nullable(),
    unit_types_available: z.array(z.string()).optional(),
    phase_number: z.number().optional().nullable()
});

const BuildingDetailsSchema = z.object({
    totalFloors: z.number().optional().nullable(),
    totalUnits: z.number().optional(),
    constructionYear: z.number().optional().nullable(),
    buildingType: z.string().optional(),
    constructionQuality: z.string().optional().nullable()
});

const TimelineSchema = z.object({
    launch_date: z.string().datetime().optional().nullable(),
    construction_start_date: z.string().datetime().optional().nullable(),
    estimated_completion_date: z.string().datetime().optional().nullable(),
    actual_completion_date: z.string().datetime().optional().nullable(),
    possession_start_date: z.string().datetime().optional().nullable(),
    warranty_period_months: z.number().optional().nullable()
});

const ProjectPricingSchema = z.object({
    min_price: PriceSchema,
    max_price: PriceSchema,
    average_price: z.number(),
    price_trend: z.string().optional()
});

const ComplianceSchema = z.object({
    reraApproved: z.boolean().default(false),
    reraNumber: z.string().optional(),
    occupancyCertificate: z.boolean().default(false),
    fireNOC: z.boolean().default(false),
    permits: z.array(z.string()).optional()
});

const ProjectAmenitiesSchema = z.object({
    recreational: z.array(z.string()).optional(),
    outdoor: z.array(z.string()).optional(),
    security: z.array(z.string()).optional(),
    convenience: z.array(z.string()).optional()
});

const ProjectFeaturesSchema = z.object({
    design_approach: z.string().optional(),
    construction_quality: z.string().optional(),
    unique_selling_points: z.array(z.string()).optional()
});

const LocationContextSchema = z.object({
    location_description: z.string().optional(),
    strategic_location_benefits: z.string().optional(),
    nearby_attractions: z.array(z.string()).optional(),
    infrastructure_development: z.array(z.string()).optional()
});

const SustainabilitySchema = z.object({
    energyEfficiency: z.object({
        solar: z.boolean().optional(),
        wind: z.boolean().optional()
    }).optional(),
    waterManagement: z.object({
        recycling: z.boolean().optional()
    }).optional(),
    carbonFootprint: z.string().optional(),
    greenCertifications: z.array(z.string()).optional()
});

const InfrastructureSchema = z.object({
    powerBackup: z.object({
        generator: z.boolean().optional()
    }).optional(),
    waterSupply: z.object({
        storage: z.string().optional()
    }).optional(),
    evChargingInfra: z.boolean().optional(),
    digitalConnectivity: z.string().optional()
});

const SecuritySchema = z.object({
    gatedCommunity: z.boolean().optional(),
    surveillance: z.object({
        cctv: z.boolean().optional()
    }).optional(),
    fireAndSafety: z.boolean().optional()
});

const ParkingSchema = z.object({
    covered: z.boolean().optional(),
    open: z.boolean().optional(),
    visitorParking: z.boolean().optional(),
    evCharging: z.boolean().optional()
});

const AcousticPerformanceSchema = z.object({
    soundInsulationRating: z.string().optional(),
    interUnitSoundproofing: z.boolean().optional()
});

const TargetMarketSchema = z.object({
    segment: z.string().optional(),
    demographics: z.array(z.string()).optional()
});

const FinancialMetricsSchema = z.object({
    roi: z.string().optional(),
    resalePotential: z.string().optional(),
    occupancyRate: z.string().optional()
});

const SpecialFeaturesSchema = z.object({
    waterfront: z.boolean().optional(),
    helipad: z.boolean().optional(),
    culturalElements: z.string().optional()
});

const PoliciesSchema = z.object({
    petPolicy: z.string().optional(),
    rentalPolicies: z.string().optional(),
    maxOccupancy: z.string().optional()
});

// Main Schema
const PropertyProjectSchema = z.object({
    name: z.string().min(1, "Project name is required"),
    subtitle: z.string().optional(),
    project_type: z.string().min(1, "Project type is required"),
    project_status: z.enum(['Planning', 'Under Construction', 'Completed', 'Ready to Move']),
    description_short: z.string().optional(),
    description_full: z.string().optional(),
    location_id: z.string().optional(),
    developer: DeveloperSchema.optional(),
    project_details: ProjectDetailsSchema.optional(),
    buildingDetails: BuildingDetailsSchema.optional(),
    timeline: TimelineSchema.optional(),
    project_pricing: ProjectPricingSchema.optional(),
    compliance: ComplianceSchema.optional(),
    project_amenities: ProjectAmenitiesSchema.optional(),
    project_features: ProjectFeaturesSchema.optional(),
    location_context: LocationContextSchema.optional(),
    units_inventory: z.record(z.string(), z.any()).optional(),
    project_media: z.record(z.string(), z.any()).optional(),
    sustainability: SustainabilitySchema.optional(),
    infrastructure: InfrastructureSchema.optional(),
    security: SecuritySchema.optional(),
    parking: ParkingSchema.optional(),
    maintenance: z.record(z.string(), z.any()).optional(),
    acousticPerformance: AcousticPerformanceSchema.optional(),
    targetMarket: TargetMarketSchema.optional(),
    financialMetrics: FinancialMetricsSchema.optional(),
    governance: z.record(z.string(), z.any()).optional(),
    specialFeatures: SpecialFeaturesSchema.optional(),
    policies: PoliciesSchema.optional(),
    ownershipStructure: z.enum(['Freehold', 'Leasehold', 'Co-operative']).optional(),
    availabilityStatus: z.string().optional(),
    unitName: z.string().optional().nullable(),
    unitNumber: z.string().optional().nullable(),
    projectName: z.string().optional()
});

// Update schema (all fields optional)
const PropertyProjectUpdateSchema = PropertyProjectSchema.partial();

// Query params schema
const PropertyProjectQuerySchema = z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    project_status: z.string().optional(),
    project_type: z.string().optional(),
    location_id: z.string().optional(),
    developer_id: z.string().optional(),
    min_price: z.string().optional(),
    max_price: z.string().optional(),
    search: z.string().optional(),
    sort: z.string().optional().default('-created_at')
});

export {
    PropertyProjectSchema,
    PropertyProjectUpdateSchema,
    PropertyProjectQuerySchema
};