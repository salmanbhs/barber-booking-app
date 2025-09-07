import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Star, MapPin } from 'lucide-react-native';
import { Barber } from '@/types';
import { Colors, Theme } from '@/constants/Colors';

interface BarberCardProps {
  barber: Barber;
  onSelect: () => void;
}

export function BarberCard({ barber, onSelect }: BarberCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onSelect}>
      <Image 
        source={{ 
          uri: barber.profile_image_url || 'https://via.placeholder.com/80x80/e0e0e0/999999?text=No+Image' 
        }} 
        style={styles.photo} 
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{barber.user.name}</Text>
          <View style={styles.rating}>
            <Star size={16} color={Colors.warning} fill={Colors.warning} />
            <Text style={styles.ratingText}>{barber.rating}</Text>
          </View>
        </View>
        
        <Text style={styles.specialties}>{barber.specialties.join(', ')}</Text>
        
        <Text style={styles.bio} numberOfLines={2}>{barber.bio}</Text>
        
        <View style={styles.footer}>
          <Text style={styles.experience}>{barber.experience_years} years exp.</Text>
          <Text style={styles.email}>{barber.user.email}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Theme.colors.text,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Theme.colors.textSecondary,
  },
  specialties: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.textSecondary,
    marginBottom: 8,
  },
  bio: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.gray600,
    marginBottom: 8,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  experience: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.textSecondary,
  },
  email: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.gray500,
  },
});