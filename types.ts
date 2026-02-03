
export enum UrgencyLevel {
  EMERGENCY = 'Emergency',
  URGENT = 'Urgent',
  STANDARD = 'Standard'
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'Available' | 'On Call' | 'Offline';
  specialty: string;
}

export interface Appointment {
  id: string;
  customerName: string;
  serviceType: string;
  date: string;
  time: string;
  technicianId?: string;
}

export interface Lead {
  id: string;
  timestamp: number;
  fullName: string;
  phoneNumber: string;
  email?: string;
  address: string;
  serviceType: string;
  description: string;
  urgency: UrgencyLevel;
  status: 'Pending' | 'Dispatched' | 'Scheduled' | 'Completed';
  appointmentDate?: string;
  appointmentTime?: string;
  confirmationNumber?: string;
  inServiceArea?: boolean;
  alternativeRecommendations?: string[];
}

export interface TranscriptionItem {
  speaker: 'AI' | 'User';
  text: string;
  timestamp: number;
}

export interface CallState {
  isActive: boolean;
  transcription: TranscriptionItem[];
  currentLead: Partial<Lead>;
}
