export interface Barber {
  id: string;
  user: {
    name: string;
    email: string;
  };
  specialties: string[];
  experience_years: number;
  rating: number;
  bio: string;
  profile_image_url: string | null;
  hire_date: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  barberName: string;
  services: string[];
  date: string;
  time: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
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