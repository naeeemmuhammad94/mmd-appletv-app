import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';
import SearchIcon from '../../../assets/icons/search-icon.svg';

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
                {/* Main Navigation Pill */}
                <View style={styles.pillContainer}>
                    {/* Search Button */}
                    <TouchableOpacity
                        onPress={onSearchPress}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        style={[
                            styles.searchButton,
                            searchFocused && styles.focusedItem
                        ]}
                    >
                        <SearchIcon
                            width={rs(24)}
                            height={rs(24)}
                            color={searchFocused ? theme.colors.background : 'white'}
                        />
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Tabs */}
                    <TouchableOpacity
                        onPress={() => handleTabPress('Curriculum')}
                        onFocus={() => setFocusedTab('Curriculum')}
                        onBlur={() => setFocusedTab(null)}
                        style={[
                            styles.tab,
                            activeTab === 'Curriculum' && styles.activeTab,
                            focusedTab === 'Curriculum' && styles.focusedItem
                        ]}
                    >
                        <Text style={[
                            styles.tabText,
                            activeTab === 'Curriculum' ? styles.activeTabText : styles.inactiveTabText,
                            focusedTab === 'Curriculum' && { color: theme.colors.background }
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
                            activeTab === 'Announcements' && styles.activeTab,
                            focusedTab === 'Announcements' && styles.focusedItem
                        ]}
                    >
                        <Text style={[
                            styles.tabText,
                            activeTab === 'Announcements' ? styles.activeTabText : styles.inactiveTabText,
                            focusedTab === 'Announcements' && { color: theme.colors.background }
                        ]}>
                            Announcements
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Logout Button (Right aligned) */}
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
        paddingTop: rs(40),
        paddingHorizontal: rs(60),
        marginBottom: rs(40),
        zIndex: 10,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Center content
        position: 'relative', // For absolute positioning of logout
        height: rs(80),
    },
    pillContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(20, 20, 20, 0.6)', // Dark glass
        borderRadius: rs(40),
        padding: rs(6),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignSelf: 'center', // Center the pill itself
    },
    divider: {
        width: 1,
        height: rs(24),
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginHorizontal: rs(10),
    },
    searchButton: {
        width: rs(50),
        height: rs(50),
        borderRadius: rs(25),
        justifyContent: 'center',
        alignItems: 'center',
    },
    tab: {
        paddingVertical: rs(12),
        paddingHorizontal: rs(32),
        borderRadius: rs(30),
    },
    activeTab: {
        backgroundColor: '#3B82F6', // Explicit color for active state
    },
    focusedItem: {
        backgroundColor: 'white',
    },
    tabText: {
        fontSize: rs(22),
        fontWeight: '500',
    },
    activeTabText: {
        color: 'white',
        fontWeight: 'bold',
    },
    inactiveTabText: {
        color: 'rgba(255,255,255,0.6)',
    },
    logoutButton: {
        position: 'absolute',
        right: 0,
        width: rs(60),
        height: rs(60),
        borderRadius: rs(30),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    focusedLogout: {
        backgroundColor: 'white',
        transform: [{ scale: 1.1 }],
    },
});
