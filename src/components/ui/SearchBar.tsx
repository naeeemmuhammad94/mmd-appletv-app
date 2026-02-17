/**
 * SearchBar – Full-width search input for tvOS
 * Debounced text input with a search icon
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme';
import { rs } from '../../theme/responsive';
import { TVTextInput } from './TVTextInput';

interface SearchBarProps {
    placeholder?: string;
    onSearch: (query: string) => void;
    debounceMs?: number;
    initialValue?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = 'Search programs…',
    onSearch,
    debounceMs = 400,
    initialValue = '',
}) => {
    const { theme } = useTheme();
    const [value, setValue] = useState(initialValue);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleChange = useCallback(
        (text: string) => {
            setValue(text);
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            timerRef.current = setTimeout(() => {
                onSearch(text.trim());
            }, debounceMs);
        },
        [onSearch, debounceMs]
    );

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.inputBackground,
                    borderColor: theme.colors.inputBorder,
                },
            ]}
        >
            <Icon
                name="search"
                size={rs(32)}
                color={theme.colors.textSecondary}
                style={styles.icon}
            />
            <TVTextInput
                value={value}
                onChangeText={handleChange}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.textSecondary}
                style={[
                    styles.input,
                    {
                        color: theme.colors.text,
                        fontSize: theme.fontSize.body,
                    },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: rs(16),
        paddingHorizontal: rs(20),
        height: rs(64),
    },
    icon: {
        marginRight: rs(12),
    },
    input: {
        flex: 1,
        height: '100%',
        borderWidth: 0,
        backgroundColor: 'transparent',
        padding: 0,
    },
});
