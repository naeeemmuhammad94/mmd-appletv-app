import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { rs } from '../../theme/responsive';
import { FocusableCard } from '../../components/ui/FocusableCard';
import { useDojoCastStore } from '../../store/useDojoCastStore';
import { DUMMY_SLIDES } from '../../data/dojoCastData';
import { DojoStackParamList } from '../../navigation';

type Nav = NativeStackNavigationProp<DojoStackParamList, 'Error'>;

const DojoCastErrorScreen = () => {
  const navigation = useNavigation<Nav>();
  const { setConnectionStatus, currentSlideIndex, reset } = useDojoCastStore();
  const [dots, setDots] = useState('');

  const currentSlide = DUMMY_SLIDES[currentSlideIndex] || DUMMY_SLIDES[0];

  // Animate reconnect dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 12 ? '' : prev + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const handleExitSetup = () => {
    reset();
    navigation.popToTop();
  };

  const handleChangeProgram = () => {
    setConnectionStatus('connected');
    navigation.navigate('Setup');
  };

  const handleRetryPlay = () => {
    setConnectionStatus('connected');
    navigation.navigate('Slideshow');
  };

  return (
    <View style={styles.container}>
      {/* Background — last visible slide, frozen */}
      <ImageBackground
        source={{ uri: currentSlide.imageUrl }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
      </ImageBackground>

      {/* Error content */}
      <View style={styles.content}>
        <Text style={styles.title}>Dojo Program</Text>
        <Text style={styles.title}>Interrupted</Text>
        <Text style={styles.reconnectText}>Trying to reconnect{dots}</Text>

        {/* Action buttons */}
        <View style={styles.buttonRow}>
          <FocusableCard
            onPress={handleExitSetup}
            style={[styles.actionButton, styles.exitButton]}
            focusedStyle={styles.exitButtonFocused}
            scaleOnFocus={true}
          >
            {() => <Text style={styles.actionButtonText}>Exit Dojo Setup</Text>}
          </FocusableCard>

          <FocusableCard
            onPress={handleChangeProgram}
            style={[styles.actionButton, styles.changeButton]}
            focusedStyle={styles.changeButtonFocused}
            scaleOnFocus={true}
          >
            {() => <Text style={styles.actionButtonText}>Change Program</Text>}
          </FocusableCard>
        </View>
      </View>

      {/* Bottom Controls Bar (same as slideshow but with play icon) */}
      <View style={styles.controlsBar}>
        <View style={styles.controlsCenter}>
          {/* Previous */}
          <View style={styles.controlButton}>
            <Text style={styles.controlIcon}>{'\u23EE'}</Text>
          </View>

          {/* Play */}
          <FocusableCard
            onPress={handleRetryPlay}
            style={styles.playButton}
            focusedStyle={styles.playButtonFocused}
            scaleOnFocus={true}
          >
            {() => <Text style={styles.playIcon}>{'\u25B6'}</Text>}
          </FocusableCard>

          {/* Next */}
          <View style={styles.controlButton}>
            <Text style={styles.controlIcon}>{'\u23ED'}</Text>
          </View>
        </View>

        {/* Dojo logo */}
        <View style={styles.logoButton}>
          <Text style={styles.logoText}>{'\u2E4E'}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: rs(120),
  },
  title: {
    fontSize: rs(72),
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: rs(88),
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: rs(3) },
    textShadowRadius: rs(8),
  },
  reconnectText: {
    fontSize: rs(32),
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: rs(24),
    marginBottom: rs(48),
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: rs(2) },
    textShadowRadius: rs(4),
    minWidth: rs(500),
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: rs(24),
  },
  actionButton: {
    paddingVertical: rs(20),
    paddingHorizontal: rs(40),
    borderRadius: rs(14),
    borderWidth: 2,
  },
  exitButton: {
    backgroundColor: '#4A7FD4',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  exitButtonFocused: {
    backgroundColor: '#5A8FE4',
    borderColor: '#FFFFFF',
    borderWidth: 3,
  },
  changeButton: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  changeButtonFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: '#FFFFFF',
    borderWidth: 3,
  },
  actionButtonText: {
    fontSize: rs(26),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  controlsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: rs(120),
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rs(48),
  },
  controlsCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(32),
  },
  controlButton: {
    width: rs(64),
    height: rs(64),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: rs(32),
  },
  controlIcon: {
    fontSize: rs(36),
    color: 'rgba(255, 255, 255, 0.6)',
  },
  playButton: {
    width: rs(80),
    height: rs(80),
    borderRadius: rs(40),
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonFocused: {
    backgroundColor: '#5A9FF2',
    borderColor: '#FFFFFF',
    borderWidth: 3,
  },
  playIcon: {
    fontSize: rs(36),
    color: '#FFFFFF',
    marginLeft: rs(4),
  },
  logoButton: {
    position: 'absolute',
    right: rs(48),
    width: rs(56),
    height: rs(56),
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: rs(40),
    color: '#FFFFFF',
    fontWeight: '200',
  },
});

export default DojoCastErrorScreen;
