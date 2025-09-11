import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, Clock } from 'lucide-react-native';
import { TimeSlotGrid } from '@/components/TimeSlotGrid';
import { generateTimeSlots, isDateAvailable, filterAvailableTimeSlots, OccupiedSlot } from '@/utils/timeUtils';
import { ApiService } from '@/utils/apiService';
import { useCompanyConfig } from '@/contexts';
import { Colors } from '@/constants/Colors';

export default function SelectTimeScreen() {
  const { barberId, services } = useLocalSearchParams();
  const { companyConfig } = useCompanyConfig();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [occupiedSlots, setOccupiedSlots] = useState<OccupiedSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0];
  }).filter(date => isDateAvailable(date, companyConfig));

  // Fetch occupied slots when date or barber changes
  useEffect(() => {
    if (barberId && selectedDate) {
      fetchOccupiedSlots();
    }
  }, [barberId, selectedDate]);

  const fetchOccupiedSlots = async () => {
    if (!barberId || !selectedDate) return;
    
    setIsLoadingSlots(true);
    try {
      const response = await ApiService.getBarberOccupiedSlots(barberId as string, selectedDate);
      if (response.success && response.data) {
        setOccupiedSlots(response.data.occupied_slots || []);
      } else {
        console.warn('Failed to fetch occupied slots:', response.message);
        setOccupiedSlots([]);
      }
    } catch (error) {
      console.error('Error fetching occupied slots:', error);
      setOccupiedSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Generate all possible time slots and filter out occupied ones
  const allTimeSlots = generateTimeSlots(selectedDate, companyConfig);
  const availableTimeSlots = filterAvailableTimeSlots(allTimeSlots, occupiedSlots);

  const handleContinue = () => {
    if (!selectedTime) return;
    
    router.push({
      pathname: '/booking/summary',
      params: { 
        barberId,
        services,
        date: selectedDate,
        time: selectedTime
      }
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateStr === today.toISOString().split('T')[0]) return 'Today';
    if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Select Time</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color="#1E293B" />
            <Text style={styles.sectionTitle}>Select Date</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
            {dates.map((date) => (
              <TouchableOpacity
                key={date}
                style={[
                  styles.dateCard,
                  selectedDate === date && styles.dateCardSelected
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[
                  styles.dateText,
                  selectedDate === date && styles.dateTextSelected
                ]}>
                  {formatDate(date)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color="#1E293B" />
            <Text style={styles.sectionTitle}>Available Times</Text>
            {isLoadingSlots && (
              <Text style={styles.loadingText}>Loading...</Text>
            )}
          </View>
          
          {availableTimeSlots.length > 0 ? (
            <TimeSlotGrid
              slots={availableTimeSlots}
              selectedSlot={selectedTime}
              onSelectSlot={setSelectedTime}
            />
          ) : (
            <View style={styles.noSlotsContainer}>
              <Text style={styles.noSlotsText}>
                {isLoadingSlots ? 'Loading available times...' : 'No available time slots for this date'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {selectedTime && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueText}>Continue to Summary</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  dateScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  dateCard: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateCardSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.warning,
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
  dateTextSelected: {
    color: 'white',
  },
  footer: {
    backgroundColor: 'white',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  continueButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
    marginLeft: 8,
  },
  noSlotsContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
  },
  noSlotsText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});