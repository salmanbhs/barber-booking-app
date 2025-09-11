import { useEffect } from 'react';
import { appInitManager } from '@/utils/appInitManager';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  useEffect(() => {
    // Call the original framework ready callback
    window.frameworkReady?.();
    
    // Initialize app data when framework is ready and stable
    const initializeAppData = async () => {
      try {
        console.log('🎯 Framework ready, initializing app...');
        await appInitManager.initialize();
      } catch (error) {
        console.error('❌ Failed to initialize app in framework ready:', error);
      }
    };

    // Use a longer delay to ensure the app is fully stable and all contexts are ready
    const timeoutId = setTimeout(initializeAppData, 500);
    
    return () => clearTimeout(timeoutId);
  }, []);
}
