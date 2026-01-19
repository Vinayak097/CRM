import z from "zod";
export const leadZodSchema = z.object({
  identity: z
    .object({
      firstName: z.string().trim().optional(),
      lastName: z.string().trim().optional(),
      phone: z.string().trim().optional(),
      email: z.string().trim().toLowerCase().email().optional(),
      homeCountry: z.string().optional(),
      taxResidencyCountry: z.string().optional(),
      visaResidencyStatus: z.string().optional(),
      leadSource: z.string().optional(),
      ageYears: z.number().int().nonnegative().optional(),
      profession: z.string().optional(),
      householdSize: z.string().optional(),
      householdIncomeBandInr: z.string().optional(),
      priorPropertiesPurchased: z.string().optional(),
      propertyRolePrimary: z.array(z.string()).default([]),
      searchTrigger: z.array(z.string()).default([]),
      buyingJourneyStage: z.string().optional(),
      explorationDuration: z.string().optional(),
      purchaseTimeline: z.string().optional(),
      aboutYouNotes: z.string().optional(),
      ownershipTimelineNotes: z.string().optional(),
      household: {
        hasSeniorCitizen: z.string().optional(),
        hasChildren: z.string().optional(),
        hasPets: z.string().optional(),
      },
    })
    .optional()
    .default({
      propertyRolePrimary: [],
      searchTrigger: [],
      household: {},
    }), // Provide minimal object with required defaults

  location: z
    .object({
      buyingCountryFocus: z.string().optional(),
      targetStatesRegions: z.array(z.string()).default([]),
      climateRiskAvoidance: z.array(z.string()).default([]),
      targetLocations: z.array(z.string()).default([]),
      preferredClimate: z.array(z.string()).default([]),
      locationPriorities: z.array(z.string()).default([]),
      areaTypePreference: z.array(z.string()).default([]),
      naturalFeatureClosest: z.array(z.string()).default([]),
      locationDealbreakerNotes: z.string().optional(),
    })
    .optional()
    .default({
      targetStatesRegions: [],
      climateRiskAvoidance: [],
      targetLocations: [],
      preferredClimate: [],
      locationPriorities: [],
      areaTypePreference: [],
      naturalFeatureClosest: [],
    }), // Provide object with all array defaults

  property: z
    .object({
      strPermissionImportance: z.string().optional(),
      assetTypeInterest: z.array(z.string()).default([]),
      farmlandWaterSourcePreference: z.string().optional(),
      unitConfiguration: z.array(z.string()).default([]),
      farmlandLandSizeBucket: z.array(z.string()).default([]),
      ownershipStructurePreference: z.string().optional(),
      possessionStagePreference: z.string().optional(),
      possessionTimelineBucket: z.string().optional(),
      managementModelPreference: z.string().optional(),
      fundingPreference: z.string().optional(),
      communityFormatPreference: z.string().optional(),
      communityFriendlyFor: z.array(z.string()).default([]),
      communityOutdoorAmenitiesTop: z.array(z.string()).default([]),
      vastuPreferredDirections: z.array(z.string()).default([]),
      furnishingLevelPreference: z.string().optional(),
      homeMustHaveFeatures: z.array(z.string()).default([]),
      homeNiceToHaveFeatures: z.array(z.string()).default([]),
      interiorFinishLevel: z.string().optional(),
      smartHomeSecurityFeatures: z.array(z.string()).default([]),
      privateOutdoorFeatures: z.array(z.string()).default([]),
      propertyVisionNotes: z.string().optional(),
      idealHomeNotes: z.string().optional(),
      finalNotes: z.string().optional(),
    })
    .optional()
    .default({
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
    }), // Provide object with all array defaults

  system: z
    .object({
      leadStatus: z.string().default("New"),
      assignedAgent: z.string().optional(),
      priorityScore: z.number().default(0),
      investmentScore: z.number().default(0),
    })
    .default({
      leadStatus: "New",
      priorityScore: 0,
      investmentScore: 0,
    }),
});

export type LeadInput = z.infer<typeof leadZodSchema>;
