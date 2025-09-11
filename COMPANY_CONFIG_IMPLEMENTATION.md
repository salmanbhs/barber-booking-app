# Company Config & Data Caching Implementation

This implementation provides automatic data loading and caching for essential app data including company configuration, barbers, and services. The data is fetched once when the app initializes and cached locally for improved performance.

## ✅ What's Implemented

### 1. Company Configuration API Integration
- **Endpoint**: `GET /api/company/config`
- **Response Structure**: Full company config including working hours, colors, booking settings, etc.
- **Caching**: 1-hour cache with automatic refresh when expired

### 2. Enhanced Data Cache System
- **File**: `utils/dataCache.ts`
- **Features**:
  - Unified caching for company config, barbers, and services
  - 1-hour cache expiration
  - Automatic fallback to cached data if API fails
  - Parallel data loading for better performance

### 3. Company Config Context
- **File**: `contexts/CompanyConfigContext.tsx`
- **Provides**: Company config data, loading states, error handling, and refresh functions
- **Usage**: `useCompanyConfig()` hook for accessing data

### 4. Updated Type Definitions
- **File**: `types/index.ts`
- **Added**: Complete `CompanyConfig` interface matching API response

### 5. Automatic App Initialization
- **File**: `hooks/useFrameworkReady.ts`
- **Feature**: Preloads all app data when the framework is ready
- **Timing**: 500ms delay to ensure app stability

## 🚀 How to Use

### 1. Access Company Config Data
```typescript
import { useCompanyConfig } from '@/contexts/CompanyConfigContext';

function MyComponent() {
  const { companyConfig, isLoading, error, refresh } = useCompanyConfig();
  
  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error}</Text>;
  
  return (
    <View>
      <Text>{companyConfig?.company_name}</Text>
      <Text>{companyConfig?.company_phone}</Text>
      <Text>Currency: {companyConfig?.currency}</Text>
    </View>
  );
}
```

### 2. Access Individual Data Types
```typescript
// Company config only
import { useCompanyConfigData } from '@/contexts/CompanyConfigContext';
const companyConfig = useCompanyConfigData();

// Barbers data (existing)
import { useBarbersData } from '@/contexts/BarberContext';
const barbers = useBarbersData();

// Services data (existing)
import { useServices } from '@/contexts/ServiceContext';
const { services, servicesData } = useServices();
```

### 3. Manual Data Management
```typescript
import { DataCache } from '@/utils/dataCache';

// Force refresh all data
await DataCache.refreshAllData();

// Clear all cache
await DataCache.clearCache();

// Get specific data
const companyConfig = await DataCache.getCompanyConfig();
const barbers = await DataCache.getBarbers();
const services = await DataCache.getServices();
```

## 📱 Data Loading Flow

1. **App Start**: Framework ready hook triggers data preloading
2. **Cache Check**: Check if cached data exists and is valid (< 1 hour old)
3. **Cache Hit**: Use cached data immediately for instant app loading
4. **Cache Miss/Expired**: Fetch fresh data from API and update cache
5. **Error Handling**: Fallback to cached data if API fails
6. **Context Updates**: All components using the data are automatically updated

## 🎯 Key Benefits

- **Fast App Startup**: Cached data loads instantly
- **Offline Support**: App works with cached data when offline
- **Automatic Updates**: Data refreshes automatically after 1 hour
- **Error Resilience**: Fallback to cache if API is unavailable
- **Parallel Loading**: All data types load simultaneously for better performance

## 🔧 Configuration

### Cache Duration
Default is 1 hour. To change:
```typescript
// In utils/dataCache.ts
const CACHE_DURATION = 3600 * 1000; // Change this value
```

### Preload Timing
Default delay is 500ms. To change:
```typescript
// In hooks/useFrameworkReady.ts
const timeoutId = setTimeout(initializeAppData, 500); // Change delay
```

## 🧪 Testing & Debug

### Profile Screen Debug Section
The profile screen now includes a debug section showing:
- Cache status (number of cached items)
- Last update timestamp
- Data source (cache vs API)
- Manual refresh and clear cache buttons

### Console Logging
All data operations are logged with emojis for easy debugging:
- 🚀 Initialization
- ✅ Success operations
- ⚠️ Warnings
- ❌ Errors
- 📋 Cache hits
- 🔄 Refreshing/Loading

## 📋 Example Component

See `components/CompanyInfoCard.tsx` for a complete example of how to use the company config data in a UI component. This component is demonstrated on the main dashboard screen.

## 🔄 Migration Notes

The existing barber and service initialization systems have been updated to use the new unified DataCache system while maintaining the same API for existing components. No changes are required for existing code using the context hooks.
