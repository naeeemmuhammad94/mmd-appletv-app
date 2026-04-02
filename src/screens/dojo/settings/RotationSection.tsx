import React from 'react';
import { View, Text, StyleSheet, TVFocusGuideView } from 'react-native';
import { rs } from '../../../theme/responsive';
import { FocusableCard } from '../../../components/ui/FocusableCard';
import { useDojoSettingsStore } from '../../../store/useDojoSettingsStore';

type RotationValue = 0 | 90 | 180 | 270;

const ROTATION_BUTTONS: Array<{ label: string; value: RotationValue }> = [
  { label: 'Rotate 90\u00b0 Left', value: 270 },
  { label: 'Rotate 90\u00b0 Right', value: 90 },
  { label: 'Rotate 180\u00b0', value: 180 },
  { label: 'Reset', value: 0 },
];

const RotationSection = () => {
  const { rotation, setRotation } = useDojoSettingsStore();

  return (
    <TVFocusGuideView autoFocus style={styles.container}>
      <Text style={styles.title}>Rotation Section</Text>

      {/* Info card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Rotate Slides</Text>
        <Text style={styles.infoSubtitle}>
          Adjust your slide orientation to match your screen mounting position
        </Text>
      </View>

      {/* 2x2 grid */}
      <View style={styles.grid}>
        {ROTATION_BUTTONS.map(btn => (
          <FocusableCard
            key={btn.value}
            onPress={() => setRotation(btn.value)}
            style={[
              styles.rotateButton,
              rotation === btn.value && styles.rotateButtonActive,
            ]}
            focusedStyle={styles.rotateButtonFocused}
            wrapperStyle={styles.buttonWrapper}
            scaleOnFocus={false}
          >
            {() => <Text style={styles.rotateButtonText}>{btn.label}</Text>}
          </FocusableCard>
        ))}
      </View>

      <Text style={styles.helperText}>
        Changes apply immediately to the slideshow display.
      </Text>
    </TVFocusGuideView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: rs(40),
  },
  title: {
    fontSize: rs(48),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: rs(32),
  },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: rs(12),
    padding: rs(28),
    marginBottom: rs(36),
  },
  infoTitle: {
    fontSize: rs(30),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: rs(10),
  },
  infoSubtitle: {
    fontSize: rs(24),
    color: '#9CA3AF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: rs(16),
    marginBottom: rs(24),
  },
  buttonWrapper: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotateButton: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: rs(12),
    paddingVertical: rs(28),
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotateButtonActive: {
    backgroundColor: '#4A90E2',
  },
  rotateButtonFocused: {
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderRadius: rs(12),
  },
  rotateButtonText: {
    fontSize: rs(28),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  helperText: {
    fontSize: rs(22),
    color: '#9CA3AF',
  },
});

export default RotationSection;
