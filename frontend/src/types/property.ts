export interface Property {
  _id: string;
  listing_id?: string;
  title: string;
  subtitle?: string;
  description_short?: string;
  description_full?: string;
  
  listing_type?: string;
  property_type?: string; // "Managed Farmland" etc.
  propertyType?: string; // Legacy enum value if needed

  location_id?: string;
  location?: {
    city?: string;
    region?: string;
    state?: string;
    country?: string;
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
    full_address?: string;
    zip_code?: string;
  };
  specificAddress?: {
    street?: string;
    area?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };

  project_info?: {
    project_name?: string;
    project_status?: string;
    possession_date?: string;
  };

  developer?: {
    developer_id?: string;
    name?: string;
    logo?: string;
  };

  pricing?: {
    total_price?: {
      value?: number | string;
      currency?: string;
      display_value?: string;
      is_price_on_request?: boolean;
    };
    price_per_sqft?: {
      value?: number | string;
      display_value?: string;
    };
  };

  specifications?: {
    bedrooms?: number;
    bathrooms?: number;
    parking_spaces?: number;
    floors?: number;
  };
  
  spatialDetails?: {
    area?: {
      carpet_area_sqft?: number;
      plot_area_sqft?: number;
      unit?: string;
    };
  };

  amenities_summary?: {
    total_amenities_count?: number;
    primary_amenities?: string[];
  };
  
  visual_assets?: {
    images?: Array<{
      src: string;
      title?: string;
      type?: string;
    }>;
    main_image_url?: string;
    thumbnail_url?: string;
    video_url?: string;
    virtual_tour_url?: string;
  };

  badges?: {
    is_featured?: boolean;
    is_new_listing?: boolean; 
    is_premium?: boolean;
    is_verified?: boolean;
  };

  engagement?: {
    views_count?: number;
    saved_count?: number;
  };

  property_tags?: string[];
  
  // Legacy fields (kept for backward compatibility if needed)
  price?: string;
  images?: string[];
  amenities?: any;
  features?: any;
  coordinates?: {
    lat: number;
    lng: number;
  };
  
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type PropertyStatus = "AVAILABLE" | "SOLD" | "RESERVED" | "UNDER_CONTRACT";
