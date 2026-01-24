import mongoose from 'mongoose';

// Sub-schemas
const PriceSchema = new mongoose.Schema({
    value: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    display_value: String
}, { _id: false });

const DeveloperSchema = new mongoose.Schema({
    developer_id: { type: String, required: true }
}, { _id: false });

const ProjectDetailsSchema = new mongoose.Schema({
    developer_id: String,
    developer_name: String,
    total_units: Number,
    available_units: Number,
    sold_units: Number,
    unit_types_available: [String],
    phase_number: Number
}, { _id: false });

const BuildingDetailsSchema = new mongoose.Schema({
    totalFloors: Number,
    totalUnits: Number,
    constructionYear: Number,
    buildingType: String,
    constructionQuality: String
}, { _id: false });

const TimelineSchema = new mongoose.Schema({
    launch_date: Date,
    construction_start_date: Date,
    estimated_completion_date: Date,
    actual_completion_date: Date,
    possession_start_date: Date,
    warranty_period_months: Number
}, { _id: false });

const ProjectPricingSchema = new mongoose.Schema({
    min_price: PriceSchema,
    max_price: PriceSchema,
    average_price: Number,
    price_trend: String
}, { _id: false });

const ComplianceSchema = new mongoose.Schema({
    reraApproved: { type: Boolean, default: false },
    reraNumber: String,
    occupancyCertificate: { type: Boolean, default: false },
    fireNOC: { type: Boolean, default: false },
    permits: [String]
}, { _id: false });

const ProjectAmenitiesSchema = new mongoose.Schema({
    recreational: [String],
    outdoor: [String],
    security: [String],
    convenience: [String]
}, { _id: false });

const ProjectFeaturesSchema = new mongoose.Schema({
    design_approach: String,
    construction_quality: String,
    unique_selling_points: [String]
}, { _id: false });

const LocationContextSchema = new mongoose.Schema({
    location_description: String,
    strategic_location_benefits: String,
    nearby_attractions: [String],
    infrastructure_development: [String]
}, { _id: false });

const SustainabilitySchema = new mongoose.Schema({
    energyEfficiency: {
        solar: Boolean,
        wind: Boolean
    },
    waterManagement: {
        recycling: Boolean
    },
    carbonFootprint: String,
    greenCertifications: [String]
}, { _id: false });

const InfrastructureSchema = new mongoose.Schema({
    powerBackup: {
        generator: Boolean
    },
    waterSupply: {
        storage: String
    },
    evChargingInfra: Boolean,
    digitalConnectivity: String
}, { _id: false });

const SecuritySchema = new mongoose.Schema({
    gatedCommunity: Boolean,
    surveillance: {
        cctv: Boolean
    },
    fireAndSafety: Boolean
}, { _id: false });

const ParkingSchema = new mongoose.Schema({
    covered: Boolean,
    open: Boolean,
    visitorParking: Boolean,
    evCharging: Boolean
}, { _id: false });

const AcousticPerformanceSchema = new mongoose.Schema({
    soundInsulationRating: String,
    interUnitSoundproofing: Boolean
}, { _id: false });

const TargetMarketSchema = new mongoose.Schema({
    segment: String,
    demographics: [String]
}, { _id: false });

const FinancialMetricsSchema = new mongoose.Schema({
    roi: String,
    resalePotential: String,
    occupancyRate: String
}, { _id: false });

const SpecialFeaturesSchema = new mongoose.Schema({
    waterfront: Boolean,
    helipad: Boolean,
    culturalElements: String
}, { _id: false });

const PoliciesSchema = new mongoose.Schema({
    petPolicy: String,
    rentalPolicies: String,
    maxOccupancy: String
}, { _id: false });

// Main Schema
const PropertyProjectSchema = new mongoose.Schema({
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    id: String,
    name: { type: String, required: true, trim: true },
    subtitle: String,
    project_type: { type: String, required: true },
    project_status: {
        type: String,
        enum: ['Planning', 'Under Construction', 'Completed', 'Ready to Move'],
        required: true
    },
    description_short: String,
    description_full: String,
    location_id: String,
    developer: DeveloperSchema,
    project_details: ProjectDetailsSchema,
    buildingDetails: BuildingDetailsSchema,
    timeline: TimelineSchema,
    project_pricing: ProjectPricingSchema,
    compliance: ComplianceSchema,
    project_amenities: ProjectAmenitiesSchema,
    project_features: ProjectFeaturesSchema,
    location_context: LocationContextSchema,
    units_inventory: { type: Map, of: mongoose.Schema.Types.Mixed },
    project_media: { type: Map, of: mongoose.Schema.Types.Mixed },
    sustainability: SustainabilitySchema,
    infrastructure: InfrastructureSchema,
    security: SecuritySchema,
    parking: ParkingSchema,
    maintenance: { type: Map, of: mongoose.Schema.Types.Mixed },
    acousticPerformance: AcousticPerformanceSchema,
    targetMarket: TargetMarketSchema,
    financialMetrics: FinancialMetricsSchema,
    governance: { type: Map, of: mongoose.Schema.Types.Mixed },
    specialFeatures: SpecialFeaturesSchema,
    policies: PoliciesSchema,
    ownershipStructure: {
        type: String,
        enum: ['Freehold', 'Leasehold', 'Co-operative']
    },
    availabilityStatus: String,
    unitName: String,
    unitNumber: String,
    projectName: String
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    collection: 'property_projects'
});

// Indexes for better query performance
PropertyProjectSchema.index({ name: 1 });
PropertyProjectSchema.index({ location_id: 1 });
PropertyProjectSchema.index({ project_status: 1 });
PropertyProjectSchema.index({ 'developer.developer_id': 1 });
PropertyProjectSchema.index({ project_type: 1 });
PropertyProjectSchema.index({ 'project_pricing.average_price': 1 });

// Virtual for price range
PropertyProjectSchema.virtual('priceRange').get(function (this: any) {
    if (this.project_pricing && this.project_pricing.min_price && this.project_pricing.max_price) {
        return `${this.project_pricing.min_price.display_value} - ${this.project_pricing.max_price.display_value}`;
    }
    return null;
});

// Method to check if project is available
PropertyProjectSchema.methods.isAvailable = function (this: any) {
    return this.project_status === 'Under Construction' ||
        this.project_status === 'Ready to Move';
};

// Static method to find luxury projects
PropertyProjectSchema.statics.findLuxuryProjects = function (this: any) {
    return this.find({ 'targetMarket.segment': 'luxury' });
};

// Export the model
const PropertyProject = mongoose.model('PropertyProject', PropertyProjectSchema);

export default PropertyProject;
