export interface Barber {
  id: string;
  name: string;
  photo: string;
  rating: number;
  specialties: string[];
  distance: string;
  experience: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
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