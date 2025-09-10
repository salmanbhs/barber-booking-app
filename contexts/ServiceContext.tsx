import React, { createContext, useContext, ReactNode } from 'react';
import { useServiceInit, UseServiceInitState } from '@/hooks/useServiceInit';
import { Service } from '@/types';
import { ServicesData } from '@/utils/serviceStorage';

interface ServiceContextType extends UseServiceInitState {
  refresh: () => Promise<void>;
  retry: () => Promise<void>;
  getServiceById: (id: string) => Service | undefined;
  getServicesByCategory: (category: string) => Service[];
  getCategories: () => string[];
}

const ServiceContext = createContext<ServiceContextType | null>(null);

interface ServiceProviderProps {
  children: ReactNode;
}

export function ServiceProvider({ children }: ServiceProviderProps) {
  const serviceInit = useServiceInit();
  
  const getServiceById = (id: string): Service | undefined => {
    return serviceInit.services.find(service => service.id === id);
  };

  const getServicesByCategory = (category: string): Service[] => {
    // First try to get from the organized servicesByCategory
    if (serviceInit.servicesData.servicesByCategory[category]) {
      return serviceInit.servicesData.servicesByCategory[category];
    }
    
    // Fallback: filter from all services
    return serviceInit.services.filter(service => service.category === category);
  };

  const getCategories = (): string[] => {
    return serviceInit.servicesData.categories || [];
  };

  const contextValue: ServiceContextType = {
    ...serviceInit,
    getServiceById,
    getServicesByCategory,
    getCategories
  };

  return (
    <ServiceContext.Provider value={contextValue}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useServices(): ServiceContextType {
  const context = useContext(ServiceContext);
  
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  
  return context;
}

// Export individual hooks for convenience
export function useServicesData(): Service[] {
  const { services } = useServices();
  return services;
}

export function useServiceById(id: string): Service | undefined {
  const { getServiceById } = useServices();
  return getServiceById(id);
}

export function useServicesByCategory(category: string): Service[] {
  const { getServicesByCategory } = useServices();
  return getServicesByCategory(category);
}

export function useServiceCategories(): string[] {
  const { getCategories } = useServices();
  return getCategories();
}

export function useServicesLoading(): boolean {
  const { isLoading } = useServices();
  return isLoading;
}

export function useServicesError(): string | null {
  const { error } = useServices();
  return error;
}
