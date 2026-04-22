/**
 * __tests__/useDojoCastOfflineSync.test.ts
 *
 * Tests for src/hooks/useDojoCastOfflineSync.ts.
 *
 * Strategy: mock all external deps (useDojoCastPlaylist, useAuthStore,
 * slideCache) and render the hook inside a minimal react-test-renderer
 * component; assert against the real useDojoSettingsStore state.
 *
 * FastImage is mocked globally via jest.setup.js.
 * AsyncStorage is mocked via the official mock package.
 */

import React from 'react';
import { act, create } from 'react-test-renderer';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// ── Mock: useAuthStore ────────────────────────────────────────────────────────
jest.mock('../src/store/useAuthStore', () => ({
  useAuthStore: jest.fn((selector: (s: { user: null }) => unknown) =>
    selector({ user: null }),
  ),
}));

// ── Mock: selectDojoId ────────────────────────────────────────────────────────
jest.mock('../src/utils/authHelpers', () => ({
  selectDojoId: jest.fn(() => 'dojo-123'),
}));

// ── Mock: slideCache ──────────────────────────────────────────────────────────
// Inline jest.fn() inside the factory — these are the actual mock fns we'll
// control. We obtain references via require() after the mock is set up.
jest.mock('../src/services/slideCache', () => ({
  slideCache: {
    getManifest: jest.fn(async () => ({})),
    preload: jest.fn(async () => true),
    preloadMany: jest.fn(async () => {}),
    clear: jest.fn(async () => {}),
  },
}));

// ── Mock: useDojoCastPlaylist ─────────────────────────────────────────────────
jest.mock('../src/hooks/useDojoCastPlaylist', () => ({
  useDojoCastPlaylist: jest.fn(() => ({ data: undefined })),
}));

// ── Import after mocks ────────────────────────────────────────────────────────
import { useDojoCastOfflineSync } from '../src/hooks/useDojoCastOfflineSync';
import { useDojoSettingsStore } from '../src/store/useDojoSettingsStore';
import { useDojoCastPlaylist } from '../src/hooks/useDojoCastPlaylist';
import { slideCache } from '../src/services/slideCache';

const mockedUseDojoCastPlaylist = useDojoCastPlaylist as jest.Mock;
// Cast to jest.Mocks so we can call .mockResolvedValue / .mockImplementation
const mockGetManifest = slideCache.getManifest as jest.Mock;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPreloadMany = slideCache.preloadMany as jest.Mock<
  Promise<void>,
  any[]
>;

// ── Types ─────────────────────────────────────────────────────────────────────
type SlideShape = { imageUrl: string; slideIndex: number; thumbnailUrl: null };
type PlaylistShape = {
  data: {
    decks: Array<{
      _id: string;
      dojo: string;
      source: string;
      sourceId: string;
      label: string;
      order: number;
      authMethod: string;
      syncIntervalMin: number;
      syncStatus: string;
      lastSyncAt: null;
      isActive: boolean;
      slides: SlideShape[];
    }>;
  };
};

const makePlaylist = (slides: SlideShape[]): PlaylistShape => ({
  data: {
    decks: [
      {
        _id: 'deck-1',
        dojo: 'dojo-123',
        source: 'google_slides',
        sourceId: 's1',
        label: 'Deck 1',
        order: 0,
        authMethod: 'oauth',
        syncIntervalMin: 30,
        syncStatus: 'synced',
        lastSyncAt: null,
        isActive: true,
        slides,
      },
    ],
  },
});

const defaultSlides: SlideShape[] = [
  {
    imageUrl: 'http://example.com/slide1.jpg',
    slideIndex: 0,
    thumbnailUrl: null,
  },
  {
    imageUrl: 'http://example.com/slide2.jpg',
    slideIndex: 1,
    thumbnailUrl: null,
  },
];
const defaultPlaylist = makePlaylist(defaultSlides);

// ── Helpers ───────────────────────────────────────────────────────────────────
function getStoreState() {
  return useDojoSettingsStore.getState();
}

function resetStore() {
  act(() => {
    useDojoSettingsStore.setState({
      offlineMode: true,
      cachedSlideCount: 0,
      totalSlideCount: 0,
    });
  });
}

// Track active renderers so afterEach can unmount them
const activeRenderers: Array<ReturnType<typeof create>> = [];

