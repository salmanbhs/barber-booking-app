import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Star, MapPin } from 'lucide-react-native';
import { BarberCard } from '@/components/BarberCard';
import { mockBarbers } from '@/data/mockData';
import { Colors, Theme } from '@/constants/Colors';

export default function SelectBarberScreen() {
  const handleSelectBarber = (barberId: string) => {
    router.push({
      pathname: '/booking/select-services',
      params: { barberId }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.gray800} />
        </TouchableOpacity>
        <Text style={styles.title}>Select Barber</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={mockBarbers}
        renderItem={({ item }) => (
          <BarberCard
            barber={item}
            onSelect={() => handleSelectBarber(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: Theme.colors.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Theme.colors.text,
  },
  list: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 100,
  },
});