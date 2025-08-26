import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { ArrowLeft, Palette, Save, RotateCcw } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors, Theme } from '@/constants/Colors';

interface ColorSwatch {
  name: string;
  key: keyof typeof Colors;
  value: string;
  description: string;
}

export default function ColorConfigScreen() {
  const [colors, setColors] = useState({
    primary: Colors.primary,
    success: Colors.success,
    warning: Colors.warning,
    error: Colors.error,
  });

  const colorSwatches: ColorSwatch[] = [
    {
      name: 'Primary',
      key: 'primary',
      value: colors.primary,
      description: 'Main brand color used for buttons and highlights'
    },
    {
      name: 'Success',
      key: 'success',
      value: colors.success,
      description: 'Used for success messages and confirmations'
    },
    {
      name: 'Warning',
      key: 'warning',
      value: colors.warning,
      description: 'Used for warnings and pending states'
    },
    {
      name: 'Error',
      key: 'error',
      value: colors.error,
      description: 'Used for errors and destructive actions'
    },
  ];

  const presetColors = [
    { name: 'Teal', primary: '#009F9A' },
    { name: 'Blue', primary: '#3B82F6' },
    { name: 'Purple', primary: '#8B5CF6' },
    { name: 'Green', primary: '#10B981' },
    { name: 'Orange', primary: '#F59E0B' },
    { name: 'Red', primary: '#EF4444' },
    { name: 'Pink', primary: '#EC4899' },
    { name: 'Indigo', primary: '#6366F1' },
  ];

  const handleColorChange = (key: keyof typeof colors, value: string) => {
    // Validate hex color format
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (hexRegex.test(value)) {
      setColors(prev => ({ ...prev, [key]: value }));
    }
  };

  const handlePresetSelect = (presetColor: string) => {
    setColors(prev => ({ ...prev, primary: presetColor }));
  };

  const handleSave = () => {
    // In a real app, you would save these to AsyncStorage or a global state
    Alert.alert('Success', 'Color theme saved successfully!');
    router.back();
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Colors',
      'Are you sure you want to reset all colors to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setColors({
              primary: '#009F9A',
              success: '#10B981',
              warning: '#F59E0B',
              error: '#DC2626',
            });
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.gray800} />
        </TouchableOpacity>
        <Text style={styles.title}>Color Configuration</Text>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <RotateCcw size={20} color={Colors.gray600} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Palette size={20} color={Colors.gray800} />
            <Text style={styles.sectionTitle}>Color Presets</Text>
          </View>
          
          <View style={styles.presetsGrid}>
            {presetColors.map((preset) => (
              <TouchableOpacity
                key={preset.name}
                style={[
                  styles.presetCard,
                  colors.primary === preset.primary && styles.presetCardSelected
                ]}
                onPress={() => handlePresetSelect(preset.primary)}
              >
                <View style={[styles.presetColor, { backgroundColor: preset.primary }]} />
                <Text style={styles.presetName}>{preset.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom Colors</Text>
          
          {colorSwatches.map((swatch) => (
            <View key={swatch.key} style={styles.colorItem}>
              <View style={styles.colorInfo}>
                <View style={styles.colorSwatch}>
                  <View style={[styles.colorCircle, { backgroundColor: swatch.value }]} />
                  <View>
                    <Text style={styles.colorName}>{swatch.name}</Text>
                    <Text style={styles.colorDescription}>{swatch.description}</Text>
                  </View>
                </View>
                
                <TextInput
                  style={styles.colorInput}
                  value={swatch.value}
                  onChangeText={(value) => handleColorChange(swatch.key as keyof typeof colors, value)}
                  placeholder="#000000"
                  placeholderTextColor={Colors.gray400}
                  maxLength={7}
                />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preview</Text>
          
          <View style={styles.previewCard}>
            <TouchableOpacity style={[styles.previewButton, { backgroundColor: colors.primary }]}>
              <Text style={styles.previewButtonText}>Primary Button</Text>
            </TouchableOpacity>
            
            <View style={styles.previewRow}>
              <View style={[styles.previewBadge, { backgroundColor: colors.success + '20' }]}>
                <Text style={[styles.previewBadgeText, { color: colors.success }]}>SUCCESS</Text>
              </View>
              <View style={[styles.previewBadge, { backgroundColor: colors.warning + '20' }]}>
                <Text style={[styles.previewBadgeText, { color: colors.warning }]}>WARNING</Text>
              </View>
              <View style={[styles.previewBadge, { backgroundColor: colors.error + '20' }]}>
                <Text style={[styles.previewBadgeText, { color: colors.error }]}>ERROR</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave}>
          <Save size={20} color="white" />
          <Text style={styles.saveButtonText}>Save Configuration</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: Colors.white,
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
    color: Colors.gray800,
  },
  resetButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: Colors.gray800,
    marginBottom: 16,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  presetCard: {
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.gray200,
    minWidth: '22%',
  },
  presetCardSelected: {
    borderColor: Colors.primary,
  },
  presetColor: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 8,
  },
  presetName: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: Colors.gray600,
  },
  colorItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  colorInfo: {
    gap: 12,
  },
  colorSwatch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  colorName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.gray800,
  },
  colorDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.gray500,
  },
  colorInput: {
    backgroundColor: Colors.gray50,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.gray800,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  previewCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.gray200,
    gap: 16,
  },
  previewButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  previewButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.white,
  },
  previewRow: {
    flexDirection: 'row',
    gap: 8,
  },
  previewBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  previewBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  footer: {
    backgroundColor: Colors.white,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.white,
  },
});
