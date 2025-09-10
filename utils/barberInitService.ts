import { ApiService } from './apiService';
import { BarberStorage } from './barberStorage';
import { Barber } from '@/types';

export interface BarberInitResult {
  success: boolean;
  source: 'api' | 'cache' | 'none';
  barbers: Barber[];
  message?: string;
}

export class BarberInitService {
  private static isInitialized = false;
  private static isInitializing = false;
  private static initializationPromise: Promise<BarberInitResult> | null = null;

  // Initialize barbers on app startup
  static async initializeBarbers(): Promise<BarberInitResult> {
    // If already initializing, wait for that initialization to complete
    if (this.isInitializing && this.initializationPromise) {
      console.log('🔄 Barber initialization already in progress, waiting...');
      return await this.initializationPromise;
    }

    // Return cached data if already initialized
    if (this.isInitialized) {
      const cachedBarbers = await BarberStorage.getBarbers();
      console.log('✅ Barbers already initialized, returning cached data');
      return {
        success: true,
        source: 'cache',
        barbers: cachedBarbers
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
  private static async performInitialization(): Promise<BarberInitResult> {
    try {
      console.log('🚀 Initializing barbers...');

      // Check if we have cached barbers and if they're still valid
      const isCacheExpired = await BarberStorage.isCacheExpired();
      const cachedBarbers = await BarberStorage.getBarbers();

      if (cachedBarbers.length > 0 && !isCacheExpired) {
        console.log('📱 Using valid cached barbers');
        this.isInitialized = true;
        return {
          success: true,
          source: 'cache',
          barbers: cachedBarbers
        };
      }

      // Fetch fresh data from API
      console.log('🌐 Fetching fresh barber data from API...');
      const apiResponse = await ApiService.getBarbers();

      if (apiResponse.success && apiResponse.data) {
        const barbers = Array.isArray(apiResponse.data) ? apiResponse.data : [];
        
        if (barbers.length > 0) {
          // Save to local storage
          await BarberStorage.saveBarbers(barbers);
          console.log('💾 Fresh barber data saved to local storage');
          
          this.isInitialized = true;
          
          return {
            success: true,
            source: 'api',
            barbers,
            message: 'Barbers fetched and cached successfully'
          };
        } else {
          console.log('⚠️ API returned empty barbers array');
        }
      } else {
        console.log('❌ Failed to fetch barbers from API:', apiResponse.message);
      }

      // If API fails but we have cached data (even if expired), use it
      if (cachedBarbers.length > 0) {
        console.log('🔄 Using expired cached barbers as fallback');
        this.isInitialized = true;
        return {
          success: true,
          source: 'cache',
          barbers: cachedBarbers,
          message: 'Using cached data (API unavailable)'
        };
      }

      // No data available
      console.log('❌ No barber data available from API or cache');
      return {
        success: false,
        source: 'none',
        barbers: [],
        message: 'Failed to load barber data'
      };

    } catch (error) {
      console.error('❌ Error during barber initialization:', error);
      
      // Try to return cached data as fallback
      const cachedBarbers = await BarberStorage.getBarbers();
      
      if (cachedBarbers.length > 0) {
        console.log('🔄 Using cached barbers due to initialization error');
        return {
          success: true,
          source: 'cache',
          barbers: cachedBarbers,
          message: 'Using cached data due to error'
        };
      }

      return {
        success: false,
        source: 'none',
        barbers: [],
        message: error instanceof Error ? error.message : 'Initialization failed'
      };
    }
  }

  // Force refresh barbers from API
  static async refreshBarbers(): Promise<BarberInitResult> {
    console.log('🔄 Force refreshing barbers...');
    this.isInitialized = false;
    this.isInitializing = false;
    this.initializationPromise = null;
    return this.initializeBarbers();
  }

  // Get barbers (with automatic initialization if needed)
  static async getBarbers(): Promise<Barber[]> {
    if (!this.isInitialized) {
      const result = await this.initializeBarbers();
      return result.barbers;
    }
    
    return await BarberStorage.getBarbers();
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
    console.log('🔄 Barber initialization state reset');
  }
}
