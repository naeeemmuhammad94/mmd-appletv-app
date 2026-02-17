import React from 'react';
import { View, Text, StyleSheet, FlatList, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '../../theme';

interface HorizontalRowProps {
    title: string;
    data: any[];
    renderItem: ({ item, index }: { item: any; index: number }) => React.ReactElement;
    keyExtractor: (item: any) => string;
    contentContainerStyle?: StyleProp<ViewStyle>;
}

export const HorizontalRow: React.FC<HorizontalRowProps> = ({
    title,
    data,
    renderItem,
    keyExtractor,
    contentContainerStyle,
}) => {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: theme.colors.text, fontSize: theme.fontSize.h3 }]}>
                {title}
            </Text>
            <FlatList
                horizontal
                data={data}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={[styles.listContent, contentContainerStyle]}
                showsHorizontalScrollIndicator={false}
                // Important for TV interactions
                scrollEnabled={true}
                removeClippedSubviews={false} // Prevent focus issues on TV
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 40,
        width: '100%',
    },
    title: {
        fontWeight: '700',
        marginBottom: 20,
        marginLeft: 60, // Align with content padding
    },
    listContent: {
        paddingHorizontal: 60,
        gap: 24,
    },
});
