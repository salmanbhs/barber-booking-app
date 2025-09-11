import { useEffect, useState } from 'react';
import { DataCache } from '@/utils/dataCache';
import { appInitManager } from '@/utils/appInitManager';
import { Service } from '@/types';

export interface ServicesData {
  services: Service[];
  servicesByCategory: Record<string, Service[]>;
  categories: string[];
  count: number;
}

export interface UseServiceInitState {
  services: Service[];
  servicesData: ServicesData;
  isLoading: boolean;
  error: string | null;
  source: 'api' | 'cache' | 'none' | null;
  lastUpdated: Date | null;
}

export function useServiceInit() {
  const [state, setState] = useState<UseServiceInitState>({
    services: [],
    servicesData: { services: [], servicesByCategory: {}, categories: [], count: 0 },
    isLoading: true,
    error: null,
    source: null,
    lastUpdated: null
  });

  const loadServicesFromCache = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Wait for app initialization to complete
      await appInitManager.initialize();
      
      // Get services from cache (should be available after app init)
      const cachedData = await DataCache.getCachedServices();
      
      if (cachedData && cachedData.services.length > 0) {
        setState({
          services: cachedData.services,
          servicesData: {
            services: cachedData.services,
            servicesByCategory: cachedData.servicesByCategory,
            categories: cachedData.categories,
            count: cachedData.services.length
          },
          isLoading: false,
          error: null,
          source: 'cache',
          lastUpdated: new Date()
        });
        console.log(`✅ Services loaded from cache:`, cachedData.services.length, 'services');
      } else {
        // No fallback API call - app init should have populated cache
        console.warn('⚠️ No cached services found after app initialization');
        setState({
          services: [],
          servicesData: {
            services: [],
            servicesByCategory: {},
            categories: [],
            count: 0
          },
          isLoading: false,
          error: 'No services data available',
          source: 'none',
          lastUpdated: null
        });
      }

    } catch (error) {
      console.error('❌ Error loading services:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  };

  const refreshServices = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const freshServices = await DataCache.fetchAndCacheServices();
      const servicesData = {
        ...freshServices,
        count: freshServices.services.length
      };
      
      setState({
        services: freshServices.services,
        servicesData,
        isLoading: false,
        error: null,
        source: 'api',
        lastUpdated: new Date()
      });
      console.log(`✅ Services refreshed from API:`, freshServices.services.length, 'services');
    } catch (error) {
      console.error('❌ Error refreshing services:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh services'
      }));
    }
  };

  useEffect(() => {
    loadServicesFromCache();
  }, []);

  return {
    ...state,
    refresh: refreshServices,
    retry: loadServicesFromCache
  };
}
