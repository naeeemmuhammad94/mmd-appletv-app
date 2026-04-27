import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentStackParamList } from '../../navigation';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';
import { FocusableCard } from '../../components/ui/FocusableCard';

type ImageRouteProp = RouteProp<StudentStackParamList, 'ImageViewer'>;
type ImageNav = NativeStackNavigationProp<StudentStackParamList, 'ImageViewer'>;

const ImageViewerScreen: React.FC = () => {
  const navigation = useNavigation<ImageNav>();
  const route = useRoute<ImageRouteProp>();
  const { url, title } = route.params;
  const { theme } = useTheme();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <FocusableCard
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            focusedStyle={styles.backBtnFocused}
            wrapperStyle={{ flex: 0 }}
            scaleOnFocus
          >
            {() => <Text style={styles.backBtnText}>Back</Text>}
          </FocusableCard>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.topBar}>
        <FocusableCard
          onPress={() => navigation.goBack()}
          style={styles.topBackBtn}
          focusedStyle={styles.topBackBtnFocused}
          wrapperStyle={{ flex: 0 }}
          scaleOnFocus
        >
          {() => <Text style={styles.topBackBtnText}>← Back</Text>}
        </FocusableCard>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.imageContainer}>
        {loading && (
          <View style={styles.center} pointerEvents="none">
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}
        <Image
          source={{ uri: url }}
          style={styles.image}
          resizeMode="contain"
          onLoad={() => setLoading(false)}
          onError={() => {
            setError("Couldn't load this image.");
            setLoading(false);
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rs(48),
    paddingVertical: rs(20),
    gap: rs(24),
  },
  topBackBtn: {
    paddingHorizontal: rs(20),
    paddingVertical: rs(10),
    borderRadius: rs(8),
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  topBackBtnFocused: { backgroundColor: 'white' },
  topBackBtnText: { color: 'white', fontSize: rs(24), fontWeight: '600' },
  title: { color: 'white', fontSize: rs(28), fontWeight: '600', flex: 1 },

  imageContainer: { flex: 1, backgroundColor: 'black' },
  image: { flex: 1, width: '100%', height: '100%' },

  center: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    gap: rs(20),
  },
  errorText: { color: 'white', fontSize: rs(28), textAlign: 'center', paddingHorizontal: rs(80) },
  backBtn: {
    paddingHorizontal: rs(40),
    paddingVertical: rs(16),
    borderRadius: rs(10),
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  backBtnFocused: { backgroundColor: 'white' },
  backBtnText: { color: 'white', fontSize: rs(28), fontWeight: '700' },
});

export default ImageViewerScreen;
