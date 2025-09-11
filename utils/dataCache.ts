import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from './apiService';
import { Barber, Service, CompanyConfig } from '@/types';

const CACHE_KEYS = {
  COMPANY_CONFIG: 'CACHED_COMPANY_CONFIG',
  BARBERS: 'CACHED_BARBERS',
  SERVICES: 'CACHED_SERVICES',
  LAST_FETCH_COMPANY: 'LAST_FETCH_COMPANY',
  LAST_FETCH_BARBERS: 'LAST_FETCH_BARBERS',
  LAST_FETCH_SERVICES: 'LAST_FETCH_SERVICES',
};

// Cache data for 1 hour (3600 seconds)
const CACHE_DURATION = 3600 * 1000;

export interface CachedCompanyData {
  config: CompanyConfig;
  timestamp: number;
}

export interface CachedBarbersData {
  barbers: Barber[];
  timestamp: number;
}

export interface CachedServicesData {
  services: Service[];
  servicesByCategory: Record<string, Service[]>;
  categories: string[];
  timestamp: number;
}

export const DataCache = {
  // Check if cache is still valid
  isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < CACHE_DURATION;
  },

  // Save company config to cache
  async cacheCompanyConfig(config: CompanyConfig): Promise<void> {
    try {
      const cacheData: CachedCompanyData = {
        config: config,
        timestamp: Date.now()
      };
      
      await AsyncStorage.setItem(CACHE_KEYS.COMPANY_CONFIG, JSON.stringify(cacheData));
      await AsyncStorage.setItem(CACHE_KEYS.LAST_FETCH_COMPANY, Date.now().toString());
      
      console.log('✅ Company config cached:', config.company_name);
    } catch (error) {
      console.error('Error caching company config:', error);
    }
  },

  // Save barbers to cache
  async cacheBarbers(barbersArray: Barber[]): Promise<void> {
    try {
      const cacheData: CachedBarbersData = {
        barbers: barbersArray,
        timestamp: Date.now()
      };
      
      await AsyncStorage.setItem(CACHE_KEYS.BARBERS, JSON.stringify(cacheData));
      await AsyncStorage.setItem(CACHE_KEYS.LAST_FETCH_BARBERS, Date.now().toString());
      
      console.log('✅ Barbers cached:', barbersArray.length, 'barbers');
    } catch (error) {
      console.error('Error caching barbers:', error);
    }
  },

  // Save services to cache
  async cacheServices(servicesData: { 
    services: Service[]; 
    servicesByCategory: Record<string, Service[]>; 
    categories: string[] 
  }): Promise<void> {
    try {
      const cacheData: CachedServicesData = {
        services: servicesData.services,
        servicesByCategory: servicesData.servicesByCategory,
        categories: servicesData.categories,
        timestamp: Date.now()
      };
      
      await AsyncStorage.setItem(CACHE_KEYS.SERVICES, JSON.stringify(cacheData));
      await AsyncStorage.setItem(CACHE_KEYS.LAST_FETCH_SERVICES, Date.now().toString());
      
      console.log('✅ Services cached:', servicesData.services.length, 'services');
    } catch (error) {
      console.error('Error caching services:', error);
    }
  },

  // Get cached company config
  async getCachedCompanyConfig(): Promise<CompanyConfig | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.COMPANY_CONFIG);
      if (cached) {
        const data: CachedCompanyData = JSON.parse(cached);
        
        if (this.isCacheValid(data.timestamp)) {
          console.log('📋 Using cached company config:', data.config.company_name);
          return data.config;
        } else {
          console.log('⚠️ Company config cache expired, will fetch fresh data');
        }
      }
    } catch (error) {
      console.error('Error reading cached company config:', error);
    }
    
    return null;
  },

  // Get cached barbers
  async getCachedBarbers(): Promise<Barber[] | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.BARBERS);
      if (cached) {
        const data: CachedBarbersData = JSON.parse(cached);
        
        if (this.isCacheValid(data.timestamp)) {
          console.log('📋 Using cached barbers:', data.barbers.length, 'barbers');
          return data.barbers;
        } else {
          console.log('⚠️ Barbers cache expired, will fetch fresh data');
        }
      }
    } catch (error) {
      console.error('Error reading cached barbers:', error);
    }
    
    return null;
  },

  // Get cached services
  async getCachedServices(): Promise<{
    services: Service[];
    servicesByCategory: Record<string, Service[]>;
    categories: string[];
  } | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.SERVICES);
      if (cached) {
        const data: CachedServicesData = JSON.parse(cached);
        
        if (this.isCacheValid(data.timestamp)) {
          console.log('📋 Using cached services:', data.services.length, 'services');
          return {
            services: data.services,
            servicesByCategory: data.servicesByCategory,
            categories: data.categories
          };
        } else {
          console.log('⚠️ Services cache expired, will fetch fresh data');
        }
      }
    } catch (error) {
      console.error('Error reading cached services:', error);
    }
    
    return null;
  },

  // Fetch and cache company config
  async fetchAndCacheCompanyConfig(): Promise<CompanyConfig> {
    try {
      console.log('🔄 Fetching company config from API...');
      const response = await ApiService.getCompanyConfig();
      
      if (response.success && response.data) {
        console.log('✅ Fetched company config from API:', response.data.company_name);
        await this.cacheCompanyConfig(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch company config');
      }
    } catch (error) {
      console.error('Error fetching company config:', error);
      throw error;
    }
  },

  // Fetch and cache barbers
  async fetchAndCacheBarbers(): Promise<Barber[]> {
    try {
      console.log('🔄 Fetching barbers from API...');
      const response = await ApiService.getBarbers();
      
      if (response.success && response.data) {
        const barbersData = response.data; // ApiService already transforms and returns barbers array
        console.log('✅ Fetched', barbersData.length, 'barbers from API');
        await this.cacheBarbers(barbersData);
        return barbersData;
      } else {
        throw new Error(response.message || 'Failed to fetch barbers');
      }
    } catch (error) {
      console.error('Error fetching barbers:', error);
      throw error;
    }
  },

  // Fetch and cache services
  async fetchAndCacheServices(): Promise<{
    services: Service[];
    servicesByCategory: Record<string, Service[]>;
    categories: string[];
  }> {
    try {
      console.log('🔄 Fetching services from API...');
      const response = await ApiService.getServices();
      
      if (response.success && response.data) {
        const servicesData = response.data; // ApiService already transforms and returns the services object
        console.log('✅ Fetched', servicesData.services?.length || 0, 'services from API');
        await this.cacheServices(servicesData);
        return servicesData;
      } else {
        throw new Error(response.message || 'Failed to fetch services');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

  // Get company config (cached first, then API if needed)
  async getCompanyConfig(): Promise<CompanyConfig | null> {
    try {
      // Try cache first
      const cached = await this.getCachedCompanyConfig();
      if (cached) {
        return cached;
      }
      
      // Fetch from API if cache miss/expired
      return await this.fetchAndCacheCompanyConfig();
    } catch (error) {
      console.error('Error getting company config:', error);
      return null;
    }
  },

  // Get barbers (cached first, then API if needed)
  async getBarbers(): Promise<Barber[]> {
    // Try cache first
    const cached = await this.getCachedBarbers();
    if (cached) {
      return cached;
    }
    
    // Fetch from API if cache miss/expired
    return this.fetchAndCacheBarbers();
  },

  // Get services (cached first, then API if needed)
  async getServices(): Promise<{
    services: Service[];
    servicesByCategory: Record<string, Service[]>;
    categories: string[];
  }> {
    // Try cache first
    const cached = await this.getCachedServices();
    if (cached) {
      return cached;
    }
    
    // Fetch from API if cache miss/expired
    return this.fetchAndCacheServices();
  },

  // Pre-load all data (for app initialization)
  async preloadData(): Promise<void> {
    console.log('🚀 Starting data preload...');
    
    try {
      // Always fetch fresh data from API during app init (not from cache)
      const promises = [
        this.fetchAndCacheCompanyConfig(),
        this.fetchAndCacheBarbers(),
        this.fetchAndCacheServices()
      ];
      
      await Promise.all(promises);
      console.log('✅ Data preload completed successfully');
    } catch (error) {
      console.error('❌ Data preload failed:', error);
      // Don't throw error - app should still work without preloaded data
    }
  },

  // Force refresh all data
  async refreshAllData(): Promise<void> {
    console.log('🔄 Force refreshing all data...');
    
    try {
      const promises = [
        this.fetchAndCacheCompanyConfig(),
        this.fetchAndCacheBarbers(),
        this.fetchAndCacheServices()
      ];
      
      await Promise.all(promises);
      console.log('✅ Data refresh completed successfully');
    } catch (error) {
      console.error('❌ Data refresh failed:', error);
      throw error;
    }
  },

  // Clear all cached data
  async clearCache(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(CACHE_KEYS.COMPANY_CONFIG),
        AsyncStorage.removeItem(CACHE_KEYS.BARBERS),
        AsyncStorage.removeItem(CACHE_KEYS.SERVICES),
        AsyncStorage.removeItem(CACHE_KEYS.LAST_FETCH_COMPANY),
        AsyncStorage.removeItem(CACHE_KEYS.LAST_FETCH_BARBERS),
        AsyncStorage.removeItem(CACHE_KEYS.LAST_FETCH_SERVICES)
      ]);
      
      console.log('🗑️ Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
};
