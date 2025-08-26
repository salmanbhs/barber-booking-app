import { Barber, Service, Booking, AdminBooking } from '@/types';

export const mockBarbers: Barber[] = [
  {
    id: '1',
    name: 'Mike Johnson',
    photo: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.9,
    specialties: ['Beard Trim', 'Classic Cut', 'Fade'],
    distance: '0.8 km away',
    experience: 8,
  },
  {
    id: '2',
    name: 'David Rodriguez',
    photo: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.7,
    specialties: ['Modern Cut', 'Styling', 'Color'],
    distance: '1.2 km away',
    experience: 5,
  },
  {
    id: '3',
    name: 'Alex Thompson',
    photo: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.8,
    specialties: ['Straight Razor', 'Traditional', 'Mustache'],
    distance: '2.1 km away',
    experience: 12,
  },
];

export const mockServices: Service[] = [
  {
    id: '1',
    name: 'Classic Haircut',
    description: 'Traditional haircut with scissors and clipper work',
    duration: 30,
    price: 25,
  },
  {
    id: '2',
    name: 'Beard Trim & Style',
    description: 'Professional beard trimming and styling',
    duration: 20,
    price: 15,
  },
  {
    id: '3',
    name: 'Hot Towel Shave',
    description: 'Traditional straight razor shave with hot towel treatment',
    duration: 45,
    price: 35,
  },
  {
    id: '4',
    name: 'Hair Wash & Conditioning',
    description: 'Deep cleansing shampoo and premium conditioning treatment',
    duration: 15,
    price: 12,
  },
  {
    id: '5',
    name: 'Fade Cut',
    description: 'Modern fade haircut with precision blending',
    duration: 35,
    price: 30,
  },
  {
    id: '6',
    name: 'Eyebrow Trim',
    description: 'Professional eyebrow trimming and shaping',
    duration: 10,
    price: 8,
  },
];

export const mockBookings: Booking[] = [
  {
    id: '1',
    barberName: 'Mike Johnson',
    services: ['Classic Haircut', 'Beard Trim'],
    date: new Date().toISOString().split('T')[0],
    time: '2:00 PM',
    totalPrice: 40,
    status: 'confirmed',
  },
  {
    id: '2',
    barberName: 'David Rodriguez',
    services: ['Fade Cut'],
    date: '2024-12-28',
    time: '10:30 AM',
    totalPrice: 30,
    status: 'completed',
  },
  {
    id: '3',
    barberName: 'Alex Thompson',
    services: ['Hot Towel Shave'],
    date: '2024-12-25',
    time: '3:15 PM',
    totalPrice: 35,
    status: 'completed',
  },
];

export const mockAdminBookings: AdminBooking[] = [
  {
    id: '1',
    customerName: 'John Smith',
    customerPhone: '+1 (555) 123-4567',
    services: ['Classic Haircut', 'Beard Trim'],
    date: new Date().toISOString().split('T')[0],
    time: '9:00 AM',
    duration: 50,
    totalPrice: 40,
    status: 'pending',
  },
  {
    id: '2',
    customerName: 'Robert Wilson',
    customerPhone: '+1 (555) 987-6543',
    services: ['Fade Cut'],
    date: new Date().toISOString().split('T')[0],
    time: '11:30 AM',
    duration: 35,
    totalPrice: 30,
    status: 'confirmed',
  },
  {
    id: '3',
    customerName: 'Michael Brown',
    customerPhone: '+1 (555) 456-7890',
    services: ['Hot Towel Shave'],
    date: new Date().toISOString().split('T')[0],
    time: '2:15 PM',
    duration: 45,
    totalPrice: 35,
    status: 'pending',
  },
];