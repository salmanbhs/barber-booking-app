import { DataCache } from './dataCache';
import { AuthStorage } from './authStorage';

export class AppInitializer {
  private static isInitialized = false;
  private static isInitializing = false;

  // Initialize the app
  static async initialize(): Promise<void> {
    if (this.isInitialized || this.isInitializing) {
      return;
    }

    this.isInitializing = true;
    console.log('🚀 Initializing app...');

    try {
      // Initialize in parallel
      await Promise.all([
        this.initializeAuth(),
        this.preloadData()
      ]);

      this.isInitialized = true;
      console.log('✅ App initialization completed');
    } catch (error) {
      console.error('❌ App initialization failed:', error);
    } finally {
      this.isInitializing = false;
    }
  }

  // Check authentication status and preload user data if authenticated
  private static async initializeAuth(): Promise<void> {
    try {
      console.log('🔐 Checking authentication status...');
      
      const authData = await AuthStorage.getAuthData();
      const isExpired = await AuthStorage.isTokenExpired();
      
      if (authData?.isAuthenticated && !isExpired) {
        console.log('✅ User is authenticated');
        
        // Preload user-specific data (bookings) if authenticated
        try {
          await DataCache.preloadUserData();
        } catch (error) {
          console.warn('⚠️ Failed to preload user data:', error);
          // Don't throw - app should still work
        }
      } else {
        console.log('ℹ️ User not authenticated or token expired');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  }

  // Preload barbers and services data
  private static async preloadData(): Promise<void> {
    try {
      console.log('📊 Preloading app data...');
      await DataCache.preloadData();
    } catch (error) {
      console.error('Error preloading data:', error);
      // Don't throw - app should work without preloaded data
    }
  }

  // Force refresh app data
  static async refreshData(): Promise<void> {
    try {
      console.log('🔄 Refreshing app data...');
      await DataCache.refreshAllData();
    } catch (error) {
      console.error('Error refreshing app data:', error);
      throw error;
    }
  }

  // Get initialization status
  static getStatus(): { initialized: boolean; initializing: boolean } {
    return {
      initialized: this.isInitialized,
      initializing: this.isInitializing
    };
  }

  // Reset initialization state (useful for testing)
  static reset(): void {
    this.isInitialized = false;
    this.isInitializing = false;
  }
}
