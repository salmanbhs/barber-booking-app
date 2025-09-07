import AsyncStorage from '@react-native-async-storage/async-storage';
import { Barber, Service } from '@/types';

const BOOKING_DATA_KEY = 'BOOKING_DATA';

export interface BookingData {
  barber: Barber | null;
  selectedServices: Service[];
  date: string | null;
  time: string | null;
  totalPrice: number;
  totalDuration: number;
}

export const BookingStorage = {
  // Save the selected barber
  async saveBarber(barber: Barber): Promise<void> {
    try {
      const existingData = await this.getBookingData();
      const updatedData = { ...existingData, barber };
      await AsyncStorage.setItem(BOOKING_DATA_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error saving barber:', error);
    }
  },

  // Save the selected services
  async saveServices(services: Service[]): Promise<void> {
    try {
      const existingData = await this.getBookingData();
      const totalPrice = services.reduce((total, service) => total + service.price, 0);
      const totalDuration = services.reduce((total, service) => total + service.duration_minutes, 0);
      
      const updatedData = { 
        ...existingData, 
        selectedServices: services,
        totalPrice,
        totalDuration
      };
      await AsyncStorage.setItem(BOOKING_DATA_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error saving services:', error);
    }
  },

  // Save the selected date and time
  async saveDateAndTime(date: string, time: string): Promise<void> {
    try {
      const existingData = await this.getBookingData();
      const updatedData = { ...existingData, date, time };
      await AsyncStorage.setItem(BOOKING_DATA_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error saving date and time:', error);
    }
  },

  // Get all booking data
  async getBookingData(): Promise<BookingData> {
    try {
      const data = await AsyncStorage.getItem(BOOKING_DATA_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error retrieving booking data:', error);
    }
    
    // Return default booking data if nothing found or error occurs
    return {
      barber: null,
      selectedServices: [],
      date: null,
      time: null,
      totalPrice: 0,
      totalDuration: 0
    };
  },

  // Clear all booking data (useful after booking completion or cancellation)
  async clearBookingData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(BOOKING_DATA_KEY);
    } catch (error) {
      console.error('Error clearing booking data:', error);
    }
  },

  // Get just the barber data
  async getBarber(): Promise<Barber | null> {
    const data = await this.getBookingData();
    return data.barber;
  },

  // Get just the services data
  async getServices(): Promise<Service[]> {
    const data = await this.getBookingData();
    return data.selectedServices;
  },

  // Get just the date and time
  async getDateAndTime(): Promise<{ date: string | null; time: string | null }> {
    const data = await this.getBookingData();
    return { date: data.date, time: data.time };
  },

  // Get pricing information
  async getPricing(): Promise<{ totalPrice: number; totalDuration: number }> {
    const data = await this.getBookingData();
    return { totalPrice: data.totalPrice, totalDuration: data.totalDuration };
  }
};
