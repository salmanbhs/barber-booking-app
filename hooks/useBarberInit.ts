import { useEffect, useState } from 'react';
import { DataCache } from '@/utils/dataCache';
import { appInitManager } from '@/utils/appInitManager';
import { Barber } from '@/types';

export interface UseBarberInitState {
  barbers: Barber[];
  isLoading: boolean;
  error: string | null;
  source: 'api' | 'cache' | 'none' | null;
  lastUpdated: Date | null;
}

export function useBarberInit() {
  const [state, setState] = useState<UseBarberInitState>({
    barbers: [],
    isLoading: true,
    error: null,
    source: null,
    lastUpdated: null
  });

  const loadBarbersFromCache = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Wait for app initialization to complete
      await appInitManager.initialize();
      
      // Get barbers from cache (should be available after app init)
      const cachedBarbers = await DataCache.getCachedBarbers();
      
      if (cachedBarbers && cachedBarbers.length > 0) {
        setState({
          barbers: cachedBarbers,
          isLoading: false,
          error: null,
          source: 'cache',
          lastUpdated: new Date()
        });
        console.log(`✅ Barbers loaded from cache:`, cachedBarbers.length, 'barbers');
      } else {
        // No fallback API call - app init should have populated cache
        console.warn('⚠️ No cached barbers found after app initialization');
        setState({
          barbers: [],
          isLoading: false,
          error: 'No barbers data available',
          source: 'none',
          lastUpdated: null
        });
      }

    } catch (error) {
      console.error('❌ Error loading barbers:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  };

  const refreshBarbers = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const freshBarbers = await DataCache.fetchAndCacheBarbers();
      
      setState({
        barbers: freshBarbers,
        isLoading: false,
        error: null,
        source: 'api',
        lastUpdated: new Date()
      });
      console.log(`✅ Barbers refreshed from API:`, freshBarbers.length, 'barbers');
    } catch (error) {
      console.error('❌ Error refreshing barbers:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh barbers'
      }));
    }
  };

  useEffect(() => {
    loadBarbersFromCache();
  }, []);

  return {
    ...state,
    refresh: refreshBarbers,
    retry: loadBarbersFromCache
  };
}
