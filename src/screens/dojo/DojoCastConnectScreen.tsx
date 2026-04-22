import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import { rs, wp } from '../../theme/responsive';
import { FocusableCard } from '../../components/ui/FocusableCard';
import { useDojoCastStore } from '../../store/useDojoCastStore';
import { DojoStackParamList } from '../../navigation';
import { useExitConfirmation } from '../../hooks/useExitConfirmation';
import { useDojoCastPlaylist } from '../../hooks/useDojoCastPlaylist';
import { useAuthStore } from '../../store/useAuthStore';
import { selectDojoId } from '../../utils/authHelpers';
import { filterAndSortDecks } from '../../utils/dojoCastFilters';
import FileIcon from '../../../assets/icons/file.svg';

type Nav = NativeStackNavigationProp<DojoStackParamList, 'Connect'>;

const DojoCastConnectScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const setConnectionStatus = useDojoCastStore(s => s.setConnectionStatus);
  const dojoId = useAuthStore(s => selectDojoId(s.user));
  const { data: playlist, isLoading, isError } = useDojoCastPlaylist(dojoId);
  const decks = filterAndSortDecks(playlist?.data?.decks ?? []);

  useExitConfirmation();

  const handleSelectSlides = () => {
    setConnectionStatus('connected');
    navigation.navigate('Setup');
  };

  return (
    <View style={[styles.container, { backgroundColor: '#000000' }]}>
      {/* Title */}
      <Text style={styles.mainTitle}>Dojo Cast</Text>

      {/* Subtitle */}
      <Text style={[styles.subtitle, { color: theme.colors.text }]}>
        Connect Slides
      </Text>

      {/* Description */}
      <Text style={styles.description}>
        Choose the slide presentation you'd like to display on your dojo screen.
        {'\n'}This presentation will be shown during classes, announcements, and
        events.
      </Text>
      <Text style={[styles.description, { marginTop: rs(8) }]}>
        You can change or manage the connected presentation at any time
      </Text>

      {/* Loading indicator */}
      {isLoading && (
        <Text style={[styles.description, { marginTop: rs(16) }]}>
          Loading slides...
        </Text>
      )}

      {/* Available slides count */}
      {decks.length > 0 && (
        <Text style={[styles.description, { marginTop: rs(16) }]}>
          {decks.length} presentation{decks.length !== 1 ? 's' : ''} available
        </Text>
      )}

      {!isLoading && isError && (
        <Text style={[styles.description, { marginTop: rs(16) }]}>
          Couldn't reach server — check connection.
        </Text>
      )}

      {/* Select Google Slides Button */}
      <FocusableCard
        onPress={handleSelectSlides}
        style={styles.selectButton}
        focusedStyle={styles.selectButtonFocused}
        wrapperStyle={{ flex: 0 }}
        scaleOnFocus={true}
      >
        {() => (
          <View style={styles.selectButtonInner}>
            <FileIcon width={rs(28)} height={rs(28)} />
            <Text style={styles.selectButtonText}>Select Slides</Text>
          </View>
        )}
      </FocusableCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(10),
  },
  mainTitle: {
    fontSize: rs(96),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: rs(16),
  },
  subtitle: {
    fontSize: rs(36),
    fontWeight: '600',
    marginBottom: rs(48),
  },
  description: {
    fontSize: rs(26),
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: rs(38),
  },
  selectButton: {
    marginTop: rs(48),
    backgroundColor: '#4A7FD4',
    borderRadius: rs(16),
    paddingVertical: rs(18),
    paddingHorizontal: rs(40),
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  selectButtonFocused: {
    backgroundColor: '#5A8FE4',
    borderColor: '#FFFFFF',
    borderWidth: 3,
  },
  selectButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
  },
  selectButtonText: {
    fontSize: rs(28),
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default DojoCastConnectScreen;
