import AsyncStorage from '@react-native-async-storage/async-storage';
import { Service } from '@/types';

const SERVICES_KEY = 'barber_app_services';
const SERVICES_TIMESTAMP_KEY = 'barber_app_services_timestamp';

// Cache duration in milliseconds (24 hours)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export interface ServicesData {
  services: Service[];
  servicesByCategory: Record<string, Service[]>;
  categories: string[];
  count: number;
}

export interface ServicesCache {
  servicesData: ServicesData;
  timestamp: number;
}

export const ServiceStorage = {
  // Save services to local storage
  async saveServices(servicesData: ServicesData): Promise<void> {
    try {
      const timestamp = Date.now();
      await AsyncStorage.setItem(SERVICES_KEY, JSON.stringify(servicesData));
      await AsyncStorage.setItem(SERVICES_TIMESTAMP_KEY, timestamp.toString());
      console.log('✅ Services saved to local storage:', servicesData.services.length, 'services');
    } catch (error) {
      console.error('❌ Error saving services:', error);
      throw error;
    }
  },

  // Get services from local storage
  async getServices(): Promise<Service[]> {
    try {
      const servicesData = await AsyncStorage.getItem(SERVICES_KEY);
      if (servicesData) {
        const parsed: ServicesData = JSON.parse(servicesData);
        console.log('📱 Retrieved services from local storage:', parsed.services.length, 'services');
        return parsed.services;
      }
      return [];
    } catch (error) {
      console.error('❌ Error getting services:', error);
      return [];
    }
  },

  // Get full services data (including categories)
  async getServicesData(): Promise<ServicesData | null> {
    try {
      const servicesData = await AsyncStorage.getItem(SERVICES_KEY);
      if (servicesData) {
        const parsed: ServicesData = JSON.parse(servicesData);
        console.log('📱 Retrieved services data from local storage');
        return parsed;
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting services data:', error);
      return null;
    }
  },

  // Check if services cache is expired
  async isCacheExpired(): Promise<boolean> {
    try {
      const timestampData = await AsyncStorage.getItem(SERVICES_TIMESTAMP_KEY);
      if (!timestampData) {
        return true; // No timestamp means cache doesn't exist
      }
      
      const timestamp = parseInt(timestampData, 10);
      const now = Date.now();
      const isExpired = (now - timestamp) > CACHE_DURATION;
      
      console.log('⏰ Services cache age:', Math.round((now - timestamp) / (1000 * 60)), 'minutes');
      console.log('🔍 Services cache expired:', isExpired);
      
      return isExpired;
    } catch (error) {
      console.error('❌ Error checking services cache expiration:', error);
      return true; // If there's an error, consider cache expired
    }
  },

  // Get cached services with timestamp info
  async getCachedServices(): Promise<ServicesCache | null> {
    try {
      const servicesData = await this.getServicesData();
      const timestampData = await AsyncStorage.getItem(SERVICES_TIMESTAMP_KEY);
      
      if (servicesData && timestampData) {
        return {
          servicesData,
          timestamp: parseInt(timestampData, 10)
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting cached services:', error);
      return null;
    }
  },

  // Clear services cache
  async clearServices(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SERVICES_KEY);
      await AsyncStorage.removeItem(SERVICES_TIMESTAMP_KEY);
      console.log('🗑️ Services cache cleared');
    } catch (error) {
      console.error('❌ Error clearing services cache:', error);
    }
  },

  // Get service by ID
  async getServiceById(serviceId: string): Promise<Service | null> {
    try {
      const services = await this.getServices();
      const service = services.find(s => s.id === serviceId);
      return service || null;
    } catch (error) {
      console.error('❌ Error getting service by ID:', error);
      return null;
    }
  },

  // Get services by category
  async getServicesByCategory(category: string): Promise<Service[]> {
    try {
      const servicesData = await this.getServicesData();
      if (servicesData && servicesData.servicesByCategory[category]) {
        return servicesData.servicesByCategory[category];
      }
      
      // Fallback: filter from all services
      const services = await this.getServices();
      return services.filter(s => s.category === category);
    } catch (error) {
      console.error('❌ Error getting services by category:', error);
      return [];
    }
  },

  // Get all categories
  async getCategories(): Promise<string[]> {
    try {
      const servicesData = await this.getServicesData();
      if (servicesData && servicesData.categories) {
        return servicesData.categories;
      }
      
      // Fallback: extract categories from services
      const services = await this.getServices();
      const categories = [...new Set(services.map(s => s.category))];
      return categories;
    } catch (error) {
      console.error('❌ Error getting categories:', error);
      return [];
    }
  },

  // Check if services exist in storage
  async hasServices(): Promise<boolean> {
    try {
      const services = await this.getServices();
      return services.length > 0;
    } catch (error) {
      console.error('❌ Error checking if services exist:', error);
      return false;
    }
  }
};
