import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

interface NotificationProps {
  visible: boolean;
  message: string;
  type: 'success' | 'error';
  onHide: () => void;
  duration?: number;
}

export default function Notification({ 
  visible, 
  message, 
  type, 
  onHide, 
  duration = 3000 
}: NotificationProps) {
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    if (visible) {
      // Slide down
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideNotification();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideNotification = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] },
        type === 'success' ? styles.successContainer : styles.errorContainer
      ]}
    >
      <View style={styles.content}>
        <View style={[
          styles.iconContainer,
          type === 'success' ? styles.successIcon : styles.errorIcon
        ]}>
          {type === 'success' ? (
            <Check size={16} color={Colors.white} />
          ) : (
            <X size={16} color={Colors.white} />
          )}
        </View>
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1000,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  successContainer: {
    backgroundColor: Colors.success || '#10B981',
  },
  errorContainer: {
    backgroundColor: Colors.error || '#EF4444',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  successIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  errorIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  message: {
    flex: 1,
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
});
