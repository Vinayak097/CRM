// schemas/property.schema.ts
import { z } from "zod";

// Coordinate schema
export const coordinatesSchema = z
  .object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  })
  .strict();

// Property Status enum
export const PropertyStatus = {
  AVAILABLE: "AVAILABLE",
  SOLD: "SOLD",
  RESERVED: "RESERVED",
  UNDER_CONTRACT: "UNDER_CONTRACT",
} as const;

export type PropertyStatusType =
  (typeof PropertyStatus)[keyof typeof PropertyStatus];

// Property Type enum
export const PropertyType = {
  PLOT: "PLOT",
  VILLA: "VILLA",
  APARTMENT: "APARTMENT",
  FARM_HOUSE: "FARM_HOUSE",
  COMMERCIAL: "COMMERCIAL",
} as const;

export type PropertyTypeType = (typeof PropertyType)[keyof typeof PropertyType];

// Construction Status enum
export const ConstructionStatus = {
  UNDER_CONSTRUCTION: "Under Construction",
  READY_TO_MOVE: "Ready to Move",
  NEW_LAUNCH: "New Launch",
  COMPLETED: "Completed",
} as const;

export type ConstructionStatusType =
  (typeof ConstructionStatus)[keyof typeof ConstructionStatus];

// Legal Approvals schema
export const legalApprovalsSchema = z
  .object({
    type: z.string().optional(),
    details: z.string().optional(),
  })
  .strict();

// Registration Costs schema
export const registrationCostsSchema = z
  .object({
    stampDuty: z.string().optional(),
    registration: z.string().optional(),
  })
  .strict();

// Unit Configuration schema
export const unitConfigurationSchema = z
  .object({
    type: z.string().optional(),
    size: z.string().optional(),
    price: z.string().optional(),
  })
  .strict();

// Nearby Infrastructure schema
export const nearbyInfrastructureSchema = z
  .object({
    education: z.string().optional(),
    healthcare: z.string().optional(),
    shopping: z.string().optional(),
    transport: z.string().optional(),
  })
  .strict();

