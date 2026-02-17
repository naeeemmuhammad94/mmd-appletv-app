import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FocusableCard } from '../ui/FocusableCard';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';
import { SvgProps } from 'react-native-svg';

// ─── Figma Inspector Values ──────────────────────────────────────
const CARD_THEME = {
    layout: {
        width: rs(539),
        height: rs(476),
        borderRadius: rs(30),
        borderWidthDefault: rs(1), // outline-1
        borderWidthFocused: rs(8), // outline-8
    },
    icon: {
        size: rs(384), // w-96 h-96 -> 384px (approx, based on Tailwind usually 1rem=4px, 96*4=384) 
        // BUT the design shows image at standard size. 
        // Wait, Tailwind `w-96` = 24rem = 384px.
        // Admin img: `w-96 h-96`. 
        // Dojo Cast img: `w-[487px] h-[487px]`.
        // Students img: `w-96 h-96`.
        // I will stick to a reasonable consistent size or allow override? 
        // Let's use 384px as base.
    },
    typography: {
        labelSize: rs(60), // text-6xl -> 3.75rem = 60px
    },
    colors: {
        cardFill: '#020617', // bg-slate-950
        borderDefault: '#FFFFFF', // outline-white
        borderFocused: '#93C5FD', // outline-blue-300
        text: '#F8FAFC', // text-Backgrounds-Primary (assuming light)
    },
} as const;

interface RoleCardProps {
    title: string;
    Icon: React.FC<SvgProps>;
    onPress: () => void;
    imageStyle?: any; // To handle the specific positioning/sizing differences if strictly needed?
    // For now, I'll keep it consistent.
}

export const RoleCard: React.FC<RoleCardProps> = ({
    title,
    Icon,
    onPress,
}) => {
    const { theme } = useTheme();

    return (
        <FocusableCard
            onPress={onPress}
            style={[
                styles.card,
                {
                    backgroundColor: CARD_THEME.colors.cardFill,
                    borderColor: CARD_THEME.colors.borderDefault,
                    borderWidth: CARD_THEME.layout.borderWidthDefault,
                },
            ]}
            focusedStyle={{
                borderColor: CARD_THEME.colors.borderFocused,
                borderWidth: CARD_THEME.layout.borderWidthFocused,
                backgroundColor: CARD_THEME.colors.cardFill, // Ensure bg stays dark
                zIndex: 10,
            }}
            scaleOnFocus={true}
        >
            <View style={styles.content}>
                {/* Images in design have absolute positioning or specific layouts.
                    For a reusable component, centering is safest unless specified.
                    The design shows images partially cropped or positioned.
                    Refactoring for scalability -> Center standard layout.
                */}
                <View style={styles.iconContainer}>
                    <Icon
                        width={CARD_THEME.icon.size}
                        height={CARD_THEME.icon.size}
                    />
                </View>
                <Text
                    style={[
                        styles.title,
                        {
                            color: CARD_THEME.colors.text,
                            fontSize: CARD_THEME.typography.labelSize,
                        },
                    ]}
                >
                    {title}
                </Text>
            </View>
        </FocusableCard>
    );
};

const styles = StyleSheet.create({
    card: {
        width: CARD_THEME.layout.width,
        height: CARD_THEME.layout.height,
        borderRadius: CARD_THEME.layout.borderRadius,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden', // Ensure rounded corners clip content
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        width: '100%',
    },
    iconContainer: {
        marginBottom: rs(20), // Spacing between icon and text
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontFamily: 'SF Compact', // From design: font-['SF_Compact']
        fontWeight: '400', // Default
        textAlign: 'center',
        position: 'absolute', // Design has text positioned absolutely at bottom?
        // "top-[371px]" etc.
        // For scalable component, flex column is better.
        // But to match design exactly:
        // Card height 476. Text top ~375.
        // 375/476 is lower part.
        // I will use marginBottom or just standard flow.
        bottom: rs(40),
    },
});
