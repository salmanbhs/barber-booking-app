import { useEffect, useState } from 'react';
import { ServiceInitService, ServiceInitResult } from '@/utils/serviceInitService';
import { Service } from '@/types';
import { ServicesData } from '@/utils/serviceStorage';

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

  const initializeServices = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const result: ServiceInitResult = await ServiceInitService.initializeServices();
      
      setState({
        services: result.servicesData.services,
        servicesData: result.servicesData,
        isLoading: false,
        error: result.success ? null : (result.message || 'Failed to load services'),
        source: result.source,
        lastUpdated: new Date()
      });

      if (result.success) {
        console.log(`✅ Services initialized from ${result.source}:`, result.servicesData.services.length, 'services');
      } else {
        console.warn('⚠️ Service initialization failed:', result.message);
        // Even if initialization "failed", we might have services from cache
        if (result.servicesData.services.length > 0) {
          console.log('📱 Still have services from cache, treating as success');
          setState(prev => ({ ...prev, error: null }));
        }
      }
    } catch (error) {
      console.error('❌ Error in useServiceInit:', error);
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
      
      const result: ServiceInitResult = await ServiceInitService.refreshServices();
      
      setState({
        services: result.servicesData.services,
        servicesData: result.servicesData,
        isLoading: false,
        error: result.success ? null : (result.message || 'Failed to refresh services'),
        source: result.source,
        lastUpdated: new Date()
      });
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
    initializeServices();
  }, []);

  return {
    ...state,
    refresh: refreshServices,
    retry: initializeServices
  };
}
