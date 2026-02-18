import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';

const AdminHomeScreen = () => {
    const { theme } = useTheme();
    const logout = useAuthStore(state => state.logout);

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Welcome Admin!</Text>
            <TouchableOpacity onPress={logout} style={styles.button}>
                <Text style={[styles.buttonText, { color: theme.colors.text }]}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: rs(48),
        fontWeight: 'bold',
        marginBottom: rs(40),
    },
    button: {
        paddingHorizontal: rs(40),
        paddingVertical: rs(20),
        backgroundColor: '#E53935',
        borderRadius: rs(10),
    },
    buttonText: {
        fontSize: rs(24),
        fontWeight: '600',
    },
});

export default AdminHomeScreen;
