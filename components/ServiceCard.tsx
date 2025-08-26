import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, Check } from 'lucide-react-native';
import { Service } from '@/types';
import { Colors, Theme } from '@/constants/Colors';

interface ServiceCardProps {
  service: Service;
  isSelected: boolean;
  onToggle: () => void;
}

export function ServiceCard({ service, isSelected, onToggle }: ServiceCardProps) {
  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selectedContainer]}
      onPress={onToggle}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{service.name}</Text>
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Check size={16} color={Colors.white} />}
          </View>
        </View>
        
        <Text style={styles.description}>{service.description}</Text>
        
        <View style={styles.footer}>
          <View style={styles.duration}>
            <Clock size={14} color={Colors.gray500} />
            <Text style={styles.durationText}>{service.duration} min</Text>
          </View>
          <Text style={styles.price}>${service.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Theme.colors.border,
  },
  selectedContainer: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryBackground,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Theme.colors.text,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.textSecondary,
  },
  price: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Theme.colors.text,
  },
});