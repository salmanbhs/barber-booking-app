import { ApiService } from './apiService';
import { ServiceStorage, ServicesData } from './serviceStorage';
import { Service } from '@/types';

export interface ServiceInitResult {
  success: boolean;
  source: 'api' | 'cache' | 'none';
  servicesData: ServicesData;
  message?: string;
}

export class ServiceInitService {
  private static isInitialized = false;
  private static isInitializing = false;
  private static initializationPromise: Promise<ServiceInitResult> | null = null;

  // Initialize services on app startup
  static async initializeServices(): Promise<ServiceInitResult> {
    // If already initializing, wait for that initialization to complete
    if (this.isInitializing && this.initializationPromise) {
      console.log('🔄 Service initialization already in progress, waiting...');
      return await this.initializationPromise;
    }

    // Return cached data if already initialized
    if (this.isInitialized) {
      const cachedServicesData = await ServiceStorage.getServicesData();
      console.log('✅ Services already initialized, returning cached data');
      return {
        success: true,
        source: 'cache',
        servicesData: cachedServicesData || { services: [], servicesByCategory: {}, categories: [], count: 0 }
      };
    }

    this.isInitializing = true;

    // Create the initialization promise
    this.initializationPromise = this.performInitialization();
    
    try {
      const result = await this.initializationPromise;
      this.isInitializing = false;
      this.initializationPromise = null;
      return result;
    } catch (error) {
      this.isInitializing = false;
      this.initializationPromise = null;
      throw error;
    }
  }

  // Separate method to perform the actual initialization
  private static async performInitialization(): Promise<ServiceInitResult> {
    try {
      console.log('🚀 Initializing services...');

      // Check if we have cached services and if they're still valid
      const isCacheExpired = await ServiceStorage.isCacheExpired();
      const cachedServicesData = await ServiceStorage.getServicesData();

      if (cachedServicesData && cachedServicesData.services.length > 0 && !isCacheExpired) {
        console.log('📱 Using valid cached services');
        this.isInitialized = true;
        return {
          success: true,
          source: 'cache',
          servicesData: cachedServicesData
        };
      }

      // Fetch fresh data from API
      console.log('🌐 Fetching fresh service data from API...');
      const apiResponse = await ApiService.getServices();

      if (apiResponse.success && apiResponse.data) {
        const servicesData: ServicesData = {
          services: apiResponse.data.services || [],
          servicesByCategory: apiResponse.data.servicesByCategory || {},
          categories: apiResponse.data.categories || [],
          count: apiResponse.data.count || 0
        };
        
        if (servicesData.services.length > 0) {
          // Save to local storage
          await ServiceStorage.saveServices(servicesData);
          console.log('💾 Fresh service data saved to local storage');
          
          this.isInitialized = true;
          
          return {
            success: true,
            source: 'api',
            servicesData,
            message: 'Services fetched and cached successfully'
          };
        } else {
          console.log('⚠️ API returned empty services array');
        }
      } else {
        console.log('❌ Failed to fetch services from API:', apiResponse.message);
      }

      // If API fails but we have cached data (even if expired), use it
      if (cachedServicesData && cachedServicesData.services.length > 0) {
        console.log('🔄 Using expired cached services as fallback');
        this.isInitialized = true;
        return {
          success: true,
          source: 'cache',
          servicesData: cachedServicesData,
          message: 'Using cached data (API unavailable)'
        };
      }

      // No data available
      console.log('❌ No service data available from API or cache');
      return {
        success: false,
        source: 'none',
        servicesData: { services: [], servicesByCategory: {}, categories: [], count: 0 },
        message: 'Failed to load service data'
      };

    } catch (error) {
      console.error('❌ Error during service initialization:', error);
      
      // Try to return cached data as fallback
      const cachedServicesData = await ServiceStorage.getServicesData();
      
      if (cachedServicesData && cachedServicesData.services.length > 0) {
        console.log('🔄 Using cached services due to initialization error');
        return {
          success: true,
          source: 'cache',
          servicesData: cachedServicesData,
          message: 'Using cached data due to error'
        };
      }

      return {
        success: false,
        source: 'none',
        servicesData: { services: [], servicesByCategory: {}, categories: [], count: 0 },
        message: error instanceof Error ? error.message : 'Initialization failed'
      };
    }
  }

  // Force refresh services from API
  static async refreshServices(): Promise<ServiceInitResult> {
    console.log('🔄 Force refreshing services...');
    this.isInitialized = false;
    this.isInitializing = false;
    this.initializationPromise = null;
    return this.initializeServices();
  }

  // Get services (with automatic initialization if needed)
  static async getServices(): Promise<Service[]> {
    if (!this.isInitialized) {
      const result = await this.initializeServices();
      return result.servicesData.services;
    }
    
    return await ServiceStorage.getServices();
  }

  // Get services data (with automatic initialization if needed)
  static async getServicesData(): Promise<ServicesData> {
    if (!this.isInitialized) {
      const result = await this.initializeServices();
      return result.servicesData;
    }
    
    const data = await ServiceStorage.getServicesData();
    return data || { services: [], servicesByCategory: {}, categories: [], count: 0 };
  }

  // Check initialization status
  static getInitializationStatus(): { isInitialized: boolean; isInitializing: boolean } {
    return {
      isInitialized: this.isInitialized,
      isInitializing: this.isInitializing
    };
  }

  // Reset initialization state (useful for testing or manual reset)
  static resetInitialization(): void {
    this.isInitialized = false;
    this.isInitializing = false;
    this.initializationPromise = null;
    console.log('🔄 Service initialization state reset');
  }
}