// Base Property schema
export const propertySchema = z
  .object({
    // Key Identity Fields
    listing_id: z.string().optional(),
    listing_type: z.string().optional(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    property_type: z.string().optional(),
    status: z.string().optional(),
    location_id: z.string().optional(),
    description_short: z.string().optional(),
    description_long: z.string().optional(),
    investment_highlights: z.array(z.string()).optional(),
    
    // Core Location & Address
    specificAddress: z.object({
      street: z.string().nullable().optional(),
      area: z.string().nullable().optional(),
      city: z.string().nullable().optional(),
      state: z.string().nullable().optional(),
      country: z.string().nullable().optional(),
      pincode: z.string().nullable().optional(),
    }).optional().nullable(),
    
    location: z.object({
        city: z.string().nullable().optional(),
        region: z.string().nullable().optional(),
        state: z.string().nullable().optional(),
        country: z.string().nullable().optional(),
        coordinates: z.object({
            latitude: z.number().nullable().optional(),
            longitude: z.number().nullable().optional(),
        }).optional().nullable(),
        full_address: z.string().nullable().optional(),
        timezone: z.string().nullable().optional(),
        zip_code: z.string().nullable().optional(),
    }).optional().nullable(),

    // Project & Developer
    project_info: z.object({
        is_part_of_project: z.boolean().optional(),
        project_id: z.string().nullable().optional(),
        project_name: z.string().nullable().optional(),
        project_type: z.string().nullable().optional(),
        project_status: z.string().nullable().optional(),
        possession_date: z.string().nullable().optional(),
        completion_date: z.string().nullable().optional(),
        rarera_number: z.string().nullable().optional(),
    }).optional().nullable(),
    
    developer: z.object({
        developer_id: z.string().optional(),
        name: z.string().optional(),
        logo: z.string().optional(),
    }).optional().nullable(),

    // Detailed Pricing
    pricing: z.object({
        total_price: z.object({
            value: z.number().or(z.string()).optional(),
            currency: z.string().optional(),
            display_value: z.string().optional(),
            unit: z.string().nullable().optional(),
            is_price_on_request: z.boolean().optional(),
        }).optional().nullable(),
        price_per_sqft: z.object({
            value: z.number().or(z.string()).optional(),
            currency: z.string().optional(),
            display_value: z.string().optional(),
            unit: z.string().optional(),
        }).optional().nullable(),
        original_price: z.number().or(z.string()).nullable().optional(),
        discount_percentage: z.number().or(z.string()).nullable().optional(),
    }).optional().nullable(),

    // Physical Specs
    specifications: z.object({
        bedrooms: z.number().nullable().optional(),
        bathrooms: z.number().nullable().optional(),
        half_bathrooms: z.number().nullable().optional(),
        parking_spaces: z.number().nullable().optional(),
        property_age: z.number().nullable().optional(),
        year_built: z.number().nullable().optional(),
        floors: z.number().nullable().optional(),
    }).optional().nullable(),
    
    spatialDetails: z.object({
        bedrooms: z.number().nullable().optional(),
        bathrooms: z.number().nullable().optional(),
        balconies: z.number().nullable().optional(),
        area: z.object({
             carpet: z.number().or(z.string()).nullable().optional(),
             builtUp: z.number().or(z.string()).nullable().optional(),
             unit: z.string().optional(),
        }).optional().nullable(),
        facing: z.string().nullable().optional(),
        floorNumber: z.number().or(z.string()).nullable().optional(),
        layoutType: z.string().nullable().optional(),
        viewQuality: z.string().nullable().optional(),
    }).optional().nullable(),

    amenities: z.any().optional().nullable(),

    amenities_summary: z.object({
        total_amenities_count: z.number().optional(),
        primary_amenities: z.array(z.string()).optional(),
        additional_amenities_count: z.number().optional(),
        primary_amenities_images: z.array(z.string()).optional(),
    }).optional().nullable(),

    features: z.any().optional().nullable(),

    // Media
    visual_assets: z.object({
        images: z.array(z.object({
            src: z.string(),
            title: z.string().optional(),
            type: z.string().optional(),
            description: z.string().optional(),
            alt: z.string().optional(),
            settings: z.record(z.string(), z.any()).optional(),
        })).optional(),
        main_image_url: z.string().optional(),
        thumbnail_url: z.string().optional(),
        video_url: z.string().optional(),
        virtual_tour_url: z.string().optional(),
    }).optional().nullable(),
    
    // Status & Engagement
    badges: z.object({
        is_featured: z.boolean().optional(),
        is_new_listing: z.boolean().optional(),
        is_pre_launch: z.boolean().optional(),
        is_premium: z.boolean().optional(),
        is_verified: z.boolean().optional(),
    }).optional().nullable(),
    
    engagement: z.object({
        views_count: z.number().optional(),
        views_this_week: z.number().optional(),
        saved_count: z.number().optional(),
        share_count: z.number().optional(),
        last_viewed_at: z.string().optional(),
    }).optional().nullable(),
    
    property_tags: z.array(z.string()).optional(),
    
    // Financials
    capital_appreciation: z.object({
        has_high_appreciation_potential: z.boolean().optional(),
        projected_appreciation_rate: z.number().or(z.string()).nullable().optional(),
        prospects: z.string().nullable().optional(),
    }).optional().nullable(),
    
    rental_potential: z.object({
        has_high_rental_yield: z.boolean().optional(),
        yield_percentage: z.number().or(z.string()).nullable().optional(),
        seasonal_demand: z.record(z.string(), z.any()).optional(),
    }).optional().nullable(),

    // Additional Sections
    listingDetails: z.object({
        listedBy: z.string().optional(),
        listingId: z.string().optional(),
    }).optional().nullable(),
    
    created_at: z.string().nullable().optional(),
    updated_at: z.string().nullable().optional(),
    published_at: z.string().nullable().optional(),
    
    // Loose/Legacy Fields (Keep but make optional)
    accessibility: z.record(z.string(), z.any()).optional(),
    age: z.record(z.string(), z.any()).optional(),
    calculator_data: z.record(z.string(), z.any()).optional(),
    documentation: z.record(z.string(), z.any()).optional(),
    financial_benefits: z.record(z.string(), z.any()).optional(),
    furnishing: z.record(z.string(), z.any()).optional(),
    inUnitFeatures: z.record(z.string(), z.any()).optional(),
    legal_info: z.record(z.string(), z.any()).optional(),
    location_details: z.object({
        highways: z.string().nullable().optional(),
        major_markets: z.string().nullable().optional(),
        nearby_attractions: z.any().nullable().optional(),
    }).optional().nullable(),
    luxuryAmenities: z.record(z.string(), z.any()).optional(),
    marketMetrics: z.record(z.string(), z.any()).optional(),
    microLocationPremium: z.any().optional(),
    parking: z.record(z.string(), z.any()).optional(),
    possession: z.record(z.string(), z.any()).optional(),
    rental_info: z.record(z.string(), z.any()).optional(),
    specialConsiderations: z.record(z.string(), z.any()).optional(),
    property_management: z.record(z.string(), z.any()).optional(),
    financial_metrics: z.record(z.string(), z.any()).optional(),
    lastPriceUpdate: z.any().optional(),
    listedDate: z.string().nullable().optional(),
    
    // Remaining Original Fields (Overwritten or Merged)
    views: z.number().int().min(0).default(0),
  });

// Schema for creating new property
export const createPropertySchema = propertySchema.omit({
  views: true,
});

// Schema for updating property
export const updatePropertySchema = createPropertySchema
  .extend({
    _id: z.any().optional(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
    __v: z.any().optional(),
    views: z.any().optional(),
  })
  .partial();

// Schema for query/filter properties
export const queryPropertySchema = z.object({
  page: z
    .string()
    .default("1")
    .transform(Number)
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .default("20")
    .transform(Number)
    .pipe(z.number().int().min(1).max(100)),
  search: z.string().optional(),
  propertyType: z.string().optional(),
  minPrice: z.string().transform(Number).pipe(z.number().positive()).optional(),
  maxPrice: z.string().transform(Number).pipe(z.number().positive()).optional(),
  minArea: z.string().transform(Number).pipe(z.number().positive()).optional(),
  maxArea: z.string().transform(Number).pipe(z.number().positive()).optional(),
  locationId: z.string().optional(),
  status: z.string().optional(),
  featured: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  active: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  tags: z.string().optional(),
});

// Types
export type Property = z.infer<typeof propertySchema> & {
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type QueryPropertyInput = z.infer<typeof queryPropertySchema>;
