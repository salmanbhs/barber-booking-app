import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { BarberCard } from '@/components/BarberCard';
import { Colors, Theme } from '@/constants/Colors';
import { DataCache } from '@/utils/dataCache';
import { BookingStorage } from '@/utils/bookingStorage';
import { Barber } from '@/types';
import { useState, useEffect } from 'react';

export default function SelectBarberScreen() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBarbers();
  }, []);

  const loadBarbers = async () => {
    try {
      console.log('🔄 Loading barbers from DataCache...');
      setLoading(true);
      setError(null);
      
      const barbersData = await DataCache.getBarbers();
      console.log('📊 Barbers data received:', barbersData);
      console.log('📊 Barbers count:', barbersData.length);
      console.log('📊 First barber:', barbersData[0]);
      
      setBarbers(barbersData);
      console.log('✅ Loaded', barbersData.length, 'barbers from cache');
    } catch (error) {
      console.error('❌ Error loading barbers:', error);
      setError('Failed to load barbers');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBarber = async (barberId: string) => {
    // Find and save the selected barber
    const selectedBarber = barbers.find(barber => barber.id === barberId);
    if (selectedBarber) {
      await BookingStorage.saveBarber(selectedBarber);
    }
    
    router.push({
      pathname: '/booking/services',
      params: { barberId }
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading barbers...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadBarbers}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (barbers.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No barbers available</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={barbers}
        renderItem={({ item }) => (
          <BarberCard
            barber={item}
            onSelect={() => handleSelectBarber(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.gray800} />
        </TouchableOpacity>
        <Text style={styles.title}>Select Barber</Text>
        <View style={{ width: 40 }} />
      </View>

      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: Theme.colors.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Theme.colors.text,
  },
  list: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.gray600,
    fontFamily: 'Inter-Regular',
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Inter-Regular',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.gray600,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
});