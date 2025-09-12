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
        
        return (
          <TouchableOpacity
            key={slot}
            style={[
              styles.slot,
              isSelected && styles.slotSelected,
            ]}
            onPress={() => onSelectSlot(slot)}
          >
            <Text
              style={[
                styles.slotText,
                isSelected && styles.slotTextSelected,
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
  slotText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Theme.colors.textSecondary,
  },
  slotTextSelected: {
    color: Colors.white,
  },
});