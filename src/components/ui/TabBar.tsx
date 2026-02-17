/**
 * TabBar – Top navigation tabs for the student area
 * Matches Figma pill-style: 🔍, Curriculum, Announcements
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';

export interface TabItem {
    key: string;
    label: string;
    icon?: string; // MaterialIcons name
}

interface TabBarProps {
    tabs: TabItem[];
    activeTab: string;
    onTabPress: (key: string) => void;
}

const TabButton: React.FC<{
    tab: TabItem;
    isActive: boolean;
    onPress: () => void;
}> = ({ tab, isActive, onPress }) => {
    const { theme } = useTheme();
    const [scale] = useState(new Animated.Value(1));

    const handleFocus = () => {
        Animated.spring(scale, {
            toValue: 1.08,
            friction: 3,
            useNativeDriver: true,
        }).start();
    };

    const handleBlur = () => {
        Animated.spring(scale, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Pressable
            onFocus={handleFocus}
            onBlur={handleBlur}
            onPress={onPress}
            style={({ focused }) => [
                styles.tab,
                {
                    backgroundColor: isActive
                        ? theme.colors.primary
                        : theme.colors.surface,
                    borderColor: focused
                        ? theme.colors.focusBorder
                        : 'transparent',
                },
            ]}
        >
            <Animated.View
                style={[styles.tabInner, { transform: [{ scale }] }]}
            >
                {tab.icon ? (
                    <Icon
                        name={tab.icon}
                        size={rs(28)}
                        color={
                            isActive
                                ? '#FFFFFF'
                                : theme.colors.textSecondary
                        }
                    />
                ) : (
                    <Text
                        style={[
                            styles.tabLabel,
                            {
                                color: isActive
                                    ? '#FFFFFF'
                                    : theme.colors.textSecondary,
                                fontSize: theme.fontSize.body,
                            },
                        ]}
                    >
                        {tab.label}
                    </Text>
                )}
            </Animated.View>
        </Pressable>
    );
};

export const TabBar: React.FC<TabBarProps> = ({
    tabs,
    activeTab,
    onTabPress,
}) => {
    const { theme } = useTheme();

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
        >
            {tabs.map(tab => (
                <TabButton
                    key={tab.key}
                    tab={tab}
                    isActive={activeTab === tab.key}
                    onPress={() => onTabPress(tab.key)}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(12),
        paddingVertical: rs(16),
        paddingHorizontal: rs(60),
    },
    tab: {
        borderRadius: rs(24),
        borderWidth: 2,
        paddingHorizontal: rs(24),
        paddingVertical: rs(10),
    },
    tabInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: rs(8),
    },
    tabLabel: {
        fontWeight: '600',
    },
});