function renderHookComponent(): { unmount: () => void } {
  let renderer!: ReturnType<typeof create>;
  act(() => {
    renderer = create(
      React.createElement(function HookHost() {
        useDojoCastOfflineSync();
        return null;
      }),
    );
  });
  activeRenderers.push(renderer);
  return {
    unmount: () => {
      const idx = activeRenderers.indexOf(renderer);
      if (idx !== -1) activeRenderers.splice(idx, 1);
      act(() => {
        renderer.unmount();
      });
    },
  };
}

const flushAsync = () => new Promise<void>(resolve => setTimeout(resolve, 30));

// ─────────────────────────────────────────────────────────────────────────────

describe('useDojoCastOfflineSync', () => {
  afterEach(async () => {
    // Unmount any renderers created in the test to prevent cross-test pollution
    const toUnmount = [...activeRenderers];
    activeRenderers.length = 0;
    await act(async () => {
      toUnmount.forEach(r => {
        try {
          r.unmount();
        } catch {
          /* already unmounted */
        }
      });
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    resetStore();
    mockGetManifest.mockResolvedValue({});
    mockPreloadMany.mockResolvedValue(undefined);
    mockedUseDojoCastPlaylist.mockReturnValue({ data: defaultPlaylist });
  });

  it('is a no-op when offlineMode is false — preloadMany never called', async () => {
    act(() => {
      useDojoSettingsStore.setState({ offlineMode: false });
    });

    await act(async () => {
      renderHookComponent();
      await flushAsync();
    });

    expect(mockPreloadMany).not.toHaveBeenCalled();
    expect(mockGetManifest).not.toHaveBeenCalled();
  });

  it('is a no-op when playlist data is missing', async () => {
    mockedUseDojoCastPlaylist.mockReturnValue({ data: undefined });

    await act(async () => {
      renderHookComponent();
      await flushAsync();
    });

    expect(mockGetManifest).not.toHaveBeenCalled();
  });

  it('seeds cachedSlideCount from manifest entries matching playlist URLs', async () => {
    mockGetManifest.mockResolvedValue({
      'http://example.com/slide1.jpg': Date.now(),
    });

    await act(async () => {
      renderHookComponent();
      await flushAsync();
    });

    const state = getStoreState();
    expect(state.cachedSlideCount).toBe(1);
    expect(state.totalSlideCount).toBe(2);
  });

  it('calls preloadMany with URLs not present in manifest', async () => {
    mockGetManifest.mockResolvedValue({
      'http://example.com/slide1.jpg': 1000,
    });

    await act(async () => {
      renderHookComponent();
      await flushAsync();
    });

    expect(mockPreloadMany).toHaveBeenCalledTimes(1);
    const missingUrls = (
      mockPreloadMany.mock.calls[0] as unknown[]
    )[0] as string[];
    expect(missingUrls).toEqual(['http://example.com/slide2.jpg']);
  });

  it('passes empty array to preloadMany when all URLs are already in manifest', async () => {
    mockGetManifest.mockResolvedValue({
      'http://example.com/slide1.jpg': 1000,
      'http://example.com/slide2.jpg': 2000,
    });

    await act(async () => {
      renderHookComponent();
      await flushAsync();
    });

    expect(mockPreloadMany).toHaveBeenCalledTimes(1);
    const missingUrls = (
      mockPreloadMany.mock.calls[0] as unknown[]
    )[0] as string[];
    expect(missingUrls).toEqual([]);
  });

  it('increments cachedSlideCount as onEach fires with ok=true', async () => {
    mockGetManifest.mockResolvedValue({});
    mockPreloadMany.mockImplementation(
      async (urls: string[], onEach: (url: string, ok: boolean) => void) => {
        for (const url of urls) {
          onEach(url, true);
        }
      },
    );

    await act(async () => {
      renderHookComponent();
      await flushAsync();
    });

    const state = getStoreState();
    expect(state.cachedSlideCount).toBe(2);
    expect(state.totalSlideCount).toBe(2);
  });

  it('does not increment cachedSlideCount when onEach fires with ok=false', async () => {
    mockGetManifest.mockResolvedValue({});
    mockPreloadMany.mockImplementation(
      async (urls: string[], onEach: (url: string, ok: boolean) => void) => {
        for (const url of urls) {
          onEach(url, false);
        }
      },
    );

    await act(async () => {
      renderHookComponent();
      await flushAsync();
    });

    expect(getStoreState().cachedSlideCount).toBe(0);
  });

  it('re-reconciles when playlist identity changes (totalSlideCount updates)', async () => {
    mockGetManifest.mockResolvedValue({});

    let renderer!: ReturnType<typeof create>;
    await act(async () => {
      renderer = create(
        React.createElement(function HookHost() {
          useDojoCastOfflineSync();
          return null;
        }),
      );
      await flushAsync();
    });
    // Register for afterEach cleanup so the leftover HookHost doesn't leak
    // into the next test (where its stale store subscription would re-fire
    // onEach callbacks against the new test's store state).
    activeRenderers.push(renderer);

    expect(getStoreState().totalSlideCount).toBe(2);

    // Simulate playlist refetch returning 1 slide
    const newPlaylist = makePlaylist([
      {
        imageUrl: 'http://example.com/slide3.jpg',
        slideIndex: 0,
        thumbnailUrl: null,
      },
    ]);
    mockedUseDojoCastPlaylist.mockReturnValue({ data: newPlaylist });

    await act(async () => {
      renderer.update(
        React.createElement(function HookHost() {
          useDojoCastOfflineSync();
          return null;
        }),
      );
      await flushAsync();
    });

    expect(getStoreState().totalSlideCount).toBe(1);
  });

  it('does NOT re-run when playlist object changes but URL set is identical', async () => {
    // Simulates the 5-minute React-Query refetch tick: useDojoCastPlaylist
    // returns a fresh { data: ... } wrapper on every refetch, but if the
    // server payload is byte-identical the slide URLs are unchanged. The hook
    // keys off urlKey (URL-join) rather than playlist identity, so the effect
    // must not re-fire.
    mockGetManifest.mockResolvedValue({});

    // Defined ONCE outside the renderer calls so React sees the same component
    // type across create() and update() — otherwise a new function identity
    // would trigger unmount+remount and mask what we're actually testing.
    const HookHost = function HookHost() {
      useDojoCastOfflineSync();
      return null;
    };

    let renderer!: ReturnType<typeof create>;
    await act(async () => {
      renderer = create(React.createElement(HookHost));
      await flushAsync();
    });
    activeRenderers.push(renderer);

    expect(mockPreloadMany).toHaveBeenCalledTimes(1);
    expect(mockGetManifest).toHaveBeenCalledTimes(1);

    // Fresh playlist object, same URLs (simulating an unchanged refetch).
    mockedUseDojoCastPlaylist.mockReturnValue({
      data: makePlaylist([...defaultSlides]),
    });

    await act(async () => {
      renderer.update(React.createElement(HookHost));
      await flushAsync();
    });

    // urlKey is unchanged → effect does NOT re-run → no additional calls.
    expect(mockPreloadMany).toHaveBeenCalledTimes(1);
    expect(mockGetManifest).toHaveBeenCalledTimes(1);
  });

  it('cancelled flag prevents setState after unmount', async () => {
    // preloadMany never resolves — simulates in-flight while unmount happens
    let capturedOnEach: ((url: string, ok: boolean) => void) | null = null;
    mockPreloadMany.mockImplementation(
      async (urls: string[], onEach: (url: string, ok: boolean) => void) => {
        capturedOnEach = onEach;
        // Block forever — test will unmount before this resolves
        await new Promise<void>(() => {});
      },
    );

    let unmount!: () => void;
    await act(async () => {
      const h = renderHookComponent();
      unmount = h.unmount;
      // Allow getManifest and initial setCounts to complete, then preloadMany blocks
      await new Promise<void>(resolve => setTimeout(resolve, 10));
    });

    // Ensure onEach was captured (preloadMany was called)
    expect(capturedOnEach).not.toBeNull();

    const countBeforeUnmount = getStoreState().cachedSlideCount;

    // Unmount while preloadMany is still in-flight — cleanup sets cancelled = true
    await act(async () => {
      unmount();
      // Allow React to flush the effect cleanup
      await Promise.resolve();
    });

    // Directly invoke onEach (as if native preload completed after unmount)
    // The cancelled flag inside the closure should block setCounts
    act(() => {
      capturedOnEach?.('http://example.com/slide1.jpg', true);
    });

    // Count must not have changed
    expect(getStoreState().cachedSlideCount).toBe(countBeforeUnmount);
  });
});
