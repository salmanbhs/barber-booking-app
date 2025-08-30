import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { User, Phone, Calendar, Clock, LogOut, ChevronRight, Palette } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors, Theme } from '@/constants/Colors';
import { AuthStorage } from '@/utils/authStorage';

export default function ProfileScreen() {
  const profileItems = [
    { icon: User, label: 'Personal Information', value: 'John Doe' },
    { icon: Phone, label: 'Phone Number', value: '+1 (555) 123-4567' },
    { icon: Calendar, label: 'Total Bookings', value: '12 appointments' },
    { icon: Clock, label: 'Member Since', value: 'January 2024' },
  ];

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear authentication data first
              await AuthStorage.clearAuthData();
              
              // Use router.push to navigate to login
              router.push('/');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <User size={32} color={Colors.primary} />
          </View>
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.memberInfo}>Premium Member</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <TouchableOpacity style={styles.profileItem} onPress={() => router.push('/color-config')}>
            <View style={styles.itemLeft}>
              <View style={styles.itemIcon}>
                <Palette size={20} color={Colors.gray500} />
              </View>
              <View>
                <Text style={styles.itemLabel}>Color Configuration</Text>
                <Text style={styles.itemValue}>Customize app colors</Text>
              </View>
            </View>
            <ChevronRight size={20} color={Colors.gray300} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          {profileItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.profileItem}>
              <View style={styles.itemLeft}>
                <View style={styles.itemIcon}>
                  <item.icon size={20} color={Colors.gray500} />
                </View>
                <View>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  <Text style={styles.itemValue}>{item.value}</Text>
                </View>
              </View>
              <ChevronRight size={20} color={Colors.gray300} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color={Colors.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  profileCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    backgroundColor: Colors.primaryBackground,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  memberInfo: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Theme.colors.text,
    marginBottom: 12,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemIcon: {
    width: 40,
    height: 40,
    backgroundColor: Colors.gray100,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.textSecondary,
  },
  itemValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Theme.colors.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.errorBackground,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.error,
  },
});