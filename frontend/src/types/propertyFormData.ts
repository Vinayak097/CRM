// Comprehensive interface for property form data
export interface PropertyFormData {
  // Basic Information
  title: string;
  subtitle: string;
  listing_id: string;
  listing_type: string;
  property_type: string;
  status: string;

  // Descriptions
  description_short: string;
  description_long: string;

  // Location
  location_id: string;
  specificAddress: {
    street: string;
    area: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  location: {
    city: string;
    region: string;
    state: string;
    country: string;
    full_address: string;
    timezone: string;
    zip_code: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };

  // Project & Developer
  project_info: {
    is_part_of_project: boolean;
    project_id: string;
    project_name: string;
    project_type: string;
    project_status: string;
    possession_date: string;
    completion_date: string;
    rarera_number: string;
  };
  developer: {
    developer_id: string;
    name: string;
    logo: string;
  };

  // Pricing
  pricing: {
    total_price: {
      value: number;
      currency: string;
      display_value: string;
      unit: string;
      is_price_on_request: boolean;
    };
    price_per_sqft: {
      value: number;
      currency: string;
      display_value: string;
      unit: string;
    };
    original_price: number;
    discount_percentage: number;
  };

  // Specifications
  specifications: {
    bedrooms: number;
    bathrooms: number;
    half_bathrooms: number;
    parking_spaces: number;
    property_age: number;
    year_built: number;
    floors: number;
  };

  // Area
  area: {
    carpet_area_sqft: number;
    built_up_area_sqft: number;
    balcony_area_sqft: number;
    living_area_sqft: number;
    living_area_sqm: number;
    plot_area_sqft: number;
    total_area_sqft: number;
  };

  // Spatial Details
  spatialDetails: {
    bedrooms: number;
    bathrooms: number;
    balconies: number;
    half_bathrooms: number;
    area: {
      carpet: number;
      builtUp: number;
      unit: string;
    };
    facing: string;
    floorNumber: number;
    layoutType: string;
    viewQuality: string;
  };

  // Amenities
  amenities: {
    indoor_amenities: string[];
    outdoor_amenities: any[];
    parking_amenities: any[];
    security_amenities: any[];
    other_amenities: string[];
  };
  amenities_summary: {
    total_amenities_count: number;
    primary_amenities: string[];
    additional_amenities_count: number;
    primary_amenities_images: string[];
  };

  // Visual Assets
  visual_assets: {
    images: Array<{
      src: string;
      title: string;
      type: string;
      description: string;
      alt: string;
      settings: {
        width: number;
        height: number;
        duration: number;
        focalPoint: number[];
        posters: Array<{
          url: string;
        }>;
      };
    }>;
    main_image_url: string;
    thumbnail_url: string;
    video_url: string;
    virtual_tour_url: string;
    floor_plan_url: string;
  };

  // Badges
  badges: {
    is_featured: boolean;
    is_new_listing: boolean;
    is_pre_launch: boolean;
    is_premium: boolean;
    is_verified: boolean;
  };

  // Engagement
  engagement: {
    views_count: number;
    views_this_week: number;
    saved_count: number;
    share_count: number;
    last_viewed_at: string;
  };

  // Tags & Features
  property_tags: string[];
  features: {
    construction_quality: string;
    design_features: any[];
    special_features: any[];
    fittings_quality: string;
    window_features: string;
  };
  investment_highlights: string[];

  // Financial
  capital_appreciation: {
    has_high_appreciation_potential: boolean;
    projected_appreciation_rate: number;
    prospects: string;
  };
  rental_potential: {
    has_high_rental_yield: boolean;
    yield_percentage: number;
    seasonal_demand: {
      peak_season: string;
      off_season: string;
      peak_season_occupancy: number;
      off_season_occupancy: number;
    };
  };
  property_management: any;
  financial_benefits: any;
  financial_metrics: {
    roi_percentage: number;
  };

  // Listing Details
  listingDetails: {
    listedBy: string;
    listingId: string;
  };

  // Complex/JSON Fields
  accessibility: any;
  age: any;
  calculator_data: any;
  documentation: any;
  furnishing: any;
  inUnitFeatures: any;
  legal_info: {
    reraApproved: boolean;
    reraNumber: string;
    fireNOC: boolean;
    occupancyCertificate: boolean;
    permits: any[];
  };
  location_details: {
    highways: string;
    major_markets: string;
    nearby_attractions: string[];
  };
  luxuryAmenities: any;
  marketMetrics: any;
  microLocationPremium: any;
  parking: {
    covered: boolean;
    open: boolean;
    evCharging: boolean;
    visitorParking: boolean;
  };
  possession: any;
  rental_info: any;
  specialConsiderations: any;

  // Dates
  listedDate: string;
  published_at: string;
  lastPriceUpdate: any;
}

// Default/initial form data
export const getDefaultFormData = (): PropertyFormData => ({
  title: "",
  subtitle: "",
  listing_id: "",
  listing_type: "SALE",
  property_type: "APARTMENT",
  status: "AVAILABLE",

  description_short: "",
  description_long: "",

  location_id: "",
  specificAddress: {
    street: "",
    area: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  },
  location: {
    city: "",
    region: "",
    state: "",
    country: "",
    full_address: "",
    timezone: "",
    zip_code: "",
    coordinates: {
      latitude: 0,
      longitude: 0,
    },
  },

  project_info: {
    is_part_of_project: false,
    project_id: "",
    project_name: "",
    project_type: "",
    project_status: "Ready to Move",
    possession_date: "",
    completion_date: "",
    rarera_number: "",
  },
  developer: {
    developer_id: "",
    name: "",
    logo: "",
  },

  pricing: {
    total_price: {
      value: 0,
      currency: "INR",
      display_value: "",
      unit: "",
      is_price_on_request: false,
    },
    price_per_sqft: {
      value: 0,
      currency: "INR",
      display_value: "",
      unit: "sqft",
    },
    original_price: 0,
    discount_percentage: 0,
  },

  specifications: {
    bedrooms: 0,
    bathrooms: 0,
    half_bathrooms: 0,
    parking_spaces: 0,
    property_age: 0,
    year_built: new Date().getFullYear(),
    floors: 1,
  },

  area: {
    carpet_area_sqft: 0,
    built_up_area_sqft: 0,
    balcony_area_sqft: 0,
    living_area_sqft: 0,
    living_area_sqm: 0,
    plot_area_sqft: 0,
    total_area_sqft: 0,
  },

  spatialDetails: {
    bedrooms: 0,
    bathrooms: 0,
    balconies: 0,
    half_bathrooms: 0,
    area: {
      carpet: 0,
      builtUp: 0,
      unit: "sqft",
    },
    facing: "",
    floorNumber: 0,
    layoutType: "",
    viewQuality: "",
  },

  amenities: {
    indoor_amenities: [],
    outdoor_amenities: [],
    parking_amenities: [],
    security_amenities: [],
    other_amenities: [],
  },
  amenities_summary: {
    total_amenities_count: 0,
    primary_amenities: [],
    additional_amenities_count: 0,
    primary_amenities_images: [],
  },

  visual_assets: {
    images: [],
    main_image_url: "",
    thumbnail_url: "",
    video_url: "",
    virtual_tour_url: "",
    floor_plan_url: "",
  },

  badges: {
    is_featured: false,
    is_new_listing: false,
    is_pre_launch: false,
    is_premium: false,
    is_verified: false,
  },

  engagement: {
    views_count: 0,
    views_this_week: 0,
    saved_count: 0,
    share_count: 0,
    last_viewed_at: "",
  },

  property_tags: [],
  features: {
    construction_quality: "",
    design_features: [],
    special_features: [],
    fittings_quality: "",
    window_features: "",
  },
  investment_highlights: [],

  capital_appreciation: {
    has_high_appreciation_potential: false,
    projected_appreciation_rate: 0,
    prospects: "",
  },
  rental_potential: {
    has_high_rental_yield: false,
    yield_percentage: 0,
    seasonal_demand: {
      peak_season: "",
      off_season: "",
      peak_season_occupancy: 0,
      off_season_occupancy: 0,
    },
  },
  property_management: {},
  financial_benefits: {},
  financial_metrics: {
    roi_percentage: 0,
  },

  listingDetails: {
    listedBy: "",
    listingId: "",
  },

  accessibility: {},
  age: {},
  calculator_data: {},
  documentation: {},
  furnishing: {},
  inUnitFeatures: {},
  legal_info: {
    reraApproved: false,
    reraNumber: "",
    fireNOC: false,
    occupancyCertificate: false,
    permits: [],
  },
  location_details: {
    highways: "",
    major_markets: "",
    nearby_attractions: [],
  },
  luxuryAmenities: {},
  marketMetrics: {},
  microLocationPremium: {},
  parking: {
    covered: false,
    open: false,
    evCharging: false,
    visitorParking: false,
  },
  possession: {},
  rental_info: {},
  specialConsiderations: {},

  listedDate: "",
  published_at: "",
  lastPriceUpdate: {},
});
