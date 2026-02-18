import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const SearchScreen = () => {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (text: string) => {
        setSearchQuery(text);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={rs(32)} color={theme.colors.text} />
                </TouchableOpacity>
                <View style={styles.searchContainer}>
                    <Icon name="search" size={rs(24)} color={theme.colors.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.colors.text }]}
                        placeholder="Search program"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={searchQuery}
                        onChangeText={handleSearch}
                        autoFocus
                    />
                </View>
            </View>

            <View style={styles.content}>
                {!searchQuery ? (
                    <View style={{ width: '100%' }}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Searches</Text>
                        <FlatList
                            data={['Karate Basics', 'Sparring Techniques', 'Summer Camp']}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.resultItem}>
                                    <Icon name="history" size={rs(24)} color={theme.colors.textSecondary} />
                                    <Text style={[styles.resultText, { color: theme.colors.text }]}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                ) : (
                    <Text style={{ color: theme.colors.text, fontSize: rs(20) }}>
                        {`Searching for "${searchQuery}"...`}
                    </Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: rs(40),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: rs(40),
    },
    backButton: {
        marginRight: rs(20),
        padding: rs(10),
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: rs(8),
        paddingHorizontal: rs(20),
        height: rs(60),
    },
    searchInput: {
        flex: 1,
        marginLeft: rs(10),
        fontSize: rs(24),
    },
    content: {
        flex: 1,
        paddingHorizontal: rs(20),
    },
    sectionTitle: {
        fontSize: rs(28),
        fontWeight: 'bold',
        marginBottom: rs(20),
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: rs(16),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    resultText: {
        fontSize: rs(24),
        marginLeft: rs(20),
    },
});

export default SearchScreen;
