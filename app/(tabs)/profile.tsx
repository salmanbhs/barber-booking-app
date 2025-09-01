import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { User, Phone, Calendar, Clock, LogOut, ChevronRight, Palette, Edit } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors, Theme } from '@/constants/Colors';
import { AuthStorage } from '@/utils/authStorage';
import { ApiService } from '@/utils/apiService';
import NameCollectionPopup from '@/components/NameCollectionPopup';
import { useState, useEffect } from 'react';

export default function ProfileScreen() {
  const [userName, setUserName] = useState<string>('Guest');
  const [userPhone, setUserPhone] = useState<string>('');
  const [showNameEditPopup, setShowNameEditPopup] = useState(false);
  const [customerData, setCustomerData] = useState<any>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Try to fetch latest data from API first
      const profileResult = await ApiService.getCustomerProfile();
      
      if (profileResult.success && profileResult.data?.data?.customer) {
        const customer = profileResult.data.data.customer;
        setCustomerData(customer);
        setUserName(customer.name || 'Guest');
        setUserPhone(customer.phone || '');
      } else {
        // Fallback to local storage
        const name = await AuthStorage.getUserName();
        const phone = await AuthStorage.getUserPhone();
        
        if (name) setUserName(name);
        if (phone) setUserPhone(phone);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      
      // Fallback to local storage on error
      try {
        const name = await AuthStorage.getUserName();
        const phone = await AuthStorage.getUserPhone();
        
        if (name) setUserName(name);
        if (phone) setUserPhone(phone);
      } catch (localError) {
        console.error('Error loading local user data:', localError);
      }
    }
  };

  const profileItems = [
    { 
      icon: User, 
      label: 'Personal Information', 
      value: userName,
      onPress: () => setShowNameEditPopup(true),
      showEdit: true
    },
    { 
      icon: Phone, 
      label: 'Phone Number', 
      value: userPhone || 'Not available',
      showEdit: false
    },
    { 
      icon: Calendar, 
      label: 'Total Bookings', 
      value: customerData ? `${customerData.total_visits || 0} appointments` : '0 appointments',
      showEdit: false
    },
    { 
      icon: Clock, 
      label: 'Total Spent', 
      value: customerData ? `$${customerData.total_spent || 0}` : '$0',
      showEdit: false
    },
  ];

  const handleEditName = async (newName: string) => {
    try {
      // Update the name via API
      const result = await ApiService.updateCustomerProfile({ name: newName });
      
      if (result.success) {
        // Save locally and update UI
        await AuthStorage.saveUserName(newName);
        setUserName(newName);
        setShowNameEditPopup(false);
        
        // Update customer data if available
        if (customerData) {
          setCustomerData({ ...customerData, name: newName });
        }
        
        Alert.alert('Success', 'Your name has been updated successfully!');
      } else {
        Alert.alert('Error', result.message || 'Failed to update name. Please try again.');
      }
    } catch (error) {
      console.error('Error updating name:', error);
      Alert.alert('Error', 'Failed to update name. Please try again.');
    }
  };

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
          <Text style={styles.name}>{userName}</Text>
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
            <TouchableOpacity 
              key={index} 
              style={styles.profileItem}
              onPress={item.onPress}
              disabled={!item.onPress}
            >
              <View style={styles.itemLeft}>
                <View style={styles.itemIcon}>
                  <item.icon size={20} color={Colors.gray500} />
                </View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  <Text style={styles.itemValue}>{item.value}</Text>
                </View>
              </View>
              <View style={styles.itemRight}>
                {item.showEdit && (
                  <Edit size={16} color={Colors.primary} style={styles.editIcon} />
                )}
                <ChevronRight size={20} color={Colors.gray300} />
              </View>
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

      {/* Name Edit Popup */}
      <NameCollectionPopup
        visible={showNameEditPopup}
        onSave={handleEditName}
        onCancel={() => setShowNameEditPopup(false)}
        initialName={userName}
        isEditing={true}
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
    flex: 1,
  },
  itemContent: {
    flex: 1,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editIcon: {
    marginRight: 4,
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