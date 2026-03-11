import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageSourcePropType,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme';
import { FocusableCard } from './FocusableCard';
import { rs } from '../../theme/responsive';
import PlayButton from '../../../assets/icons/play_button.svg';

interface ProgramCardProps {
  title: string;
  image?: ImageSourcePropType | string;
  progress?: number;
  showPlayButton?: boolean;
  variant?: 'default' | 'text-only';
  onPress: () => void;
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({
  title,
  image,
  progress = 0,
  showPlayButton = true,
  variant = 'default',
  onPress,
  width = rs(380), // Approx w-96
  height = rs(240), // Approx h-64
  style,
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  // Resolve image source
  const imageSource =
    typeof image === 'string'
      ? { uri: image }
      : image
      ? image
      : {
          uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
        };

  return (
    <FocusableCard
      onPress={onPress}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius: rs(10),
          borderWidth: isFocused ? rs(4) : rs(2),
          borderColor: isFocused
            ? theme.colors.primary
            : 'rgba(100,100,100, 0.5)',
        },
        style,
      ]}
    >
      <View
        style={[
          styles.cardContent,
          {
            borderRadius: rs(10),
            borderWidth: isFocused ? rs(4) : 0, // Border only on focus
            borderColor: isFocused ? theme.colors.primary : 'transparent',
            backgroundColor: variant === 'text-only' ? '#1A1D24' : 'black',
          },
        ]}
      >
        {variant === 'text-only' ? (
          <View style={styles.textOnlyContainer}>
            <Text
              style={styles.textOnlyTitle}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {title.toUpperCase()}
            </Text>
          </View>
        ) : (
          /* Default Image Layer */
          <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
            <Image
              source={imageSource}
              style={[StyleSheet.absoluteFill, { borderRadius: rs(8) }]}
              resizeMode="cover"
            />

            {/* Overlay Layer */}
            <View
              style={[
                styles.overlay,
                {
                  backgroundColor: isFocused
                    ? 'rgba(0,0,0,0.1)'
                    : 'rgba(0,0,0,0.4)',
                },
              ]}
            >
              {/* Center Icon */}
              {showPlayButton && (
                <View style={styles.centerIcon}>
                  <PlayButton width={rs(64)} height={rs(64)} />
                </View>
              )}

              {/* Bottom Info */}
              <View style={styles.footer}>
                <View style={styles.textRow}>
                  <Text style={styles.title} numberOfLines={1}>
                    {title}
                  </Text>
                  <Text style={styles.percentage}>{Math.round(progress)}%</Text>
                </View>
                {/* Progress Bar */}
                <View
                  style={[
                    styles.progressBarTrack,
                    { backgroundColor: theme.colors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(100, Math.max(0, progress))}%`,
                        backgroundColor: theme.colors.primary,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </FocusableCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: rs(24),
    overflow: 'hidden',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'space-between',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: rs(16),
  },
  centerIcon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconCircle: {
    width: rs(64),
    height: rs(64),
    borderRadius: rs(32),
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: rs(2),
    borderColor: '#3B82F6', // Blue-500
  },
  footer: {
    width: '100%',
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: rs(8),
  },
  title: {
    fontSize: rs(28),
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    maxWidth: '80%',
  },
  percentage: {
    fontSize: rs(20),
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.8)',
  },
  progressBarTrack: {
    height: rs(6),
    width: '100%',
    borderRadius: rs(3),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: rs(3),
  },
  cardContent: {
    flex: 1,
    overflow: 'hidden', // Strictly clip content/image
    backgroundColor: 'black', // fallback
  },
  textOnlyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: rs(16),
  },
  textOnlyTitle: {
    fontSize: rs(32),
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});

export default ProgramCard;
