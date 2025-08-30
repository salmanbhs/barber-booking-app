import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';
import { Plus, Calendar, Clock, User, MoveVertical as MoreVertical } from 'lucide-react-native';
import { BookingCard } from '@/components/BookingCard';
import { mockBookings } from '@/data/mockData';
import { Colors, Theme } from '@/constants/Colors';

export default function DashboardScreen() {
  const upcomingBookings = mockBookings.filter(booking => booking.status === 'confirmed');
  const pastBookings = mockBookings.filter(booking => booking.status === 'completed');

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
          <Text style={styles.userName}>John Doe</Text>
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