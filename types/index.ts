export interface Barber {
  id: string;
  name: string;
  email?: string;
  photo: string;
  rating: number;
  specialties: string[];
  distance?: string;
  experience: number;
  bio?: string;
  hire_date?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // duration_minutes from API
  price: number;
  category: string;
  is_active?: boolean;
}

export interface Booking {
  id: string;
  confirmation_code?: string;
  barberName: string;
  barberId?: string;
  services: string[];
  serviceIds?: string[];
  date: string;
  time: string;
  duration?: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  special_requests?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminBooking {
  id: string;
  customerName: string;
  customerPhone: string;
  services: string[];
  date: string;
  time: string;
  duration: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export interface CompanyConfig {
  id: string;
  company_name: string;
  company_description: string;
  company_logo_url: string | null;
  company_phone: string;
  company_email: string;
  company_address: string | null;
  company_website: string | null;
  working_hours: {
    [key: string]: {
      isOpen: boolean;
      shifts: Array<{
        start: string;
        end: string;
      }>;
    };
  };
  holidays: any[];
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  booking_advance_hours: number;
  default_service_duration: number;
  time_slot_interval: number;
  max_daily_bookings: number;
  currency: string;
  sms_notifications: boolean;
  email_notifications: boolean;
  reminder_hours_before: number;
  social_media: {
    twitter: string;
    facebook: string;
    whatsapp: string;
    instagram: string;
    google_business: string;
  };
  is_active: boolean;
  maintenance_mode: boolean;
  maintenance_message: string;
  created_at: string;
  updated_at: string;
}