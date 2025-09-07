import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { ServiceCard } from '@/components/ServiceCard';
import { DataCache } from '@/utils/dataCache';
import { BookingStorage } from '@/utils/bookingStorage';
import { Service } from '@/types';
import { Colors } from '@/constants/Colors';

export default function ServicesScreen() {
  const { barberId } = useLocalSearchParams();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('🔍 Services Screen State:', { 
    isLoading, 
    error, 
    servicesCount: services.length, 
    barberId 
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      console.log('🔄 Loading services...');
      setIsLoading(true);
      setError(null);
      
      const servicesData = await DataCache.getServices();
      console.log('📋 Services from cache:', servicesData);
      
      if (servicesData && servicesData.services && Array.isArray(servicesData.services)) {
        console.log('✅ Services loaded:', servicesData.services.length, 'services');
        setServices(servicesData.services);
      } else {
        console.error('❌ No services found in cache');
        setError('No services available');
      }
    } catch (error) {
      console.error('💥 Error loading services:', error);
      setError('Unable to load services. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleContinue = async () => {
    if (selectedServices.length === 0) return;
    
    // Get the selected service objects and save them
    const selectedServiceObjects = services.filter(service => 
      selectedServices.includes(service.id)
    );
    
    await BookingStorage.saveServices(selectedServiceObjects);
    
    router.push({
      pathname: '/booking/select-time',
      params: { 
        barberId,
        services: selectedServices.join(',')
      }
    });
  };

  const totalDuration = services && services.length > 0 
    ? services
        .filter(service => selectedServices.includes(service.id))
        .reduce((total, service) => total + service.duration_minutes, 0)
    : 0;

  const totalPrice = services && services.length > 0
    ? services
        .filter(service => selectedServices.includes(service.id))
        .reduce((total, service) => total + service.price, 0)
    : 0;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.title}>Select Services</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading services...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.title}>Select Services</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadServices}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!isLoading && services.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.title}>Select Services</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>No services available</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadServices}>
            <Text style={styles.retryText}>Reload</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Select Services</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={services || []}
        renderItem={({ item }) => (
          <ServiceCard
            service={item}
            isSelected={selectedServices.includes(item.id)}
            onToggle={() => handleToggleService(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />

      {selectedServices.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} • {totalDuration} min
            </Text>
            <Text style={styles.totalPrice}>${totalPrice}</Text>
          </View>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueText}>Continue</Text>
            <ArrowRight size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: 'white',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
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
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  list: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 120,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  totalPrice: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  continueText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});
