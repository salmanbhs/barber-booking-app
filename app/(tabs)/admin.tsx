import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Calendar, Clock, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react-native';
import { AdminBookingCard } from '@/components/AdminBookingCard';
import { mockAdminBookings } from '@/data/mockData';
import { Colors, Theme } from '@/constants/Colors';

export default function AdminScreen() {
  const todayBookings = mockAdminBookings.filter(booking => 
    booking.date === new Date().toISOString().split('T')[0]
  );

  const pendingCount = todayBookings.filter(b => b.status === 'pending').length;
  const confirmedCount = todayBookings.filter(b => b.status === 'confirmed').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Today's Schedule</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Clock size={24} color={Colors.warning} />
          <Text style={styles.statNumber}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <CheckCircle size={24} color={Colors.success} />
          <Text style={styles.statNumber}>{confirmedCount}</Text>
          <Text style={styles.statLabel}>Confirmed</Text>
        </View>
        <View style={styles.statCard}>
          <Calendar size={24} color={Colors.primary} />
          <Text style={styles.statNumber}>{todayBookings.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      <View style={styles.bookingsSection}>
        <Text style={styles.sectionTitle}>Today's Bookings</Text>
        
        <FlatList
          data={todayBookings}
          renderItem={({ item }) => (
            <AdminBookingCard booking={item} />
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.bookingsList}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: Theme.colors.surface,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: Theme.colors.text,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.textSecondary,
    marginTop: 4,
  },
  stats: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Theme.colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.textSecondary,
    marginTop: 4,
  },
  bookingsSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Theme.colors.text,
    marginBottom: 16,
  },
  bookingsList: {
    paddingBottom: 100,
  },
});