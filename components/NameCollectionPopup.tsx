import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { User, Check } from 'lucide-react-native';
import { Colors, Theme } from '@/constants/Colors';
import { ApiService } from '@/utils/apiService';
import { AuthStorage } from '@/utils/authStorage';

interface NameCollectionPopupProps {
  visible: boolean;
  onSave: (name: string) => void;
  onCancel?: () => void;
  initialName?: string;
  isEditing?: boolean;
}

export default function NameCollectionPopup({ visible, onSave, onCancel, initialName = '', isEditing = false }: NameCollectionPopupProps) {
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);

  // Update name when initialName changes (for editing mode)
  useEffect(() => {
    if (visible) {
      setName(initialName);
    }
  }, [visible, initialName]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (name.trim().length < 2) {
      Alert.alert('Error', 'Name must be at least 2 characters');
      return;
    }

    setLoading(true);
    try {
      // Update profile via API
      const result = await ApiService.updateCustomerProfile({
        name: name.trim()
      });

      if (result.success) {
        // Save name locally after successful API call
        await AuthStorage.saveUserName(name.trim());
        await onSave(name.trim());
        setName('');
      } else {
        Alert.alert('Error', result.message || 'Failed to save name. Please try again.');
      }
    } catch (error) {
      console.error('Error saving name:', error);
      Alert.alert('Error', 'Failed to save name. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View style={styles.popup}>
              {/* Header */}
              <View style={styles.header}>
                {/* <View style={styles.iconContainer}>
                  <User size={32} color={Colors.primary} />
                </View> */}
                <Text style={styles.title}>{isEditing ? 'Edit Your Name' : 'Welcome!'}</Text>
                <Text style={styles.subtitle}>
                  {isEditing 
                    ? 'Update your name to keep your profile current'
                    : 'Please tell us your name to personalize your experience'
                  }
                </Text>
              </View>

              {/* Input Section */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Your Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  placeholderTextColor={Colors.gray400}
                  autoFocus={true}
                  maxLength={50}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Saving...' : (isEditing ? 'Update Name' : 'Continue')}
                </Text>
                <Check size={20} color={Colors.white} />
              </TouchableOpacity>

              {/* Cancel Button for Editing Mode */}
              {isEditing && onCancel && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onCancel}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}

              {/* Note */}
              <Text style={styles.note}>
                You can always change this later in your profile settings
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scrollContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 50,
  },
  container: {
    width: '100%',
    maxWidth: 400,
  },
  popup: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 20,
    padding: 32,
    shadowColor: Colors.gray800,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Theme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Theme.colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Theme.colors.background,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.text,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.white,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.textSecondary,
  },
  note: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
