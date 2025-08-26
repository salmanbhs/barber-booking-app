import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, Clock, User, MoveVertical as MoreVertical } from 'lucide-react-native';
import { Booking } from '@/types';
import { Colors, Theme } from '@/constants/Colors';

interface BookingCardProps {
  booking: Booking;
  type: 'upcoming' | 'past';
}

export function BookingCard({ booking, type }: BookingCardProps) {
  const isUpcoming = type === 'upcoming';

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
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
        <TouchableOpacity style={styles.menuButton}>
          <MoreVertical size={20} color={Colors.gray400} />
        </TouchableOpacity>
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
              <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
                <Text style={[styles.actionText, styles.cancelText]}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
              <TouchableOpacity style={styles.bookAgainButton}>
                <Text style={styles.bookAgainText}>Book Again</Text>
              </TouchableOpacity>
          )}
        </View>
      </View>
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
  menuButton: {
    padding: 4,
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
});