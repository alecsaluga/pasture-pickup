export interface Vendor {
  id: string;
  name: string;
  phone: string;
  email: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  latitude: number;
  longitude: number;
  serviceTypes: string[];
  species: string[];
  serviceRadius: number;
  description: string;
  status: 'Active' | 'Pending' | 'Inactive';
  emergencyService: boolean;
  insuranceCertified: boolean;
  businessHours: string;
  featuredImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorSubmission {
  id: string;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  services: string[];
  submissionStatus: 'Pending' | 'Approved' | 'Rejected';
  submittedAt: string;
  submitterIP: string;
  description?: string;
  website?: string;
  serviceRadius?: number;
  emergencyService?: boolean;
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
  name: string;
}

export interface SearchFilters {
  location?: Location;
  serviceTypes?: string[];
  species?: string[];
  emergencyOnly?: boolean;
  radius?: number;
}

export const SERVICE_TYPES = [
  'Dead Horse Removal',
  'Dead Cattle Removal', 
  'Dead Sheep/Goat Removal',
  'Emergency Livestock Removal',
  'Farm Cleanup Services'
] as const;

export const LIVESTOCK_SPECIES = [
  'Horse',
  'Cattle',
  'Sheep',
  'Goats',
  'Pigs',
  'Other'
] as const;