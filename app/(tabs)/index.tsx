import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Plus, Calendar, Clock, User, MoveVertical as MoreVertical } from 'lucide-react-native';
import { BookingCard } from '@/components/BookingCard';
import NameCollectionPopup from '@/components/NameCollectionPopup';
import { Colors, Theme } from '@/constants/Colors';
import { AuthStorage } from '@/utils/authStorage';
import { ApiService } from '@/utils/apiService';
import { DataCache } from '@/utils/dataCache';
import { AppEvents, EVENTS } from '@/utils/appEvents';
import { Booking } from '@/types';
import { useState, useEffect, useCallback } from 'react';

export default function DashboardScreen() {
  const [userName, setUserName] = useState<string | null>(null);
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Helper function to check if booking is in the future
  const isBookingInFuture = (booking: Booking): boolean => {
    try {
      // Combine date and time to create a full datetime
      const bookingDateTime = new Date(`${booking.date}T${convertTo24Hour(booking.time)}`);
      const now = new Date();
      
      return bookingDateTime > now;
    } catch (error) {
      console.error('Error parsing booking date/time:', error, booking);
      // If there's an error parsing, fall back to status-based logic
      return booking.status === 'confirmed' || booking.status === 'pending';
    }
  };

  // Helper function to convert 12-hour time to 24-hour format for date parsing
  const convertTo24Hour = (time12h: string): string => {
    const [time, period] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (period === 'PM' && hours !== '12') {
      hours = String(parseInt(hours) + 12);
    } else if (period === 'AM' && hours === '12') {
      hours = '00';
    }
    
    return `${hours.padStart(2, '0')}:${minutes}:00`;
  };

  // Filter bookings based on actual date/time, not just status
  const upcomingBookings = bookings.filter(booking => {
    // Only show confirmed or pending bookings that are in the future
    const isValidStatus = booking.status === 'confirmed' || booking.status === 'pending';
    const isInFuture = isBookingInFuture(booking);
    const isUpcoming = isValidStatus && isInFuture;
    
    if (isValidStatus) {
      console.log(`📅 Booking ${booking.confirmation_code}: ${booking.date} ${booking.time} - ${isInFuture ? 'FUTURE' : 'PAST'} (${booking.status})`);
    }
    
    return isUpcoming;
  });
  
  const pastBookings = bookings.filter(booking => {
    // Show completed/cancelled bookings OR confirmed/pending bookings that are in the past
    const isCompletedOrCancelled = booking.status === 'completed' || booking.status === 'cancelled';
    const isInPast = !isBookingInFuture(booking);
    const isPendingButPast = (booking.status === 'confirmed' || booking.status === 'pending') && isInPast;
    
    return isCompletedOrCancelled || isPendingButPast;
  });

  // Debug logging for booking categorization
  console.log(`📊 Dashboard booking summary:`, {
    total: bookings.length,
    upcoming: upcomingBookings.length,
    past: pastBookings.length
  });

  useEffect(() => {
    checkUserName();
    fetchBookings();
    
    // Listen for name updates from other screens
    const handleNameUpdate = (newName: string) => {
      console.log(`📡 Dashboard: Received name update event: "${newName}"`);
      setUserName(newName);
    };
    
    // Listen for auth state changes (like logout)
    const handleAuthStateChange = (authState: any) => {
      if (authState.isLoggedOut) {
        console.log('📡 Dashboard: Received logout event, resetting state');
        setUserName(null);
        setShowNamePopup(false);
        setBookings([]); // Clear bookings on logout
      }
    };
    
    AppEvents.on(EVENTS.USER_NAME_UPDATED, handleNameUpdate);
    AppEvents.on(EVENTS.AUTH_STATE_CHANGED, handleAuthStateChange);
    
    // Cleanup event listeners
    return () => {
      AppEvents.off(EVENTS.USER_NAME_UPDATED, handleNameUpdate);
      AppEvents.off(EVENTS.AUTH_STATE_CHANGED, handleAuthStateChange);
    };
  }, []);

  // Refresh user name and bookings when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshUserName();
      refreshBookings();
    }, [])
  );

  const refreshUserName = async () => {
    try {
      // Always check local storage first for immediate update
      const localName = await AuthStorage.getUserName();
      if (localName && localName !== userName) {
        console.log(`🔄 Dashboard: Updating name from "${userName}" to "${localName}"`);
        setUserName(localName);
      }
      
      // Note: Don't show popup here - this is just for refreshing existing state
      // The popup should only be shown during initial checkUserName() flow
    } catch (error) {
      console.error('Error refreshing user name:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      console.log('🔍 Dashboard: Fetching user bookings...');
      setLoadingBookings(true);
      
      const bookingsData = await DataCache.getBookings();
      setBookings(bookingsData || []);
      console.log('✅ Dashboard: Loaded', bookingsData?.length || 0, 'bookings');
    } catch (error) {
      console.error('❌ Dashboard: Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const refreshBookings = async () => {
    try {
      console.log('🔄 Dashboard: Refreshing user bookings...');
      
      // Fetch fresh data from API
      const response = await ApiService.getMyBookings();
      if (response.success && response.data) {
        const freshBookings = response.data.bookings || [];
        setBookings(freshBookings);
        
        // Update cache in background
        await DataCache.cacheBookings(freshBookings);
        console.log('✅ Dashboard: Refreshed', freshBookings.length, 'bookings');
      }
    } catch (error) {
      console.error('❌ Dashboard: Error refreshing bookings:', error);
    }
  };

  const checkUserName = async () => {
    setLoading(true);
    try {
      console.log('🔍 Dashboard: Starting user name check...');
      
      // First, try to fetch the profile from the API
      const profileResult = await ApiService.getCustomerProfile();
      
      if (profileResult.success && profileResult.data?.data?.customer?.name) {
        const customer = profileResult.data.data.customer;
        const apiName = customer.name;
        console.log('✅ Dashboard: Found name in API profile:', apiName);
        
        // Save the complete customer profile locally
        await AuthStorage.saveCustomerProfile({
          name: customer.name,
          customerId: customer.id,
          email: customer.email,
          totalVisits: customer.total_visits,
          totalSpent: customer.total_spent,
        });
        
        setUserName(apiName);
        console.log('✅ Dashboard: Name set from API, no popup needed');
      } else {
        console.log('⚠️ Dashboard: No name found in API profile, checking local storage');
        
        // Fallback to local storage
        const hasName = await AuthStorage.hasUserName();
        if (hasName) {
          const localName = await AuthStorage.getUserName();
          setUserName(localName);
          console.log('✅ Dashboard: Found name in local storage:', localName);
        } else {
          console.log('❌ Dashboard: No name found anywhere, showing popup');
          setShowNamePopup(true);
        }
      }
    } catch (error) {
      console.error('❌ Dashboard: Error checking user name from API:', error);
      
      // Fallback to local storage on API error
      try {
        const hasName = await AuthStorage.hasUserName();
        if (hasName) {
          const localName = await AuthStorage.getUserName();
          setUserName(localName);
          console.log('✅ Dashboard: Found name in local storage (fallback):', localName);
        } else {
          console.log('❌ Dashboard: No local name found, showing popup (fallback)');
          setShowNamePopup(true);
        }
      } catch (localError) {
        console.error('❌ Dashboard: Error checking local name:', localError);
        setShowNamePopup(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async (name: string, success: boolean, message?: string, backupName?: string) => {
    try {
      if (success && !message) {
        // Initial optimistic update - just update UI
        setUserName(name);
        setShowNamePopup(false);
        
        // Emit event for other screens
        AppEvents.emit(EVENTS.USER_NAME_UPDATED, name);
      } else if (success && message) {
        // API call succeeded - could show notification here if needed
        console.log('Name update successful:', message);
        
        // Emit final success event
        AppEvents.emit(EVENTS.USER_NAME_UPDATED, name);
      } else {
        // API call failed - revert to backup name
        if (backupName) {
          setUserName(backupName);
          
          // Emit revert event
          AppEvents.emit(EVENTS.USER_NAME_UPDATED, backupName);
        }
        console.error('Name save failed:', message);
      }
    } catch (error) {
      console.error('Error handling name save result:', error);
    }
  };

  const handleNewBooking = () => {
    router.push('/booking/select-barber');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
            <Text style={styles.greeting}>
            {(() => {
              const hour = new Date().getHours();
              if (hour < 12) return 'Good morning,';
              if (hour < 15) return 'Good afternoon,';
              if (hour < 22) return 'Good evening,';
              return 'Good night,';
            })()}
            </Text>
          <Text style={styles.userName}>{userName || 'Guest'}</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <User size={24} color={Colors.gray500} />
        </TouchableOpacity>

        {/* Block text to show as header */}
        {/* <Text style={{ fontSize: 32, fontFamily: 'Inter-Bold', color: Theme.colors.surface, backgroundColor: Theme.colors.primary, textAlign: 'center', flex: 1 }}>
          حَــــلاق حــــسَـــن
        </Text> */}
      </View>

      <TouchableOpacity style={styles.newBookingButton} onPress={handleNewBooking}>
        <Plus size={24} color={Colors.white} />
        <Text style={styles.newBookingText}>New Booking</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color={Colors.gray800} />
            <Text style={styles.sectionTitle}>Upcoming Bookings</Text>
            {loadingBookings && (
              <ActivityIndicator size="small" color={Colors.primary} style={{ marginLeft: 8 }} />
            )}
          </View>
          
          {loadingBookings ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading your bookings...</Text>
            </View>
          ) : upcomingBookings.length > 0 ? (
            <FlatList
              data={upcomingBookings}
              renderItem={({ item }) => (
                <BookingCard booking={item} type="upcoming" />
              )}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={48} color={Colors.gray300} />
              <Text style={styles.emptyText}>No upcoming bookings</Text>
              <Text style={styles.emptySubtext}>Book your next appointment</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color={Colors.gray800} />
            <Text style={styles.sectionTitle}>Past Bookings</Text>
          </View>
          
          {loadingBookings ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading your bookings...</Text>
            </View>
          ) : pastBookings.length > 0 ? (
            <FlatList
              data={pastBookings}
              renderItem={({ item }) => (
                <BookingCard booking={item} type="past" />
              )}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Clock size={48} color={Colors.gray300} />
              <Text style={styles.emptyText}>No past bookings</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Name Collection Popup */}
      <NameCollectionPopup
        visible={showNamePopup}
        onSave={handleSaveName}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: Theme.colors.surface,
  },
  greeting: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Theme.colors.text,
  },
  profileButton: {
    width: 48,
    height: 48,
    backgroundColor: Colors.gray100,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newBookingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: 24,
    marginVertical: 16,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  newBookingText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.white,
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
    color: Theme.colors.text,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: Theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Theme.colors.textSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.textMuted,
    marginTop: 4,
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: Theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.textSecondary,
    marginTop: 12,
  },
});