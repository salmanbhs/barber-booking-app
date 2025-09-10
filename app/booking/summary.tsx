import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, Clock, User, Scissors, CreditCard } from 'lucide-react-native';
import { useBarberById } from '@/contexts/BarberContext';
import { mockServices } from '@/data/mockData';
import { Colors } from '@/constants/Colors';

export default function SummaryScreen() {
  const { barberId, services, date, time } = useLocalSearchParams();
  const serviceIds = (services as string).split(',');
  
  const barber = useBarberById(barberId as string);
  const selectedServices = mockServices.filter(s => serviceIds.includes(s.id));
  
  const totalDuration = selectedServices.reduce((total, service) => total + service.duration, 0);
  const totalPrice = selectedServices.reduce((total, service) => total + service.price, 0);

  const handleConfirmBooking = () => {
    router.push('/booking/confirmation');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Booking Summary</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <View style={styles.itemIcon}>
              <User size={20} color={Colors.primary} />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemLabel}>Barber</Text>
              <Text style={styles.itemValue}>{barber?.name}</Text>
            </View>
          </View>

          <View style={styles.summaryItem}>
            <View style={styles.itemIcon}>
              <Scissors size={20} color={Colors.warning} />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemLabel}>Services</Text>
              {selectedServices.map(service => (
                <Text key={service.id} style={styles.itemValue}>
                  {service.name} - ${service.price}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.summaryItem}>
            <View style={styles.itemIcon}>
              <Calendar size={20} color={Colors.primary} />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemLabel}>Date</Text>
              <Text style={styles.itemValue}>{formatDate(date as string)}</Text>
            </View>
          </View>

          <View style={styles.summaryItem}>
            <View style={styles.itemIcon}>
              <Clock size={20} color={Colors.primary} />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemLabel}>Time</Text>
              <Text style={styles.itemValue}>{time} ({totalDuration} min)</Text>
            </View>
          </View>

          <View style={[styles.summaryItem, styles.totalItem]}>
            <View style={styles.itemIcon}>
              <CreditCard size={20} color={Colors.warning} />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemLabel}>Total</Text>
              <Text style={styles.totalPrice}>${totalPrice}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmBooking}>
          <Text style={styles.confirmText}>Confirm Booking</Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: 24,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  totalItem: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 20,
    marginBottom: 0,
  },
  itemIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 4,
  },
  itemValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  footer: {
    backgroundColor: 'white',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  confirmButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});