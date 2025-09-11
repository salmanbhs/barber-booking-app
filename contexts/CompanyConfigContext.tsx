import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { CompanyConfig } from '@/types';
import { DataCache } from '@/utils/dataCache';
import { appInitManager } from '@/utils/appInitManager';

interface CompanyConfigContextType {
  companyConfig: CompanyConfig | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  retry: () => Promise<void>;
}

const CompanyConfigContext = createContext<CompanyConfigContextType | null>(null);

interface CompanyConfigProviderProps {
  children: ReactNode;
}

export function CompanyConfigProvider({ children }: CompanyConfigProviderProps) {
  const [companyConfig, setCompanyConfig] = useState<CompanyConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCompanyConfigFromCache = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Wait for app initialization to complete
      await appInitManager.initialize();
      
      // Get company config from cache (should be available after app init)
      const config = await DataCache.getCachedCompanyConfig();
      
      if (config) {
        setCompanyConfig(config);
        console.log('✅ Company config loaded from cache:', config.company_name);
      } else {
        // No fallback API call - app init should have populated cache
        console.warn('⚠️ No cached company config found after app initialization');
        setError('No company configuration available');
      }
    } catch (err) {
      console.error('Error loading company config:', err);
      setError(err instanceof Error ? err.message : 'Failed to load company configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const config = await DataCache.fetchAndCacheCompanyConfig();
      setCompanyConfig(config);
      console.log('✅ Company config refreshed:', config.company_name);
    } catch (err) {
      console.error('Error refreshing company config:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh company configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const retry = async () => {
    await loadCompanyConfigFromCache();
  };

  useEffect(() => {
    loadCompanyConfigFromCache();
  }, []);

  const contextValue: CompanyConfigContextType = {
    companyConfig,
    isLoading,
    error,
    refresh,
    retry
  };

  return (
    <CompanyConfigContext.Provider value={contextValue}>
      {children}
    </CompanyConfigContext.Provider>
  );
}

export function useCompanyConfig(): CompanyConfigContextType {
  const context = useContext(CompanyConfigContext);
  
  if (!context) {
    throw new Error('useCompanyConfig must be used within a CompanyConfigProvider');
  }
  
  return context;
}

// Export individual hooks for convenience
export function useCompanyConfigData(): CompanyConfig | null {
  const { companyConfig } = useCompanyConfig();
  return companyConfig;
}

export function useCompanyConfigLoading(): boolean {
  const { isLoading } = useCompanyConfig();
  return isLoading;
}

export function useCompanyConfigError(): string | null {
  const { error } = useCompanyConfig();
  return error;
}
