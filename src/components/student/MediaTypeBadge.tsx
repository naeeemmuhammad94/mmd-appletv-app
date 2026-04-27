import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { rs } from '../../theme/responsive';
import type { MediaType } from '../../utils/getMediaType';

interface MediaTypeBadgeProps {
  type: MediaType;
  style?: StyleProp<ViewStyle>;
}

const LABELS: Partial<Record<MediaType, string>> = {
  pdf: 'PDF',
  image: 'IMG',
};

export const MediaTypeBadge: React.FC<MediaTypeBadgeProps> = ({
  type,
  style,
}) => {
  const label = LABELS[type];
  if (!label) return null;
  return (
    <View style={[styles.badge, style]} pointerEvents="none">
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: rs(12),
    right: rs(12),
    paddingHorizontal: rs(12),
    paddingVertical: rs(4),
    borderRadius: rs(6),
    backgroundColor: 'rgba(15, 23, 42, 0.75)', // navy with transparency
    borderWidth: rs(1),
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  label: {
    color: 'white',
    fontSize: rs(18),
    fontWeight: '700',
    letterSpacing: rs(1),
  },
});
