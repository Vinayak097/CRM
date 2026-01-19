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
  
  // Spatial Details
  spatialDetails: {
    bedrooms: number;
    bathrooms: number;
    balconies: number;
    area: {
      carpet: number;
      builtUp: number;
      carpet_area_sqft: number;
      unit: string;
    };
    facing: string;
    floorNumber: number;
    layoutType: string;
    viewQuality: string;
  };
  
  // Amenities
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
    }>;
    main_image_url: string;
    thumbnail_url: string;
    video_url: string;
    virtual_tour_url: string;
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
  features: string[];
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
    seasonal_demand: any;
  };
  property_management: any;
  financial_benefits: any;
  financial_metrics: any;
  
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
  legal_info: any;
  location_details: any;
  luxuryAmenities: any;
  marketMetrics: any;
  microLocationPremium: any;
  parking: any;
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
  
  spatialDetails: {
    bedrooms: 0,
    bathrooms: 0,
    balconies: 0,
    area: {
      carpet: 0,
      builtUp: 0,
      carpet_area_sqft: 0,
      unit: "sqft",
    },
    facing: "",
    floorNumber: 0,
    layoutType: "",
    viewQuality: "",
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
  features: [],
  investment_highlights: [],
  
  capital_appreciation: {
    has_high_appreciation_potential: false,
    projected_appreciation_rate: 0,
    prospects: "",
  },
  rental_potential: {
    has_high_rental_yield: false,
    yield_percentage: 0,
    seasonal_demand: {},
  },
  property_management: {},
  financial_benefits: {},
  financial_metrics: {},
  
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
  legal_info: {},
  location_details: {},
  luxuryAmenities: {},
  marketMetrics: {},
  microLocationPremium: {},
  parking: {},
  possession: {},
  rental_info: {},
  specialConsiderations: {},
  
  listedDate: "",
  published_at: "",
  lastPriceUpdate: {},
});
