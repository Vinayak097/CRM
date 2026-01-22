export interface Location {
  _id: string;
  name: string;
  description: string;
  image?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  highlights: string[];
  amenities: Array<{
    name: string;
    icon: string;
  }>;
  featured: boolean;
  propertyCount: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLocationInput {
  name: string;
  description: string;
  image?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  highlights: string[];
  amenities: Array<{
    name: string;
    icon: string;
  }>;
  featured?: boolean;
  active?: boolean;
}

export interface UpdateLocationInput extends Partial<CreateLocationInput> {}
