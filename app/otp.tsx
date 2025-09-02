import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import { Colors, Theme } from '@/constants/Colors';
import { AuthStorage } from '@/utils/authStorage';
import { ApiService } from '@/utils/apiService';

export default function OTPScreen() {
  const { phone } = useLocalSearchParams();
  const phoneNumber = Array.isArray(phone) ? phone[0] : phone;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Safety check to prevent rendering issues
  if (!phoneNumber) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    if (!phoneNumber) {
      Alert.alert('Error', 'Phone number is missing');
      return;
    }

    setLoading(true);
    
    try {
      const result = await ApiService.verifyOTP(phoneNumber, otp);

      if (result.success) {
        // OTP verified successfully - save auth data with access token
        console.log('🔧 OTP verification result:', JSON.stringify(result, null, 2));
        console.log('🔧 Available fields in response:', Object.keys(result.data || {}));
        
        // Extract access token from the response structure
        const accessToken = result.data?.session?.access_token || 
                          result.data?.accessToken || 
                          result.data?.token || 
                          result.data?.access_token ||
                          result.data?.authToken ||
                          result.data?.jwt;
        
        // Extract refresh token and expiration
        const refreshToken = result.data?.session?.refresh_token || 
                           result.data?.refreshToken || 
                           result.data?.refresh_token;
        
        const tokenExpiresAt = result.data?.session?.expires_at || 
                             result.data?.token_info?.expires_at ||
                             result.data?.expires_at;
                          
        console.log('🔧 Extracted access token:', accessToken ? `Found (${accessToken.substring(0, 20)}...)` : 'Not found');
        console.log('🔧 Extracted refresh token:', refreshToken ? `Found (${refreshToken.substring(0, 10)}...)` : 'Not found');
        console.log('🔧 Token expires at:', tokenExpiresAt);
        
        if (!accessToken) {
          console.warn('⚠️ No access token found in OTP response. This might be a backend issue.');
          console.log('📋 Full response data:', result.data);
          // Still save the auth data, but without token for now
          await AuthStorage.saveAuthData(phoneNumber);
        } else {
          // Extract additional user information
          const userId = result.data?.user?.id || result.data?.session?.user?.id;
          const email = result.data?.user?.email || result.data?.session?.user?.email;
          
          console.log('🔧 Saving auth data with token and user info');
          await AuthStorage.saveAuthData(phoneNumber, accessToken, {
            userId,
            email,
            refreshToken,
            tokenExpiresAt
          });
        }
        
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', result.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('OTP Verification Error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    if (!phoneNumber) {
      Alert.alert('Error', 'Phone number is missing');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await ApiService.sendOTP(phoneNumber);

      if (result.success) {
        setCountdown(30);
        Alert.alert('Success', 'OTP sent successfully');
      } else {
        Alert.alert('Error', result.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.error('Resend OTP Error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ArrowLeft size={24} color={Colors.gray800} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Verification Code</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit code to {phoneNumber || 'your phone'}
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.otpInput}
          value={otp}
          onChangeText={setOtp}
          keyboardType="numeric"
          maxLength={6}
          placeholder="000000"
          placeholderTextColor={Colors.gray400}
          textAlign="center"
        />
        
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerifyOTP}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Verifying...' : 'Verify'}
          </Text>
          <Check size={20} color={Colors.white} />
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code?</Text>
          <TouchableOpacity
            onPress={handleResendOTP}
            disabled={countdown > 0}
          >
            <Text style={[
              styles.resendButton,
              countdown > 0 && styles.resendDisabled
            ]}>
              {countdown > 0 ? `Resend in ${Math.max(0, countdown)}s` : 'Resend OTP'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: 10,
    marginBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
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
  form: {
    alignItems: 'center',
  },
  otpInput: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Theme.colors.text,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: 32,
    width: '100%',
    letterSpacing: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
    width: '100%',
    marginBottom: 32,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.white,
  },
  resendContainer: {
    alignItems: 'center',
    gap: 4,
  },
  resendText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.textSecondary,
  },
  resendButton: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.primary,
  },
  resendDisabled: {
    color: Colors.gray400,
  },
});