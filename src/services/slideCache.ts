/**
 * slideCache — thin service layer around FastImage + AsyncStorage.
 *
 * All FastImage side-effects are isolated here so hooks stay declarative
 * and unit-testable. Public API:
 *
 *   getManifest()          → Record<string, number>  (url → unix-ms timestamp)
 *   preload(url)           → boolean  (true = queued successfully; false = threw)
 *   preloadMany(urls, cb)  → void  (serial; calls cb after each)
 *   clear()                → void  (wipes manifest + SDWebImage/Glide disk cache)
 *
 * Note on @d11/react-native-fast-image's preload API:
 *   The @d11 fork's `FastImage.preload(sources)` is fire-and-forget — it
 *   returns void and has no completion callback (unlike DylanVann's original
 *   fork). We therefore treat a non-throwing call as success: the URL is
 *   queued into SDWebImage / Glide's disk cache, and we write the manifest
 *   entry optimistically. On the next app open the disk cache will have the
 *   bytes; the slideshow's <FastImage> will hit the cache transparently.
 *   If the native call throws (bad URI, OOM) we return false and skip the
 *   manifest write so the URL is retried on the next sync cycle.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import FastImage from '@d11/react-native-fast-image';

const MANIFEST_KEY = 'dojo-cast:prefetchLog';

/** Read the AsyncStorage manifest. Returns {} on missing/corrupt JSON. */
async function getManifest(): Promise<Record<string, number>> {
  try {
    const raw = await AsyncStorage.getItem(MANIFEST_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, number>;
    }
    return {};
  } catch {
    return {};
  }
}

/**
 * Serialize all manifest writes through a single promise chain so concurrent
 * preloads (e.g. a lingering sync from a previous effect overlapping the
 * current one) can't race on read-modify-write and drop entries. Each writer
 * awaits the previous, so the read/modify/write sequence is atomic per URL.
 */
let writeChain: Promise<void> = Promise.resolve();

/** Write manifest back to AsyncStorage (read-modify-write for a single URL). */
function writeManifestEntry(url: string): Promise<void> {
  writeChain = writeChain.then(async () => {
    try {
      const manifest = await getManifest();
      manifest[url] = Date.now();
      await AsyncStorage.setItem(MANIFEST_KEY, JSON.stringify(manifest));
    } catch (e) {
      console.warn('[slideCache] AsyncStorage write failed:', e);
    }
  });
  return writeChain;
}

/**
 * Preload a single URL via FastImage.
 *
 * @d11/react-native-fast-image's preload(sources) is fire-and-forget (no
 * completion callback). We treat a non-throwing call as success (the URL has
 * been queued into the SDWebImage / Glide disk cache) and write the manifest
 * entry optimistically.
 *
 * Returns true on success, false on failure. Never throws.
 */
async function preload(url: string): Promise<boolean> {
  try {
    FastImage.preload([{ uri: url, priority: FastImage.priority.low }]);
    // Non-throwing → optimistically log as cached
    await writeManifestEntry(url);
    return true;
  } catch (e) {
    console.warn('[slideCache] preload failed:', url, e);
    return false;
  }
}

/**
 * Preload a list of URLs serially.
 * Calls onEach(url, ok) after each attempt (even on failure).
 * Serial prevents contention on limited TV CPU / bandwidth.
 */
async function preloadMany(
  urls: string[],
  onEach?: (url: string, ok: boolean) => void,
): Promise<void> {
  for (const url of urls) {
    const ok = await preload(url);
    onEach?.(url, ok);
  }
}

/**
 * Clear both the AsyncStorage manifest and the FastImage disk cache.
 * Swallows clearDiskCache rejections — manifest is still removed.
 *
 * Waits for the write chain to drain before removing the manifest key, so a
 * still-pending write from before `clear()` can't land AFTER the removal and
 * silently resurrect part of the manifest. Then resets the chain so any
 * future writes start from a known-clean state.
 */
async function clear(): Promise<void> {
  await writeChain.catch(() => {});
  writeChain = Promise.resolve();
  await AsyncStorage.removeItem(MANIFEST_KEY);
  try {
    await FastImage.clearDiskCache();
  } catch (e) {
    console.warn('[slideCache] clearDiskCache failed (bytes may remain):', e);
  }
}

export const slideCache = { getManifest, preload, preloadMany, clear };
