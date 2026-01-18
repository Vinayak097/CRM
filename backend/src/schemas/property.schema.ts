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
    title: z.string().min(1).max(200),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    description: z.string().min(50).max(5000),
    price: z
      .string()
      .or(z.number())
      .transform((val) => String(val)),
    locationId: z.string().min(1),
    propertyType: z.nativeEnum(PropertyType),
    bedrooms: z.number().int().min(0).max(50).optional(),
    bathrooms: z.number().int().min(0).max(50).optional(),
    area: z.number().positive(),
    floors: z.number().int().min(0).max(100).optional(),
    images: z
      .array(z.string().url())
      .or(z.string().transform((str) => JSON.parse(str))),
    amenities: z
      .array(z.string())
      .or(z.string().transform((str) => JSON.parse(str))),
    features: z
      .array(z.string())
      .or(z.string().transform((str) => JSON.parse(str))),
    coordinates: coordinatesSchema.or(
      z.string().transform((str) => JSON.parse(str))
    ),
    status: z.nativeEnum(PropertyStatus),
    featured: z.boolean().default(false),
    active: z.boolean().default(true),
    unitConfiguration: unitConfigurationSchema
      .optional()
      .nullable()
      .or(z.string().transform((str) => JSON.parse(str)).optional().nullable()),
    aboutProject: z.string().min(50).max(5000).optional().nullable(),
    legalApprovals: legalApprovalsSchema
      .optional()
      .nullable()
      .or(z.string().transform((str) => JSON.parse(str)).optional().nullable()),
    registrationCosts: registrationCostsSchema
      .optional()
      .nullable()
      .or(z.string().transform((str) => JSON.parse(str)).optional().nullable()),
    propertyManagement: z.string().min(50).max(5000).optional().nullable(),
    financialReturns: z.string().min(50).max(2000).optional().nullable(),
    investmentBenefits: z
      .array(z.string())
      .optional()
      .nullable()
      .or(z.string().transform((str) => JSON.parse(str)).optional().nullable()),
    nearbyInfrastructure: nearbyInfrastructureSchema
      .optional()
      .nullable()
      .or(z.string().transform((str) => JSON.parse(str)).optional().nullable()),
    plotSize: z.string().optional(),
    constructionStatus: z.string().or(z.nativeEnum(ConstructionStatus)),
    emiOptions: z.string().optional(),
    tags: z
      .array(z.string())
      .or(z.string().transform((str) => JSON.parse(str))),
    views: z.number().int().min(0).default(0),
  })
  .strict();

// Schema for creating new property
export const createPropertySchema = propertySchema.omit({
  views: true,
});

// Schema for updating property
export const updatePropertySchema = createPropertySchema.partial();

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
