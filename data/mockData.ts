import { Booking, AdminBooking } from '@/types';

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