export type NavigationTab = 
  | 'overview' 
  | 'ai-forecast' 
  | 'staff-roster' 
  | 'talent-pool' 
  | 'whatsapp-simulator'
  | 'analytics' 
  | 'settings';

export interface WhatsAppMessage {
  id: string;
  sender: 'hotel' | 'employee' | 'system';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  isShiftOffer?: boolean;
  shiftDetails?: {
    id: string;
    property: string;
    role: string;
    department: string;
    date: string;
    time: string;
    pay: string;
    status: 'pending' | 'accepted' | 'declined';
  };
}

export type ShiftType = 'morning' | 'day' | 'evening' | 'night' | 'vacant' | 'off';

export interface Shift {
  id: string;
  employeeId: string;
  dayIndex: number; // 0 = Mon, 6 = Sun
  dayName: string; // 'Mon', 'Tue', ...
  dateStr: string; // 'Apr 21'
  timeRange: string; // '07:00 - 15:00'
  duration: string; // '8h'
  shiftLabel: string; // 'Morning', 'Evening', 'Day', 'Open Shift'
  role: string; // 'Morning Shift', 'Floor Lead', 'Dinner Rush Coverage'
  status: 'Confirmed' | 'Vacant' | 'Leave' | 'Sick Leave' | 'Vacation' | 'Unavailability';
  department: string;
  staffNeeded?: number;
  highlighted?: boolean;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  totalWeeklyHours: number;
  avatarUrl: string;
  shifts: Shift[];
}

export interface TalentCandidate {
  id: string;
  name: string;
  role: string;
  department: string;
  rating: number;
  gigsCompleted: number;
  experienceYears: number | string;
  availabilityRange: string;
  distanceKm: number;
  matchScore: number;
  status: 'Available' | 'Offer Sent' | 'Declined' | 'Hired';
  skills: string[];
  badges: string[];
  avatarUrl?: string;
  initials?: string;
  bio?: string;
  selectedForDispatch?: boolean;
}

export interface DepartmentMetric {
  name: string;
  required: number;
  available: number;
  gap: number;
  icon: string;
  color: string;
}

export interface ForecastDay {
  date: string;
  dayShort: string;
  housekeeping: number;
  frontDesk: number;
  restaurant: number;
  kitchen: number;
  isPeak?: boolean;
  totalRequired?: number;
  totalAvailable?: number;
}
