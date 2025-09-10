import AsyncStorage from '@react-native-async-storage/async-storage';
import { Barber } from '@/types';

const BARBERS_KEY = 'barber_app_barbers';
const BARBERS_TIMESTAMP_KEY = 'barber_app_barbers_timestamp';

// Cache duration in milliseconds (24 hours)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export interface BarbersCache {
  barbers: Barber[];
  timestamp: number;
}

export const BarberStorage = {
  // Save barbers to local storage
  async saveBarbers(barbers: Barber[]): Promise<void> {
    try {
      const timestamp = Date.now();
      await AsyncStorage.setItem(BARBERS_KEY, JSON.stringify(barbers));
      await AsyncStorage.setItem(BARBERS_TIMESTAMP_KEY, timestamp.toString());
      console.log('✅ Barbers saved to local storage:', barbers.length, 'barbers');
    } catch (error) {
      console.error('❌ Error saving barbers:', error);
      throw error;
    }
  },

  // Get barbers from local storage
  async getBarbers(): Promise<Barber[]> {
    try {
      const barbersData = await AsyncStorage.getItem(BARBERS_KEY);
      if (barbersData) {
        const barbers: Barber[] = JSON.parse(barbersData);
        console.log('📱 Retrieved barbers from local storage:', barbers.length, 'barbers');
        return barbers;
      }
      return [];
    } catch (error) {
      console.error('❌ Error getting barbers:', error);
      return [];
    }
  },

  // Check if barbers cache is expired
  async isCacheExpired(): Promise<boolean> {
    try {
      const timestampData = await AsyncStorage.getItem(BARBERS_TIMESTAMP_KEY);
      if (!timestampData) {
        return true; // No timestamp means cache doesn't exist
      }
      
      const timestamp = parseInt(timestampData, 10);
      const now = Date.now();
      const isExpired = (now - timestamp) > CACHE_DURATION;
      
      console.log('⏰ Cache age:', Math.round((now - timestamp) / (1000 * 60)), 'minutes');
      console.log('🔍 Cache expired:', isExpired);
      
      return isExpired;
    } catch (error) {
      console.error('❌ Error checking cache expiration:', error);
      return true; // If there's an error, consider cache expired
    }
  },

  // Get cached barbers with timestamp info
  async getCachedBarbers(): Promise<BarbersCache | null> {
    try {
      const barbers = await this.getBarbers();
      const timestampData = await AsyncStorage.getItem(BARBERS_TIMESTAMP_KEY);
      
      if (barbers.length > 0 && timestampData) {
        return {
          barbers,
          timestamp: parseInt(timestampData, 10)
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting cached barbers:', error);
      return null;
    }
  },

  // Clear barbers cache
  async clearBarbers(): Promise<void> {
    try {
      await AsyncStorage.removeItem(BARBERS_KEY);
      await AsyncStorage.removeItem(BARBERS_TIMESTAMP_KEY);
      console.log('🗑️ Barbers cache cleared');
    } catch (error) {
      console.error('❌ Error clearing barbers cache:', error);
    }
  },

  // Get barber by ID
  async getBarberById(barberId: string): Promise<Barber | null> {
    try {
      const barbers = await this.getBarbers();
      const barber = barbers.find(b => b.id === barberId);
      return barber || null;
    } catch (error) {
      console.error('❌ Error getting barber by ID:', error);
      return null;
    }
  },

  // Check if barbers exist in storage
  async hasBarbers(): Promise<boolean> {
    try {
      const barbers = await this.getBarbers();
      return barbers.length > 0;
    } catch (error) {
      console.error('❌ Error checking if barbers exist:', error);
      return false;
    }
  }
};
