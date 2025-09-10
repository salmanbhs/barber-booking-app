import { useEffect, useState } from 'react';
import { BarberInitService, BarberInitResult } from '@/utils/barberInitService';
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

  const initializeBarbers = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const result: BarberInitResult = await BarberInitService.initializeBarbers();
      
      setState({
        barbers: result.barbers,
        isLoading: false,
        error: result.success ? null : (result.message || 'Failed to load barbers'),
        source: result.source,
        lastUpdated: new Date()
      });

      if (result.success) {
        console.log(`✅ Barbers initialized from ${result.source}:`, result.barbers.length, 'barbers');
      } else {
        console.warn('⚠️ Barber initialization failed:', result.message);
        // Even if initialization "failed", we might have barbers from cache
        if (result.barbers.length > 0) {
          console.log('📱 Still have barbers from cache, treating as success');
          setState(prev => ({ ...prev, error: null }));
        }
      }
    } catch (error) {
      console.error('❌ Error in useBarberInit:', error);
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
      
      const result: BarberInitResult = await BarberInitService.refreshBarbers();
      
      setState({
        barbers: result.barbers,
        isLoading: false,
        error: result.success ? null : (result.message || 'Failed to refresh barbers'),
        source: result.source,
        lastUpdated: new Date()
      });
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
    initializeBarbers();
  }, []);

  return {
    ...state,
    refresh: refreshBarbers,
    retry: initializeBarbers
  };
}
