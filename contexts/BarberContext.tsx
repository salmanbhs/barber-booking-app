import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useBarberInit, UseBarberInitState } from '@/hooks/useBarberInit';
import { Barber } from '@/types';

interface BarberContextType extends UseBarberInitState {
  refresh: () => Promise<void>;
  retry: () => Promise<void>;
  getBarberById: (id: string) => Barber | undefined;
}

const BarberContext = createContext<BarberContextType | null>(null);

interface BarberProviderProps {
  children: ReactNode;
}

export function BarberProvider({ children }: BarberProviderProps) {
  const barberInit = useBarberInit();
  
  const getBarberById = (id: string): Barber | undefined => {
    return barberInit.barbers.find(barber => barber.id === id);
  };

  // Debug logging
  useEffect(() => {
    console.log('🎯 BarberProvider state changed:', {
      barbersCount: barberInit.barbers.length,
      isLoading: barberInit.isLoading,
      error: barberInit.error,
      source: barberInit.source
    });
  }, [barberInit.barbers.length, barberInit.isLoading, barberInit.error, barberInit.source]);

  const contextValue: BarberContextType = {
    ...barberInit,
    getBarberById
  };

  return (
    <BarberContext.Provider value={contextValue}>
      {children}
    </BarberContext.Provider>
  );
}

export function useBarbers(): BarberContextType {
  const context = useContext(BarberContext);
  
  if (!context) {
    throw new Error('useBarbers must be used within a BarberProvider');
  }
  
  return context;
}

// Export individual hooks for convenience
export function useBarbersData(): Barber[] {
  const { barbers } = useBarbers();
  return barbers;
}

export function useBarberById(id: string): Barber | undefined {
  const { getBarberById } = useBarbers();
  return getBarberById(id);
}

export function useBarbersLoading(): boolean {
  const { isLoading } = useBarbers();
  return isLoading;
}

export function useBarbersError(): string | null {
  const { error } = useBarbers();
  return error;
}
