export interface Property {
  _id: string;
  id?: string;
  listing_id?: string;
  title: string;
  subtitle?: string;
  description_short?: string;
  description_long?: string;
  description_full?: string; // Legacy

  listing_type?: string;
  property_type?: string;
  propertyType?: string; // Legacy
  status?: string;

  // Location
  location_id?: string;
  location?: {
    city?: string;
    region?: string;
    state?: string;
    country?: string;
    timezone?: string;
    coordinates?: {
      latitude?: number | null;
      longitude?: number | null;
    };
    full_address?: string | null;
    zip_code?: string | null;
  };
  specificAddress?: {
    street?: string | null;
    area?: string | null;
    city?: string;
    state?: string;
    country?: string;
    region?: string;
    pincode?: string | null;
  };

  // Project & Developer
  project_info?: {
    is_part_of_project?: boolean;
    project_id?: string | null;
    project_name?: string | null;
    project_type?: string | null;
    project_status?: string | null;
    possession_date?: string | null;
    completion_date?: string | null;
    rarera_number?: string | null;
  };
  developer?: {
    developer_id?: string | null;
    name?: string;
    logo?: string;
  };

  // Pricing
  pricing?: {
    total_price?: {
      value?: number | null;
      currency?: string;
      display_value?: string | null;
      unit?: string | null;
      is_price_on_request?: boolean;
    };
    price_per_sqft?: {
      value?: number | null;
      currency?: string;
      display_value?: string | null;
      unit?: string;
    };
    original_price?: number | null;
    discount_percentage?: number | null;
  };

  // Specifications
  specifications?: {
    bedrooms?: number | null;
    bathrooms?: number | null;
    half_bathrooms?: number | null;
    parking_spaces?: number | null;
    property_age?: number | null;
    year_built?: number | null;
    floors?: number | null;
  };

  // Spatial Details
  spatialDetails?: {
    bedrooms?: number | null;
    bathrooms?: number | null;
    balconies?: number | null;
    half_bathrooms?: number;
    area?: {
      carpet?: number | null;
      builtUp?: number | null;
      unit?: string;
    };
    facing?: string | null;
    floorNumber?: number | null;
    layoutType?: string | null;
    viewQuality?: string;
  };

  // Area
  area?: {
    carpet_area_sqft?: number | null;
    built_up_area_sqft?: number | null;
    balcony_area_sqft?: number | null;
    living_area_sqft?: number | null;
    living_area_sqm?: number | null;
    plot_area_sqft?: number | null;
    total_area_sqft?: number | null;
  };

  // Amenities
  amenities?: {
    indoor_amenities?: string[];
    outdoor_amenities?: any[];
    parking_amenities?: any[];
    security_amenities?: any[];
    other_amenities?: string[];
  };
  amenities_summary?: {
    total_amenities_count?: number;
    primary_amenities?: string[];
    primary_amenities_images?: string[];
    additional_amenities_count?: number;
  };

  // Features
  features?: {
    construction_quality?: string;
    design_features?: any[];
    special_features?: any[];
    fittings_quality?: string | null;
    window_features?: string | null;
  };
  investment_highlights?: string[];

  // Visual Assets
  visual_assets?: {
    images?: Array<{
      src: string;
      title?: string;
      alt?: string;
      description?: string;
      type?: string;
      settings?: {
        width?: number;
        height?: number;
        duration?: number;
        focalPoint?: number[];
        posters?: Array<{
          url: string;
        }>;
      };
    }>;
    main_image_url?: string | null;
    thumbnail_url?: string | null;
    video_url?: string | null;
    virtual_tour_url?: string | null;
    floor_plan_url?: string | null;
  };

  // Badges
  badges?: {
    is_featured?: boolean;
    is_new_listing?: boolean;
    is_pre_launch?: boolean;
    is_premium?: boolean;
    is_verified?: boolean;
  };

  // Engagement
  engagement?: {
    views_count?: number;
    views_this_week?: number;
    saved_count?: number;
    share_count?: number;
    last_viewed_at?: string;
  };

  // Financial
  capital_appreciation?: {
    has_high_appreciation_potential?: boolean;
    projected_appreciation_rate?: number | null;
    prospects?: string | null;
  };
  rental_potential?: {
    has_high_rental_yield?: boolean;
    yield_percentage?: number | null;
    seasonal_demand?: {
      peak_season?: string | null;
      off_season?: string | null;
      peak_season_occupancy?: number | null;
      off_season_occupancy?: number | null;
    };
  };
  financial_metrics?: {
    roi_percentage?: number;
  };
  financial_benefits?: any;
  property_management?: any;

  // Legal & Parking
  legal_info?: {
    reraApproved?: boolean;
    reraNumber?: string | null;
    fireNOC?: boolean;
    occupancyCertificate?: boolean;
    permits?: any[];
  };
  parking?: {
    covered?: boolean;
    open?: boolean;
    evCharging?: boolean;
    visitorParking?: boolean;
  };

  // Listing Details
  listingDetails?: {
    listedBy?: string;
    listingId?: string;
  };

  // Other
  property_tags?: string[];
  accessibility?: any;
  age?: any;
  calculator_data?: any;
  documentation?: any;
  furnishing?: any;
  inUnitFeatures?: any;
  location_details?: any;
  luxuryAmenities?: any;
  marketMetrics?: any;
  microLocationPremium?: any;
  possession?: any;
  rental_info?: any;
  specialConsiderations?: any;

  // Dates
  listedDate?: string;
  lastPriceUpdate?: any;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;

  // Legacy fields (kept for backward compatibility)
  price?: string;
  images?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export type PropertyStatus = "AVAILABLE" | "SOLD" | "RESERVED" | "UNDER_CONTRACT";
