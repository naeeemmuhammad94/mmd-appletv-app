import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';

interface HomeHeaderProps {
    onSearchPress?: () => void;
    onTabChange?: (tab: 'Curriculum' | 'Announcements') => void;
    onLogout?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
    onSearchPress,
    onTabChange,
    onLogout
}) => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<'Curriculum' | 'Announcements'>('Curriculum');
    const [focusedTab, setFocusedTab] = useState<string | null>(null);
    const [searchFocused, setSearchFocused] = useState(false);

    const handleTabPress = (tab: 'Curriculum' | 'Announcements') => {
        setActiveTab(tab);
        if (onTabChange) {
            onTabChange(tab);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                {/* Search Button */}
                <TouchableOpacity
                    onPress={onSearchPress}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    style={[
                        styles.searchButton,
                        searchFocused && {
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            borderColor: theme.colors.primary,
                            borderWidth: 2
                        }
                    ]}
                >
                    <Icon
                        name="search"
                        size={rs(32)}
                        color={searchFocused ? theme.colors.primary : 'white'}
                    />
                </TouchableOpacity>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity
                        onPress={() => handleTabPress('Curriculum')}
                        onFocus={() => setFocusedTab('Curriculum')}
                        onBlur={() => setFocusedTab(null)}
                        style={[
                            styles.tab,
                            activeTab === 'Curriculum' && { backgroundColor: theme.colors.primary },
                            focusedTab === 'Curriculum' && styles.focusedTab
                        ]}
                    >
                        <Text style={[
                            styles.tabText,
                            activeTab === 'Curriculum' ? styles.activeTabText : styles.inactiveTabText
                        ]}>
                            Curriculum
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleTabPress('Announcements')}
                        onFocus={() => setFocusedTab('Announcements')}
                        onBlur={() => setFocusedTab(null)}
                        style={[
                            styles.tab,
                            activeTab === 'Announcements' && { backgroundColor: theme.colors.primary },
                            focusedTab === 'Announcements' && styles.focusedTab
                        ]}
                    >
                        <Text style={[
                            styles.tabText,
                            activeTab === 'Announcements' ? styles.activeTabText : styles.inactiveTabText
                        ]}>
                            Announcements
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    onPress={onLogout}
                    onFocus={() => setFocusedTab('Logout')}
                    onBlur={() => setFocusedTab(null)}
                    style={[
                        styles.logoutButton,
                        focusedTab === 'Logout' && styles.focusedLogout
                    ]}
                >
                    <Icon name="power-settings-new" size={rs(32)} color={theme.colors.text} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingTop: rs(30),
        paddingHorizontal: rs(60),
        marginBottom: rs(20),
        zIndex: 10,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchButton: {
        width: rs(60),
        height: rs(60),
        borderRadius: rs(30),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: rs(40),
        borderWidth: 2,
        borderColor: 'transparent',
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: rs(40),
        padding: rs(4),
    },
    tab: {
        paddingVertical: rs(10),
        paddingHorizontal: rs(30),
        borderRadius: rs(30),
        borderWidth: 2,
        borderColor: 'transparent',
    },
    focusedTab: {
        borderColor: 'white',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    tabText: {
        fontSize: rs(20),
        fontWeight: '600',
    },
    activeTabText: {
        color: 'white',
        fontWeight: 'bold',
    },
    inactiveTabText: {
        color: 'rgba(255,255,255,0.7)',
    },
    logoutButton: {
        marginLeft: 'auto', // Push to right
        width: rs(60),
        height: rs(60),
        borderRadius: rs(30),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    focusedLogout: {
        borderColor: 'white',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
});
