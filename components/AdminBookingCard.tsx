import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { User, Clock, Phone, CircleCheck as CheckCircle, Circle as XCircle } from 'lucide-react-native';
import { AdminBooking } from '@/types';
import { Colors, Theme } from '@/constants/Colors';

interface AdminBookingCardProps {
  booking: AdminBooking;
}

export function AdminBookingCard({ booking }: AdminBookingCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return Colors.warning;
      case 'confirmed': return Colors.success;
      case 'cancelled': return Colors.error;
      default: return Colors.gray500;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.customerInfo}>
          <View style={styles.avatar}>
            <User size={20} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.customerName}>{booking.customerName}</Text>
            <Text style={styles.time}>{booking.time}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
            {booking.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.services}>
        <Text style={styles.servicesLabel}>Services:</Text>
        <Text style={styles.servicesText}>{booking.services.join(', ')}</Text>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Clock size={16} color={Colors.gray500} />
          <Text style={styles.detailText}>{booking.duration} minutes</Text>
        </View>
        <View style={styles.detailItem}>
          <Phone size={16} color={Colors.gray500} />
          <Text style={styles.detailText}>{booking.customerPhone}</Text>
        </View>
      </View>

      {booking.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.acceptButton}>
            <CheckCircle size={16} color={Colors.white} />
            <Text style={styles.acceptText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectButton}>
            <XCircle size={16} color={Colors.error} />
            <Text style={styles.rejectText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
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
  customerInfo: {
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
  customerName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Theme.colors.text,
  },
  time: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.textSecondary,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  services: {
    marginBottom: 12,
  },
  servicesLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.textSecondary,
  },
  servicesText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Theme.colors.text,
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
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  acceptText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.white,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.surface,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.errorBackground,
    gap: 6,
  },
  rejectText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.error,
  },
});