import React from 'react';
import { View, Text, StyleSheet, FlatList, ViewStyle, StyleProp, TouchableOpacity } from 'react-native';
import SliderIcon from '../../../assets/icons/silder_icon.svg';
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

    const flatListRef = React.useRef<FlatList>(null);
    const [focusedButton, setFocusedButton] = React.useState<'left' | 'right' | null>(null);
    const [contentSize, setContentSize] = React.useState(0);
    const [layoutWidth, setLayoutWidth] = React.useState(0);
    const [contentOffset, setContentOffset] = React.useState(0);

    const showLeftArrow = contentOffset > 0;
    const showRightArrow = contentSize > layoutWidth && contentOffset + layoutWidth < contentSize;

    const handleScroll = (event: any) => {
        setContentOffset(event.nativeEvent.contentOffset.x);
    };

    const scrollLeft = () => {
        flatListRef.current?.scrollToOffset({ offset: Math.max(0, contentOffset - layoutWidth / 2), animated: true });
    };

    const scrollRight = () => {
        flatListRef.current?.scrollToOffset({ offset: Math.min(contentSize - layoutWidth, contentOffset + layoutWidth / 2), animated: true });
    };

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: theme.colors.text, fontSize: theme.fontSize.h3 }]}>
                {title}
            </Text>

            {/* Left Button */}
            {showLeftArrow && (
                <TouchableOpacity
                    style={[styles.sliderButton, styles.leftButton, focusedButton === 'left' && styles.focusedButton]}
                    onPress={scrollLeft}
                    onFocus={() => setFocusedButton('left')}
                    onBlur={() => setFocusedButton(null)}
                >
                    <SliderIcon width={24} height={24} color={focusedButton === 'left' ? theme.colors.background : 'white'} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>
            )}

            <FlatList
                ref={flatListRef}
                horizontal
                data={data}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={[styles.listContent, contentContainerStyle]}
                showsHorizontalScrollIndicator={false}
                // Important for TV interactions
                scrollEnabled={true}
                removeClippedSubviews={false} // Prevent focus issues on TV
                onScroll={handleScroll}
                scrollEventThrottle={16}
                onLayout={(e) => setLayoutWidth(e.nativeEvent.layout.width)}
                onContentSizeChange={(w) => setContentSize(w)}
            />

            {/* Right Button */}
            {showRightArrow && (
                <TouchableOpacity
                    style={[styles.sliderButton, styles.rightButton, focusedButton === 'right' && styles.focusedButton]}
                    onPress={scrollRight}
                    onFocus={() => setFocusedButton('right')}
                    onBlur={() => setFocusedButton(null)}
                >
                    <SliderIcon width={24} height={24} color={focusedButton === 'right' ? theme.colors.background : 'white'} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 40,
        width: '100%',
        position: 'relative',
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
    sliderButton: {
        position: 'absolute',
        top: '55%', // Center vertically relative to list (approx)
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    leftButton: {
        left: 10,
    },
    rightButton: {
        right: 10,
    },
    focusedButton: {
        backgroundColor: 'white',
        borderColor: 'white',
    },
});
