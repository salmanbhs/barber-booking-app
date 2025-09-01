import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';
import { Plus, Calendar, Clock, User, MoveVertical as MoreVertical } from 'lucide-react-native';
import { BookingCard } from '@/components/BookingCard';
import NameCollectionPopup from '@/components/NameCollectionPopup';
import { mockBookings } from '@/data/mockData';
import { Colors, Theme } from '@/constants/Colors';
import { AuthStorage } from '@/utils/authStorage';
import { ApiService } from '@/utils/apiService';
import { useState, useEffect } from 'react';
import '@/utils/debugUtils'; // Import debug utils for console access

export default function DashboardScreen() {
  const [userName, setUserName] = useState<string | null>(null);
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [loading, setLoading] = useState(true);

  const upcomingBookings = mockBookings.filter(booking => booking.status === 'confirmed');
  const pastBookings = mockBookings.filter(booking => booking.status === 'completed');

  useEffect(() => {
    checkUserName();
  }, []);

  const checkUserName = async () => {
    try {
      // First, try to fetch the profile from the API
      const profileResult = await ApiService.getCustomerProfile();
      
      if (profileResult.success && profileResult.data?.data?.customer?.name) {
        const customer = profileResult.data.data.customer;
        const apiName = customer.name;
        console.log('📋 Found name in API profile:', apiName);
        
        // Save the complete customer profile locally
        await AuthStorage.saveCustomerProfile({
          name: customer.name,
          customerId: customer.id,
          email: customer.email,
          totalVisits: customer.total_visits,
          totalSpent: customer.total_spent,
        });
        
        setUserName(apiName);
      } else {
        console.log('📋 No name found in API profile, checking local storage');
        
        // Fallback to local storage
        const hasName = await AuthStorage.hasUserName();
        if (hasName) {
          const localName = await AuthStorage.getUserName();
          setUserName(localName);
        } else {
          console.log('📋 No name found locally, showing name popup');
          setShowNamePopup(true);
        }
      }
    } catch (error) {
      console.error('Error checking user name:', error);
      
      // Fallback to local storage on API error
      try {
        const hasName = await AuthStorage.hasUserName();
        if (hasName) {
          const localName = await AuthStorage.getUserName();
          setUserName(localName);
        } else {
          setShowNamePopup(true);
        }
      } catch (localError) {
        console.error('Error checking local name:', localError);
        setShowNamePopup(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async (name: string) => {
    try {
      // The API call is now handled in the NameCollectionPopup component
      // This function will only be called after successful API update
      setUserName(name);
      setShowNamePopup(false);
    } catch (error) {
      console.error('Error saving user name:', error);
      throw error;
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
          </View>
          
          {upcomingBookings.length > 0 ? (
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
          
          {pastBookings.length > 0 ? (
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
});