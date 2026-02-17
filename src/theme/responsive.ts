import { Dimensions, PixelRatio, Platform } from 'react-native';

// Basis for Apple TV 4K (1920 x 1080)
const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const scaleWidth = SCREEN_WIDTH / BASE_WIDTH;
const scaleHeight = SCREEN_HEIGHT / BASE_HEIGHT;
const scale = Math.min(scaleWidth, scaleHeight);

export const responsive = {
    /**
     * Scale a value based on the screen size
     * @param size Original pixel size at 1920x1080
     */
    scale: (size: number) => {
        const newSize = size * scale;
        if (Platform.OS === 'ios') {
            return Math.round(PixelRatio.roundToNearestPixel(newSize));
        } else {
            return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
        }
    },

    /**
     * Get width as percentage of screen width
     * @param percentage 0-100
     */
    widthPercent: (percentage: number) => {
        return (percentage * SCREEN_WIDTH) / 100;
    },

    /**
     * Get height as percentage of screen height
     * @param percentage 0-100
     */
    heightPercent: (percentage: number) => {
        return (percentage * SCREEN_HEIGHT) / 100;
    },

    /**
     * Common layout values
     */
    layout: {
        cardWidth: (percentage: number = 60) => (percentage * SCREEN_WIDTH) / 100,
        gutter: (percentage: number = 5) => (percentage * SCREEN_WIDTH) / 100,
    }
};

// Shorthand
export const rs = responsive.scale;
export const wp = responsive.widthPercent;
export const hp = responsive.heightPercent;
