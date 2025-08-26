import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Theme } from '@/constants/Colors';

interface TimeSlotGridProps {
  slots: string[];
  selectedSlot: string;
  onSelectSlot: (slot: string) => void;
}

export function TimeSlotGrid({ slots, selectedSlot, onSelectSlot }: TimeSlotGridProps) {
  return (
    <View style={styles.container}>
      {slots.map((slot, index) => {
        const isSelected = selectedSlot === slot;
        const isUnavailable = Math.random() > 0.7; // Simulate some unavailable slots
        
        return (
          <TouchableOpacity
            key={slot}
            style={[
              styles.slot,
              isSelected && styles.slotSelected,
              isUnavailable && styles.slotUnavailable,
            ]}
            onPress={() => !isUnavailable && onSelectSlot(slot)}
            disabled={isUnavailable}
          >
            <Text
              style={[
                styles.slotText,
                isSelected && styles.slotTextSelected,
                isUnavailable && styles.slotTextUnavailable,
              ]}
            >
              {slot}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  slot: {
    backgroundColor: Theme.colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    minWidth: '30%',
    alignItems: 'center',
  },
  slotSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  slotUnavailable: {
    backgroundColor: Colors.gray100,
    borderColor: Theme.colors.border,
  },
  slotText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Theme.colors.textSecondary,
  },
  slotTextSelected: {
    color: Colors.white,
  },
  slotTextUnavailable: {
    color: Colors.gray300,
  },
});