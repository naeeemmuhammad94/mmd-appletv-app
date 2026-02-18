import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';
import { useAuthStore } from '../../store/useAuthStore';
import { RoleCard } from '../../components/auth/RoleCard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation';
import { SafeAreaView } from 'react-native-safe-area-context';

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
        mainGap: rs(64),        // gap-16 -> 64px (Header to Cards)
        headerGroupGap: rs(48), // gap-12 -> 48px (Welcome Group to Select Role)
        welcomeGroupGap: rs(10), // gap-2.5 -> 10px (Logo to Welcome text)
        cardRowGap: rs(36),     // gap-9 -> 36px (Between cards)
    },
    typography: {
        welcomeSize: rs(128),   // text-9xl
        selectRoleSize: rs(96), // text-8xl
        logoSize: rs(96),       // w-24 h-24 -> 96px
    },
} as const;

type Props = NativeStackScreenProps<AuthStackParamList, 'RoleSelect'>;

export default function RoleSelectScreen({ navigation }: Props) {
    const { theme } = useTheme();
    const setRole = useAuthStore(state => state.setRole);

    const handleRoleSelect = async (role: 'student' | 'dojo' | 'admin') => {
        await setRole(role);
        navigation.navigate('Login');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
                    <RoleCard
                        title="Students"
                        Icon={StudentIcon}
                        onPress={() => handleRoleSelect('student')}
                    />
                    <RoleCard
                        title="Dojo Cast"
                        Icon={DojoIcon}
                        onPress={() => handleRoleSelect('dojo')}
                    />
                    <RoleCard
                        title="Admin"
                        Icon={AdminIcon}
                        onPress={() => handleRoleSelect('admin')}
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
        fontWeight: '400', // Tailwind class didn't specify weight for this one, but default for headers usually bold? 
        // Prompt: `font-['SF_Compact']` implies default weight unless specified. 
        // Previous code had 556/Medium. I'll stick to 400 or inherit.
        textAlign: 'center',
    },
    cardsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: SCREEN_THEME.spacing.cardRowGap,
        width: SCREEN_THEME.layout.containerWidth, // Constrain width if needed to wrap, but row implies fitting.
    },
});
