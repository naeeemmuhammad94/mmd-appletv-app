import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';
import { useAuthStore } from '../../store/useAuthStore';
import { RoleCard } from '../../components/auth/RoleCard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useExitConfirmation } from '../../hooks/useExitConfirmation';

// Assets
import Logo from '../../../assets/icons/logo.svg';
import StudentIcon from '../../../assets/images/role_student.svg';
import DojoIcon from '../../../assets/images/role_dojocast.svg';
import AdminIcon from '../../../assets/images/role_admin.svg';

// ─── Figma Inspector Values ──────────────────────────────────────
const SCREEN_THEME = {
  layout: {
    containerWidth: rs(1693),
    headerWidth: rs(699),
  },
  spacing: {
    mainGap: rs(64),
    headerGroupGap: rs(48),
    welcomeGroupGap: rs(10),
    cardRowGap: rs(36),
  },
  typography: {
    welcomeSize: rs(128),
    selectRoleSize: rs(96),
    logoSize: rs(96),
  },
} as const;

type Props = NativeStackScreenProps<AuthStackParamList, 'RoleSelect'>;

export default function RoleSelectScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const setRole = useAuthStore(state => state.setRole);

  useExitConfirmation();

  const handleRoleSelect = async (role: 'student' | 'dojo' | 'admin') => {
    try {
      await setRole(role);
    } catch (error) {
      console.warn('AsyncStorage error caught in RoleSelectScreen:', error);
    } finally {
      navigation.navigate('Login');
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.bgGradient} />

      <View style={styles.content}>
        {/* ── Header Group ── */}
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <View style={styles.logoContainer}>
              <Logo
                width={SCREEN_THEME.typography.logoSize}
                height={SCREEN_THEME.typography.logoSize}
                fill={theme.colors.text}
              />
            </View>
            <Text style={[styles.welcomeText, { color: theme.colors.text }]}>
              Welcome!
            </Text>
          </View>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Select Role
          </Text>
        </View>

        {/* ── Card Row ── */}
        <View style={styles.cardsContainer}>
          {/* Student — fully enabled */}
          <RoleCard
            title="Students"
            Icon={StudentIcon}
            onPress={() => handleRoleSelect('student')}
          />
          {/* Dojo Cast — enabled */}
          <RoleCard
            title="Dojo Cast"
            Icon={DojoIcon}
            onPress={() => handleRoleSelect('dojo')}
          />
          {/* Admin — disabled (Coming Soon) */}
          <RoleCard
            title="Admin"
            Icon={AdminIcon}
            onPress={() => handleRoleSelect('admin')}
            disabled
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    width: SCREEN_THEME.layout.headerWidth,
    marginBottom: SCREEN_THEME.spacing.mainGap,
    gap: SCREEN_THEME.spacing.headerGroupGap,
  },
  welcomeSection: {
    alignItems: 'center',
    gap: SCREEN_THEME.spacing.welcomeGroupGap,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    fontFamily: 'SF Pro Display',
    fontSize: SCREEN_THEME.typography.welcomeSize,
    fontWeight: '700',
    textAlign: 'center',
  },
  sectionTitle: {
    fontFamily: 'SF Compact',
    fontSize: SCREEN_THEME.typography.selectRoleSize,
    fontWeight: '400',
    textAlign: 'center',
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SCREEN_THEME.spacing.cardRowGap,
    width: SCREEN_THEME.layout.containerWidth,
  },
});
