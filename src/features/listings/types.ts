export interface Listing {
  id: string;
  title: string;
  description: string;
  location: string;
  pricePerNight: number;
  price?: number;
  guests: number;
  type: "APARTMENT" | "HOUSE" | "HOTEL" ;
  propertyType?: "APARTMENT" | "HOUSE" | "HOTEL"  ;
  category?:  "HOTEL" | "HOUSE" | "APARTMENT";
  amenities: string[];
  rating: number | null;
  createdAt?: string;
  updatedAt?: string;
  hostId?: string;
  hostName?: string;
  superhost?: boolean;
  img?: string[];
  available?: boolean;
  availableFrom?: string;
  status?: string;
}