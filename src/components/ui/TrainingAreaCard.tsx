import React, { useState, forwardRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageSourcePropType,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FocusableCard } from './FocusableCard';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';

interface TrainingAreaCardProps {
  title: string;
  image?: ImageSourcePropType | string;
  iconName?: string;
  variant?: 'default' | 'text-only';
  onPress: () => void;
  width?: number;
  height?: number;
  /** tvOS spatial navigation — passed through to the inner FocusableCard. */
  nextFocusUp?: any;
}

export const TrainingAreaCard = forwardRef<any, TrainingAreaCardProps>(
  (
    {
      title,
      image,
      iconName = 'fitness-center',
      variant = 'default',
      onPress,
      width = rs(250),
      height = rs(291),
      nextFocusUp,
    },
    ref,
  ) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    // Resolve image source
    const imageSource = typeof image === 'string' ? { uri: image } : image;

    return (
      <FocusableCard
        ref={ref}
        nextFocusUp={nextFocusUp}
        onPress={onPress}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={[
          styles.card,
          {
            width,
            height,
            borderRadius: rs(10),
            // Reserve a 4px border slot — see ProgramCard for the rationale.
            borderWidth: rs(4),
            borderColor: isFocused ? theme.colors.primary : 'transparent',
            backgroundColor: 'transparent', // Handler by inner
          },
        ]}
      >
        <View
          style={[
            styles.cardContent,
            {
              borderRadius: rs(10),
              backgroundColor:
                variant === 'text-only'
                  ? '#1A1D24'
                  : theme.colors.surfaceVariant,
            },
          ]}
        >
          {variant === 'text-only' ? (
            // When a bundled thumbnail is provided, the image itself
            // conveys the training-area name — show it fully contained so
            // the whole image is visible without cropping. Training areas
            // without a mapped image fall back to the original solid dark
            // card with the centered title.
            image ? (
              // `width/height: '100%'` alongside `flex: 1` is required —
              // RN tvOS's native Image view otherwise renders at intrinsic
              // size, leaving `contain` clipped by the parent's overflow
              // instead of fitting inside the card. Pattern lifted from
              // ImageViewerScreen which uses `contain` successfully.
              <View style={{ flex: 1 }}>
                <Image
                  source={imageSource}
                  style={{
                    flex: 1,
                    width: '100%',
                    height: '100%',
                    borderRadius: rs(8),
                  }}
                  resizeMode="contain"
                />
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    styles.textOnlyImageOverlay,
                    {
                      backgroundColor: isFocused
                        ? 'rgba(0,0,0,0.1)'
                        : 'rgba(0,0,0,0.4)',
                    },
                  ]}
                >
                  <Text
                    style={styles.textOnlyImageTitle}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {title}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.textOnlyContainer}>
                <Text
                  style={styles.textOnlyTitle}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {title.toUpperCase()}
                </Text>
              </View>
            )
          ) : imageSource ? (
            <View style={{ flex: 1, backgroundColor: theme.colors.surface }}>
              <Image
                source={imageSource}
                style={[StyleSheet.absoluteFill, { borderRadius: rs(8) }]}
                resizeMode="cover"
              />
              <View
                style={[
                  styles.overlay,
                  {
                    backgroundColor: isFocused
                      ? 'rgba(0,0,0,0)'
                      : 'rgba(0,0,0,0.3)',
                  },
                ]}
              >
                {/* Title at bottom */}
                <Text style={styles.title}>{title}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.fallbackContainer}>
              <Icon
                name={iconName}
                size={rs(64)}
                color={theme.colors.textSecondary}
              />
              <Text style={[styles.title, { textAlign: 'center' }]}>
                {title}
              </Text>
            </View>
          )}
        </View>
      </FocusableCard>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    marginRight: rs(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: rs(16),
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: rs(16),
    gap: rs(16),
  },
  title: {
    fontSize: rs(32),
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'SF Pro Display',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardContent: {
    flex: 1,
    overflow: 'hidden',
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
  textOnlyImageOverlay: {
    justifyContent: 'flex-end',
    padding: rs(16),
    borderRadius: rs(8),
  },
  textOnlyImageTitle: {
    fontSize: rs(28),
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

export default TrainingAreaCard;
