import { useEffect } from 'react';
import { BarberInitService } from '@/utils/barberInitService';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  useEffect(() => {
    // Call the original framework ready callback
    window.frameworkReady?.();
    
    // Initialize barbers when framework is ready and stable
    const initBarbers = async () => {
      try {
        console.log('🎯 Framework ready, initializing barbers...');
        const result = await BarberInitService.initializeBarbers();
        console.log('✅ Barber initialization completed:', {
          success: result.success,
          source: result.source,
          count: result.barbers.length,
          message: result.message
        });
      } catch (error) {
        console.error('❌ Failed to initialize barbers in framework ready:', error);
      }
    };

    // Use a longer delay to ensure the app is fully stable and all contexts are ready
    const timeoutId = setTimeout(initBarbers, 500);
    
    return () => clearTimeout(timeoutId);
  }, []);
}
