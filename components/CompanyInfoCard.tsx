import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useCompanyConfig } from '@/contexts/CompanyConfigContext';
import { Colors, Theme } from '@/constants/Colors';

export const CompanyInfoCard: React.FC = () => {
  const { companyConfig, isLoading, error, refresh } = useCompanyConfig();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading company info...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!companyConfig) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No company information available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{companyConfig.company_name}</Text>
      <Text style={styles.description}>{companyConfig.company_description}</Text>
      
      <View style={styles.infoRow}>
        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.value}>{companyConfig.company_phone}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{companyConfig.company_email}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.label}>Currency:</Text>
        <Text style={styles.value}>{companyConfig.currency}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.label}>Booking advance:</Text>
        <Text style={styles.value}>{companyConfig.booking_advance_hours} hours</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.label}>Time slot interval:</Text>
        <Text style={styles.value}>{companyConfig.time_slot_interval} minutes</Text>
      </View>

      {companyConfig.maintenance_mode && (
        <View style={styles.maintenanceNotice}>
          <Text style={styles.maintenanceText}>🚧 Maintenance Mode</Text>
          <Text style={styles.maintenanceMessage}>{companyConfig.maintenance_message}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Theme.colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.textSecondary,
  },
  value: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Theme.colors.text,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.white,
  },
  maintenanceNotice: {
    backgroundColor: Colors.warningBackground,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  maintenanceText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.warning,
    marginBottom: 4,
  },
  maintenanceMessage: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.warning,
    lineHeight: 16,
  },
});
