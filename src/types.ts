export interface User {
  id: string;
  email: string;
  username: string;
  role: "user" | "admin";
  avatarUrl?: string;
  createdAt: string;
}

export interface Activity {
  time: string; // "Morning" | "Afternoon" | "Evening"
  description: string;
  location: string;
  cost: number;
  transport: string;
}

export interface DayItinerary {
  day: number;
  hotel: string;
  transportation: string;
  estimated_cost: number;
  activities: Activity[];
  food: string[];
}

export interface Trip {
  id: string;
  userId: string;
  fromCity?: string;
  destination: string;
  days: number;
  budget: number;
  style: string;
  travelers: number;
  interests: string[];
  tripSummary: string;
  totalEstimatedBudget: number;
  daysItinerary: DayItinerary[];
  hotels: any[];
  restaurants: any[];
  attractions: any[];
  localTips: string[];
  weather?: {
    temp: number;
    humidity: number;
    condition: string;
    forecast: { day: string; temp: number; condition: string }[];
  };
  flightRecommendations?: any[];
  emergencyContacts?: {
    police: string;
    medical: string;
    embassy: string;
  };
  collaborators?: string[];
  createdAt: string;
}

export interface Expense {
  id: string;
  tripId: string;
  userId: string;
  description: string;
  amount: number;
  category: "food" | "lodging" | "transport" | "activity" | "other";
  date: string;
  paidBy: string;
}

export interface ChecklistItem {
  id: string;
  tripId: string;
  userId: string;
  category: string;
  text: string;
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning";
  read: boolean;
  createdAt: string;
}
