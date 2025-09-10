import { ApiService } from './apiService';
import { BarberStorage } from './barberStorage';
import { BarberInitService } from './barberInitService';

export class BarberDebugUtils {
  // Test API connection and barber fetching
  static async testBarberAPI(): Promise<void> {
    console.log('🧪 Testing Barber API...');
    
    try {
      const result = await ApiService.getBarbers();
      console.log('🌐 API Response:', {
        success: result.success,
        dataCount: Array.isArray(result.data) ? result.data.length : 'Not array',
        message: result.message,
        firstBarber: Array.isArray(result.data) && result.data.length > 0 ? result.data[0] : null
      });
    } catch (error) {
      console.error('❌ API Test Error:', error);
    }
  }

  // Test local storage functionality
  static async testBarberStorage(): Promise<void> {
    console.log('🧪 Testing Barber Storage...');
    
    try {
      const hasBarbers = await BarberStorage.hasBarbers();
      const cachedBarbers = await BarberStorage.getBarbers();
      const isCacheExpired = await BarberStorage.isCacheExpired();
      const cacheInfo = await BarberStorage.getCachedBarbers();
      
      console.log('📱 Storage Status:', {
        hasBarbers,
        cachedCount: cachedBarbers.length,
        isCacheExpired,
        cacheTimestamp: cacheInfo?.timestamp ? new Date(cacheInfo.timestamp).toISOString() : 'None',
        firstCachedBarber: cachedBarbers.length > 0 ? cachedBarbers[0] : null
      });
    } catch (error) {
      console.error('❌ Storage Test Error:', error);
    }
  }

  // Test full initialization process
  static async testBarberInitialization(): Promise<void> {
    console.log('🧪 Testing Barber Initialization...');
    
    try {
      const result = await BarberInitService.initializeBarbers();
      console.log('🚀 Initialization Result:', {
        success: result.success,
        source: result.source,
        barberCount: result.barbers.length,
        message: result.message,
        sampleBarber: result.barbers.length > 0 ? {
          id: result.barbers[0].id,
          name: result.barbers[0].name,
          rating: result.barbers[0].rating,
          specialties: result.barbers[0].specialties
        } : null
      });
    } catch (error) {
      console.error('❌ Initialization Test Error:', error);
    }
  }

  // Run all tests
  static async runAllTests(): Promise<void> {
    console.log('🧪 Running All Barber Tests...');
    console.log('=====================================');
    
    await this.testBarberAPI();
    console.log('-------------------------------------');
    
    await this.testBarberStorage();
    console.log('-------------------------------------');
    
    await this.testBarberInitialization();
    console.log('=====================================');
    console.log('✅ All tests completed!');
  }

  // Clear all barber data (useful for testing)
  static async clearAllBarberData(): Promise<void> {
    console.log('🗑️ Clearing all barber data...');
    
    try {
      await BarberStorage.clearBarbers();
      BarberInitService.resetInitialization();
      console.log('✅ All barber data cleared');
    } catch (error) {
      console.error('❌ Error clearing barber data:', error);
    }
  }

  // Reset and reinitialize barbers (useful for debugging)
  static async resetAndReinitialize(): Promise<void> {
    console.log('🔄 Resetting and reinitializing barbers...');
    
    try {
      // Clear everything
      await this.clearAllBarberData();
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Reinitialize
      const result = await BarberInitService.initializeBarbers();
      console.log('🚀 Reinitialization Result:', {
        success: result.success,
        source: result.source,
        barberCount: result.barbers.length,
        message: result.message
      });
    } catch (error) {
      console.error('❌ Error during reset and reinitialize:', error);
    }
  }

  // Log current API configuration
  static logApiConfig(): void {
    const config = ApiService.getApiConfig();
    console.log('⚙️ API Configuration:', {
      baseUrl: config.baseUrl,
      isLocal: config.isLocal,
      localUrl: config.localUrl,
      productionUrl: config.productionUrl
    });
  }
}

// Make it available globally for debugging
declare global {
  interface Window {
    BarberDebug?: typeof BarberDebugUtils;
  }
}

if (typeof window !== 'undefined') {
  window.BarberDebug = BarberDebugUtils;
}
