export interface Itinerary {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  duration: string;
  travelers: number;
  budget: string;
  theme: string;
  status: 'draft' | 'shared' | 'feedback' | 'approved' | 'completed';
  createdAt: string;
  updatedAt: string;
  version: number;
  shareToken?: string;
  
  // Trip Details
  flights: {
    departure: string;
    return: string;
  };
  
  accommodation: {
    hotel: string;
    nights: number;
    rating: string;
  };
  
  // Day-by-day itinerary
  days: ItineraryDay[];
  
  inclusions: string[];
  exclusions: string[];
  
  // Consultant info
  consultant: {
    name: string;
    email: string;
    phone: string;
    company: string;
    logo?: string;
  };
  
  // Comments and collaboration
  comments: Comment[];
}

export interface ItineraryDay {
  day: number;
  date: string;
  title: string;
  city: string;
  activities: string[];
  meals: string;
  accommodation: string;
  images?: string[];
  description?: string;
}

export interface Comment {
  id: string;
  section: string;
  lineItem?: string;
  content: string;
  author: string;
  timestamp: string;
  status: 'pending' | 'addressed' | 'resolved';
  type: 'feedback' | 'change_request' | 'approval';
}

export interface TripSettings {
  destination: string;
  cities: string[];
  startDate: string;
  endDate: string;
  travelers: number;
  budget: string;
  theme: string;
  attractions?: string[];
  specialRequests?: string;
}