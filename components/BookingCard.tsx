import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import { Calendar, Clock, User } from 'lucide-react-native';
import { Booking, Service } from '@/types';
import { Colors, Theme } from '@/constants/Colors';
import { formatRelativeDate } from '@/utils/timeUtils';
import { ApiService } from '@/utils/apiService';
import { DataCache } from '@/utils/dataCache';
import { BookingStorage } from '@/utils/bookingStorage';
import { useState } from 'react';
import { router } from 'expo-router';

interface BookingCardProps {
  booking: Booking;
  type: 'upcoming' | 'past';
  onBookingUpdated?: () => void; // Callback to refresh bookings list
}

export function BookingCard({ booking, type, onBookingUpdated }: BookingCardProps) {
  const isUpcoming = type === 'upcoming';
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const formatDate = (dateStr: string) => {
    return formatRelativeDate(dateStr);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#86EFAC'; // Light Green
      case 'pending':
        return '#FCD34D'; // Light Orange/Yellow
      case 'completed':
        return '#A5B4FC'; // Light Blue
      case 'cancelled':
        return '#FCA5A5'; // Light Red
      default:
        return Colors.gray400;
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleCancelBooking = () => {
    console.log('🚫 Cancel booking button pressed for booking:', booking.id);
    console.log('🚫 Booking details:', booking);
    setShowCancelModal(true);
  };

  const confirmCancellation = async () => {
    console.log('🚫 User confirmed cancellation for booking:', booking.id);
    setShowCancelModal(false);
    setIsCancelling(true);
    
    try {
      console.log('🌐 Calling ApiService.cancelBooking with ID:', booking.id);
      const response = await ApiService.cancelBooking(booking.id);
      console.log('📡 Cancel booking response:', response);
      
      if (response.success) {
        console.log('✅ Booking cancelled successfully');
        // Show success feedback - try Alert first, fallback to console
        try {
          Alert.alert(
            'Booking Cancelled',
            'Your booking has been successfully cancelled.',
            [{ text: 'OK' }]
          );
        } catch (alertError) {
          console.log('✅ SUCCESS: Your booking has been successfully cancelled!');
        }
        
        // Refresh bookings cache and notify parent component
        try {
          console.log('🔄 Refreshing bookings cache...');
          await DataCache.fetchAndCacheBookings();
          console.log('🔄 Calling onBookingUpdated callback...');
          onBookingUpdated?.();
        } catch (cacheError) {
          console.warn('Failed to refresh bookings cache:', cacheError);
          // Still call onBookingUpdated to trigger a re-fetch in the parent
          onBookingUpdated?.();
        }
      } else {
        console.error('❌ Booking cancellation failed:', response.message);
        try {
          Alert.alert(
            'Cancellation Failed',
            response.message || 'Failed to cancel booking. Please try again.',
            [{ text: 'OK' }]
          );
        } catch (alertError) {
          console.error('❌ ERROR: Failed to cancel booking:', response.message);
        }
      }
    } catch (error) {
      console.error('❌ Cancel booking error:', error);
      try {
        Alert.alert(
          'Error',
          'Something went wrong. Please try again.',
          [{ text: 'OK' }]
        );
      } catch (alertError) {
        console.error('❌ ERROR: Something went wrong while cancelling booking');
      }
    } finally {
      setIsCancelling(false);
    }
  };

  const handleBookAgain = async () => {
    console.log('🔄 Book again button pressed for booking:', booking.id);
    console.log('🔄 Reusing barber and services:', {
      barberId: booking.barberId,
      barberName: booking.barberName,
      services: booking.services,
      serviceIds: booking.serviceIds
    });

    try {
      // First, get the cached barbers to find the full barber object
      const barbers = await DataCache.getBarbers();
      const barber = barbers.find(b => b.id === booking.barberId);
      
      if (!barber) {
        console.error('❌ Barber not found in cache:', booking.barberId);
        try {
          Alert.alert(
            'Error',
            'Could not find barber information. Please select a barber manually.',
            [{ text: 'OK' }]
          );
        } catch (alertError) {
          console.error('❌ ERROR: Could not find barber information');
        }
        return;
      }

      // Get the cached services to find the full service objects
      const servicesData = await DataCache.getServices();
      const selectedServices = servicesData.services.filter((service: Service) => 
        booking.services.includes(service.name) || 
        (booking.serviceIds && booking.serviceIds.includes(service.id))
      );

      if (selectedServices.length === 0) {
        console.error('❌ Services not found in cache:', booking.services);
        try {
          Alert.alert(
            'Error',
            'Could not find service information. Please select services manually.',
            [{ text: 'OK' }]
          );
        } catch (alertError) {
          console.error('❌ ERROR: Could not find service information');
        }
        return;
      }

      console.log('✅ Found barber and services, saving to booking storage');
      
      // Save the barber and services to booking storage
      await BookingStorage.saveBarber(barber);
      await BookingStorage.saveServices(selectedServices);
      
      console.log('🚀 Navigating to select time page with params');
      
      // Navigate to select time page with URL parameters (like the normal flow)
      router.push({
        pathname: '/booking/select-time',
        params: { 
          barberId: booking.barberId!,
          services: selectedServices.map(s => s.id).join(',')
        }
      });
      
    } catch (error) {
      console.error('❌ Book again error:', error);
      try {
        Alert.alert(
          'Error',
          'Something went wrong. Please try booking manually.',
          [{ text: 'OK' }]
        );
      } catch (alertError) {
        console.error('❌ ERROR: Something went wrong with book again');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.barberInfo}>
          <View style={styles.avatar}>
            <User size={20} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.barberName}>{booking.barberName}</Text>
            <Text style={styles.services}>
              {booking.services.join(', ')}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
          <Text style={styles.statusText}>{getStatusText(booking.status)}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Calendar size={16} color={Colors.gray500} />
          <Text style={styles.detailText}>{formatDate(booking.date)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Clock size={16} color={Colors.gray500} />
          <Text style={styles.detailText}>{booking.time}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.totalPrice}>${booking.totalPrice}</Text>
        <View style={styles.actions}>
          {isUpcoming ? (
            <>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>Reschedule</Text>
              </TouchableOpacity>
              {/* Only show cancel button for pending or confirmed bookings */}
              {(booking.status === 'pending' || booking.status === 'confirmed') && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={handleCancelBooking}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <ActivityIndicator size="small" color={Colors.error} />
                  ) : (
                    <Text style={[styles.actionText, styles.cancelText]}>Cancel</Text>
                  )}
                </TouchableOpacity>
              )}
            </>
          ) : (
              <TouchableOpacity 
                style={styles.bookAgainButton}
                onPress={handleBookAgain}
              >
                <Text style={styles.bookAgainText}>Book Again</Text>
              </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Custom Confirmation Modal */}
      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cancel Booking</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to cancel your appointment with {booking.barberName} on {formatDate(booking.date)} at {booking.time}?
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSecondary]} 
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>No, Keep Booking</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonPrimary]} 
                onPress={confirmCancellation}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.modalButtonTextPrimary}>Yes, Cancel</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  barberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    backgroundColor: Colors.primaryBackground,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barberName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Theme.colors.text,
  },
  services: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.textSecondary,
  },
  details: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPrice: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Theme.colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Theme.colors.textSecondary,
  },
  cancelButton: {
    borderColor: Colors.errorBackground,
  },
  cancelText: {
    color: Colors.error,
  },
  bookAgainButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  bookAgainText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.white,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Theme.colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  modalButtonSecondary: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  modalButtonPrimary: {
    backgroundColor: Colors.error,
  },
  modalButtonTextSecondary: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Theme.colors.textSecondary,
  },
  modalButtonTextPrimary: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});