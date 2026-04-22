/* eslint-env jest */
// Jest global setup — mocks for native modules that don't run in Jest.

jest.mock('@d11/react-native-fast-image', () => ({
  __esModule: true,
  default: {
    preload: jest.fn(),
    clearDiskCache: jest.fn(() => Promise.resolve()),
    resizeMode: {
      contain: 'contain',
      cover: 'cover',
      stretch: 'stretch',
      center: 'center',
    },
    priority: { low: 'low', normal: 'normal', high: 'high' },
  },
}));
