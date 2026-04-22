/**
 * __tests__/slideCache.test.ts
 *
 * Tests for src/services/slideCache.ts.
 * FastImage is mocked globally in jest.setup.js.
 * AsyncStorage is mocked via the official mock package.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from '@d11/react-native-fast-image';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Import after mocks are declared so the module picks up mocked deps.
import { slideCache } from '../src/services/slideCache';

const mockPreload = FastImage.preload as jest.Mock;
const mockClearDiskCache = FastImage.clearDiskCache as jest.Mock;

const MANIFEST_KEY = 'dojo-cast:prefetchLog';

describe('slideCache.getManifest', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns {} when AsyncStorage has no entry', async () => {
    const result = await slideCache.getManifest();
    expect(result).toEqual({});
  });

  it('returns {} when stored value is corrupt JSON', async () => {
    await AsyncStorage.setItem(MANIFEST_KEY, 'NOT_JSON{{{');
    const result = await slideCache.getManifest();
    expect(result).toEqual({});
  });

  it('returns the stored manifest when valid JSON', async () => {
    const stored = { 'http://example.com/a.jpg': 1000 };
    await AsyncStorage.setItem(MANIFEST_KEY, JSON.stringify(stored));
    const result = await slideCache.getManifest();
    expect(result).toEqual(stored);
  });
});

describe('slideCache.preload', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    mockPreload.mockReset();
    // Default: preload succeeds (no throw)
    mockPreload.mockReturnValue(undefined);
  });

  it('writes manifest entry on success and returns true', async () => {
    const ok = await slideCache.preload('http://example.com/slide.jpg');
    expect(ok).toBe(true);
    const manifest = await slideCache.getManifest();
    expect(manifest['http://example.com/slide.jpg']).toBeGreaterThan(0);
  });

  it('calls FastImage.preload with low priority', async () => {
    await slideCache.preload('http://example.com/slide.jpg');
    expect(mockPreload).toHaveBeenCalledWith([
      { uri: 'http://example.com/slide.jpg', priority: 'low' },
    ]);
  });

  it('does NOT write manifest when FastImage.preload throws, and returns false', async () => {
    mockPreload.mockImplementationOnce(() => {
      throw new Error('native crash');
    });
    const ok = await slideCache.preload('http://example.com/crash.jpg');
    expect(ok).toBe(false);
    const manifest = await slideCache.getManifest();
    expect(manifest['http://example.com/crash.jpg']).toBeUndefined();
  });

  it('never throws even on complete failure', async () => {
    mockPreload.mockImplementationOnce(() => {
      throw new Error('oops');
    });
    await expect(
      slideCache.preload('http://example.com/safe.jpg'),
    ).resolves.toBe(false);
  });
});

describe('slideCache.preloadMany', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    mockPreload.mockReset();
    mockPreload.mockReturnValue(undefined);
  });

  it('calls onEach for every URL even when some fail', async () => {
    const urls = [
      'http://example.com/a.jpg',
      'http://example.com/b.jpg',
      'http://example.com/c.jpg',
    ];
    // a succeeds, b throws (fail), c succeeds
    mockPreload
      .mockReturnValueOnce(undefined) // a: success
      .mockImplementationOnce(() => {
        throw new Error('fail');
      }) // b: fail
      .mockReturnValueOnce(undefined); // c: success

    const results: Array<{ url: string; ok: boolean }> = [];
    await slideCache.preloadMany(urls, (url, ok) => results.push({ url, ok }));

    expect(results).toHaveLength(3);
    expect(results[0]).toEqual({ url: 'http://example.com/a.jpg', ok: true });
    expect(results[1]).toEqual({ url: 'http://example.com/b.jpg', ok: false });
    expect(results[2]).toEqual({ url: 'http://example.com/c.jpg', ok: true });
  });

  it('works with no onEach callback (no throw)', async () => {
    await expect(
      slideCache.preloadMany(['http://example.com/x.jpg']),
    ).resolves.toBeUndefined();
  });

  it('continues past individual failures', async () => {
    const urls = ['http://a.jpg', 'http://b.jpg'];
    mockPreload
      .mockImplementationOnce(() => {
        throw new Error('fail');
      })
      .mockReturnValueOnce(undefined);

    const results: boolean[] = [];
    await slideCache.preloadMany(urls, (_u, ok) => results.push(ok));
    expect(results).toEqual([false, true]);
  });
});

describe('slideCache.clear', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    mockPreload.mockReset();
    mockPreload.mockReturnValue(undefined);
    mockClearDiskCache.mockReset();
    mockClearDiskCache.mockResolvedValue(undefined);
  });

  it('removes the manifest key AND calls FastImage.clearDiskCache', async () => {
    await AsyncStorage.setItem(MANIFEST_KEY, JSON.stringify({ url: 1 }));
    await slideCache.clear();

    const manifest = await slideCache.getManifest();
    expect(manifest).toEqual({});
    expect(mockClearDiskCache).toHaveBeenCalledTimes(1);
  });

  it('subsequent getManifest returns {} after clear', async () => {
    await AsyncStorage.setItem(
      MANIFEST_KEY,
      JSON.stringify({ 'http://img.jpg': 999 }),
    );
    await slideCache.clear();
    expect(await slideCache.getManifest()).toEqual({});
  });

  it('still removes manifest when FastImage.clearDiskCache rejects', async () => {
    await AsyncStorage.setItem(MANIFEST_KEY, JSON.stringify({ x: 1 }));
    mockClearDiskCache.mockRejectedValueOnce(new Error('disk full'));

    // Should NOT throw
    await expect(slideCache.clear()).resolves.toBeUndefined();

    // Manifest still wiped
    expect(await slideCache.getManifest()).toEqual({});
  });
});

describe('slideCache manifest write serialization (race guard)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    mockPreload.mockReset();
    mockPreload.mockReturnValue(undefined);
  });

  it('concurrent preloads do not drop manifest entries', async () => {
    // Kick off two overlapping preloadMany runs. Without the write-chain
    // serialization, the read-modify-write inside writeManifestEntry would
    // race and the later write would overwrite the earlier (losing entries).
    const urlsA = ['http://example.com/a1.jpg', 'http://example.com/a2.jpg'];
    const urlsB = ['http://example.com/b1.jpg', 'http://example.com/b2.jpg'];

    await Promise.all([
      slideCache.preloadMany(urlsA),
      slideCache.preloadMany(urlsB),
    ]);

    const manifest = await slideCache.getManifest();
    const keys = Object.keys(manifest).sort();
    expect(keys).toEqual([...urlsA, ...urlsB].sort());
  });
});
