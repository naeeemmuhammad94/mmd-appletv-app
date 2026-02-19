module.exports = {
    project: {
        ios: {},
        android: {},
    },
    assets: ['./src/assets/fonts/'],
    dependencies: {
        'react-native-webview': {
            platforms: {
                ios: null,    // Disable on iOS/tvOS — not supported on tvOS
                android: null,
            },
        },
    },
};
