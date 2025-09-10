import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useBarbers } from '@/contexts/BarberContext';
import { BarberStorage } from '@/utils/barberStorage';
import { BarberInitService } from '@/utils/barberInitService';
import { Colors } from '@/constants/Colors';

export function BarberDebugInfo() {
  const { barbers, isLoading, error, source, lastUpdated, refresh } = useBarbers();
  const [storageInfo, setStorageInfo] = React.useState<any>(null);
  const [initStatus, setInitStatus] = React.useState<any>(null);

  React.useEffect(() => {
    loadDebugInfo();
  }, []);

  const loadDebugInfo = async () => {
    try {
      const hasBarbers = await BarberStorage.hasBarbers();
      const cachedBarbers = await BarberStorage.getBarbers();
      const isCacheExpired = await BarberStorage.isCacheExpired();
      const cacheInfo = await BarberStorage.getCachedBarbers();
      const initializationStatus = BarberInitService.getInitializationStatus();

      setStorageInfo({
        hasBarbers,
        cachedCount: cachedBarbers.length,
        isCacheExpired,
        cacheTimestamp: cacheInfo?.timestamp ? new Date(cacheInfo.timestamp).toISOString() : 'None',
        firstBarber: cachedBarbers.length > 0 ? cachedBarbers[0] : null
      });

      setInitStatus(initializationStatus);
    } catch (error) {
      console.error('Debug info error:', error);
    }
  };

  const handleRefresh = async () => {
    await refresh();
    await loadDebugInfo();
  };

  const handleClearCache = async () => {
    try {
      await BarberStorage.clearBarbers();
      BarberInitService.resetInitialization();
      await loadDebugInfo();
    } catch (error) {
      console.error('Clear cache error:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Barber Debug Info</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Context State</Text>
        <Text style={styles.debugText}>Barbers Count: {barbers.length}</Text>
        <Text style={styles.debugText}>Loading: {isLoading ? 'Yes' : 'No'}</Text>
        <Text style={styles.debugText}>Error: {error || 'None'}</Text>
        <Text style={styles.debugText}>Source: {source || 'None'}</Text>
        <Text style={styles.debugText}>Last Updated: {lastUpdated?.toISOString() || 'Never'}</Text>
        
        {barbers.length > 0 && (
          <View style={styles.barberPreview}>
            <Text style={styles.debugText}>First Barber:</Text>
            <Text style={styles.debugText}>  ID: {barbers[0].id}</Text>
            <Text style={styles.debugText}>  Name: {barbers[0].name}</Text>
            <Text style={styles.debugText}>  Rating: {barbers[0].rating}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Storage State</Text>
        {storageInfo ? (
          <>
            <Text style={styles.debugText}>Has Barbers: {storageInfo.hasBarbers ? 'Yes' : 'No'}</Text>
            <Text style={styles.debugText}>Cached Count: {storageInfo.cachedCount}</Text>
            <Text style={styles.debugText}>Cache Expired: {storageInfo.isCacheExpired ? 'Yes' : 'No'}</Text>
            <Text style={styles.debugText}>Cache Timestamp: {storageInfo.cacheTimestamp}</Text>
            
            {storageInfo.firstBarber && (
              <View style={styles.barberPreview}>
                <Text style={styles.debugText}>First Cached Barber:</Text>
                <Text style={styles.debugText}>  ID: {storageInfo.firstBarber.id}</Text>
                <Text style={styles.debugText}>  Name: {storageInfo.firstBarber.name}</Text>
                <Text style={styles.debugText}>  Rating: {storageInfo.firstBarber.rating}</Text>
              </View>
            )}
          </>
        ) : (
          <Text style={styles.debugText}>Loading storage info...</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Initialization State</Text>
        {initStatus ? (
          <>
            <Text style={styles.debugText}>Is Initialized: {initStatus.isInitialized ? 'Yes' : 'No'}</Text>
            <Text style={styles.debugText}>Is Initializing: {initStatus.isInitializing ? 'Yes' : 'No'}</Text>
          </>
        ) : (
          <Text style={styles.debugText}>Loading init status...</Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={handleRefresh}>
          <Text style={styles.buttonText}>Refresh Context</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={loadDebugInfo}>
          <Text style={styles.buttonText}>Reload Debug Info</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleClearCache}>
          <Text style={styles.buttonText}>Clear Cache</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: Colors.primary,
  },
  debugText: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  barberPreview: {
    marginTop: 8,
    paddingLeft: 8,
  },
  actions: {
    gap: 12,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: Colors.error,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
