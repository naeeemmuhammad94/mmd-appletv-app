import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';
import SearchIcon from '../../../assets/icons/search-icon.svg';

interface HomeHeaderProps {
    onSearchPress?: () => void;
    onTabChange: (tab: 'Curriculum' | 'Announcements' | 'Search') => void;
    onLogout: () => void;
    activeTab?: 'Curriculum' | 'Announcements' | 'Search'; // Make it controllable
    isSearchExpanded?: boolean;
    onSearchToggle?: () => void;
    searchQuery?: string;
    onSearchQueryChange?: (text: string) => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
    onSearchPress,
    onTabChange,
    onLogout,
    activeTab = 'Curriculum',
    isSearchExpanded = false,
    onSearchToggle,
    searchQuery = '',
    onSearchQueryChange,
}) => {
    const { theme } = useTheme();

    // Local state for focus tracking only
    const [focusedTab, setFocusedTab] = React.useState<'Curriculum' | 'Announcements' | 'SearchInput' | null>(null);
    const [searchFocused, setSearchFocused] = React.useState(false);

    const searchInputRef = useRef<TextInput>(null);

    const handleSearchPress = () => {
        // When search is already expanded, do NOT toggle it off.
        // The user might accidentally trigger this when the tvOS keyboard
        // sends a Select event that propagates back to the search button.
        if (isSearchExpanded) {
            // Focus the text input instead of toggling off
            searchInputRef.current?.focus();
            return;
        }
        if (onSearchToggle) {
            onSearchToggle();
        } else {
            onTabChange('Search');
            onSearchPress?.();
        }
    };

    const handleTabPress = (tab: 'Curriculum' | 'Announcements') => {
        onTabChange(tab);
    };

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                {/* Main Navigation Pill */}
                <View style={[
                    styles.pillContainer,
                    isSearchExpanded && styles.pillContainerExpanded
                ]}>
                    {/* Search Button */}
                    <TouchableOpacity
                        onPress={handleSearchPress}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        style={[
                            styles.searchButton,
                            (searchFocused || activeTab === 'Search') && styles.focusedSearch // Apply style if focused OR active
                        ]}
                    >
                        <SearchIcon
                            width={rs(24)}
                            height={rs(24)}
                            color={'white'} // Always white
                        />
                    </TouchableOpacity>

                    {isSearchExpanded ? (
                        /* Expanded Search Input - UNCONTROLLED to prevent tvOS keyboard dismissal */
                        <TextInput
                            ref={searchInputRef}
                            style={[
                                styles.headerInput,
                                focusedTab === 'SearchInput' && styles.headerInputFocused
                            ]}
                            defaultValue={searchQuery}
                            onSubmitEditing={(e) => onSearchQueryChange?.(e.nativeEvent.text)}
                            onEndEditing={(e) => onSearchQueryChange?.(e.nativeEvent.text)}
                            placeholder="Search program"
                            placeholderTextColor={focusedTab === 'SearchInput' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)'}
                            onFocus={() => setFocusedTab('SearchInput')}
                            onBlur={() => setFocusedTab(null)}
                            blurOnSubmit={false}
                            returnKeyType="search"
                        />
                    ) : (
                        /* Normal Tabs */
                        <>
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
                                    focusedTab === 'Curriculum' && activeTab !== 'Curriculum' && styles.focusedItem, // Only apply white bg if NOT active
                                    focusedTab === 'Curriculum' && activeTab === 'Curriculum' && styles.activeFocusedTab // Apply border if active AND focused
                                ]}
                            >
                                <Text style={[
                                    styles.tabText,
                                    activeTab === 'Curriculum' ? styles.activeTabText : styles.inactiveTabText,
                                    focusedTab === 'Curriculum' && activeTab !== 'Curriculum' && { color: theme.colors.background } // Only change text color if NOT active
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
                                    focusedTab === 'Announcements' && activeTab !== 'Announcements' && styles.focusedItem,
                                    focusedTab === 'Announcements' && activeTab === 'Announcements' && styles.activeFocusedTab
                                ]}
                            >
                                <Text style={[
                                    styles.tabText,
                                    activeTab === 'Announcements' ? styles.activeTabText : styles.inactiveTabText,
                                    focusedTab === 'Announcements' && activeTab !== 'Announcements' && { color: theme.colors.background }
                                ]}>
                                    Announcements
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
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
        borderRadius: rs(50),
        paddingVertical: rs(10),
        paddingHorizontal: rs(12),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignSelf: 'center',
        minWidth: rs(600),
        justifyContent: 'space-between',
    },
    pillContainerExpanded: {
        justifyContent: 'flex-start', // Align left when expanded
        paddingRight: rs(20),
    },
    divider: {
        width: 1,
        height: rs(32),
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginHorizontal: rs(20),
    },
    searchButton: {
        width: rs(50),
        height: rs(50),
        borderRadius: rs(25),
        justifyContent: 'center',
        alignItems: 'center',
    },
    focusedSearch: {
        borderWidth: 3,
        borderColor: 'white',
        backgroundColor: 'rgba(255,255,255,0.1)',
        transform: [{ scale: 1.05 }],
    },
    headerInput: {
        flex: 1,
        marginLeft: rs(20),
        paddingHorizontal: rs(16),
        color: 'white',
        fontSize: rs(24),
        fontFamily: 'SF Pro Display',
        height: rs(60), // Natively better height for TV
        paddingVertical: 0,
        borderRadius: rs(30),
    },
    headerInputFocused: {
        color: 'black',
    },
    tab: {
        paddingVertical: rs(16),
        paddingHorizontal: rs(40),
        borderRadius: rs(40),
    },
    activeTab: {
        backgroundColor: '#3B82F6',
    },
    activeFocusedTab: {
        borderWidth: 3,
        borderColor: 'white',
        transform: [{ scale: 1.05 }],
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
