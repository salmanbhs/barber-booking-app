import { useEffect } from 'react';
import { BarberInitService } from '@/utils/barberInitService';
import { ServiceInitService } from '@/utils/serviceInitService';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  useEffect(() => {
    // Call the original framework ready callback
    window.frameworkReady?.();
    
    // Initialize barbers and services when framework is ready and stable
    const initializeAppData = async () => {
      try {
        console.log('🎯 Framework ready, initializing app data...');
        
        // Initialize barbers and services in parallel
        const [barberResult, serviceResult] = await Promise.all([
          BarberInitService.initializeBarbers(),
          ServiceInitService.initializeServices()
        ]);
        
        console.log('✅ Barber initialization completed:', {
          success: barberResult.success,
          source: barberResult.source,
          count: barberResult.barbers.length,
          message: barberResult.message
        });

        console.log('✅ Service initialization completed:', {
          success: serviceResult.success,
          source: serviceResult.source,
          count: serviceResult.servicesData.services.length,
          categories: serviceResult.servicesData.categories.length,
          message: serviceResult.message
        });
      } catch (error) {
        console.error('❌ Failed to initialize app data in framework ready:', error);
      }
    };

    // Use a longer delay to ensure the app is fully stable and all contexts are ready
    const timeoutId = setTimeout(initializeAppData, 500);
    
    return () => clearTimeout(timeoutId);
  }, []);
}
