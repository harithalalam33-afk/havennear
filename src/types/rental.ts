export type PropertyType = 'Apartment' | 'House' | 'Townhouse' | 'Studio' | 'Loft' | 'Penthouse';

export type AvailabilityStatus = 'available_now' | 'available_soon' | 'pending_application' | 'rented';

export interface Landlord {
  id: string;
  name: string;
  avatar: string;
  role: 'Property Owner' | 'Property Manager' | 'Leasing Agent';
  company?: string;
  responseTime: string; // e.g. "within 10 mins"
  responseRate: number; // e.g. 98%
  verified: boolean;
  phone?: string;
  bio?: string;
}

export interface TourSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
}

export interface PriceHistoryPoint {
  month: string; // e.g. "Oct '25", "Nov '25"
  fullDate?: string; // e.g. "October 2025"
  price: number;
  neighborhoodMedian?: number;
  event?: 'Price Drop' | 'Price Increase' | 'Listed' | 'Lease Renewed' | 'Market Adjustment';
  note?: string;
}

export interface RentalProperty {
  id: string;
  title: string;
  tagline: string;
  description: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  lat: number;
  lng: number;
  price: number;
  originalPrice?: number;
  priceHistory?: PriceHistoryPoint[];
  deposit: number;
  propertyType: PropertyType;
  bedrooms: number; // 0 for studio
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  images: Array<{
    url: string;
    caption: string;
  }>;
  amenities: string[];
  availabilityStatus: AvailabilityStatus;
  availableDate: string; // e.g. "Immediate", "Oct 15, 2026"
  activeViewersCount: number;
  lastStatusUpdated: string;
  leaseTerms: string;
  petPolicy: {
    allowed: boolean;
    type: string;
    deposit?: number;
    monthlyFee?: number;
    restrictions?: string;
  };
  utilitiesIncluded: string[];
  parking: string;
  laundry: string;
  cooling: string;
  heating: string;
  scores: {
    walk: number;
    transit: number;
    bike: number;
  };
  landlord: Landlord;
  tourSlots: TourSlot[];
  featured?: boolean;
  specialOffer?: string;
  distanceMiles?: number;
}

export interface SearchFilters {
  query: string;
  neighborhood: string;
  maxDistanceMiles: number;
  minPrice: number;
  maxPrice: number;
  bedrooms: number | 'all'; // 'all' or 0, 1, 2, 3, 4+
  bathrooms: number | 'all';
  propertyTypes: PropertyType[];
  availability: 'all' | 'available_now' | 'available_soon';
  amenities: string[];
  petFriendlyOnly: boolean;
  inUnitLaundryOnly: boolean;
  parkingIncludedOnly: boolean;
  verifiedLandlordOnly: boolean;
  sortBy: 'recommended' | 'distance' | 'price_asc' | 'price_desc' | 'newest';
}

export interface ChatMessage {
  id: string;
  propertyId: string;
  senderId: string;
  senderName: string;
  senderRole: 'tenant' | 'landlord';
  text: string;
  timestamp: string;
  type?: 'text' | 'tour_invite' | 'tour_confirmed' | 'application_request' | 'status_update';
  tourDetails?: {
    date: string;
    time: string;
    tourType: 'In-Person' | 'Live Video Tour';
    status: 'confirmed' | 'pending' | 'rescheduled';
  };
  read: boolean;
  source?: 'n8n' | 'simulated' | 'user';
  n8nStatus?: 'success' | 'inactive' | 'error';
}

export interface ChatConversation {
  propertyId: string;
  propertyTitle: string;
  propertyPrice: number;
  propertyAddress: string;
  propertyImage: string;
  landlord: Landlord;
  lastMessage: string;
  lastMessageTimestamp: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface ActivityNotification {
  id: string;
  propertyId: string;
  propertyTitle: string;
  type: 'status_change' | 'application_received' | 'price_drop' | 'tour_booked' | 'new_listing';
  message: string;
  timestamp: string;
  highlight?: string;
}

export interface RentalApplication {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyPrice: number;
  propertyAddress: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  currentAddress: string;
  occupantsCount: number;
  petsCount: number;
  petDetails?: string;
  moveInDate: string;
  leaseTermMonths: number;
  employmentStatus: 'Employed Full-Time' | 'Employed Part-Time' | 'Self-Employed' | 'Student' | 'Other';
  employerName: string;
  jobTitle: string;
  annualIncome: number;
  creditScoreRange: '750+' | '700-749' | '650-699' | '600-649' | 'Under 600';
  hasEmergencyContact: boolean;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  references: string;
  additionalNotes?: string;
  status: 'submitted' | 'under_review' | 'approved' | 'declined';
  submittedAt: string;
}
