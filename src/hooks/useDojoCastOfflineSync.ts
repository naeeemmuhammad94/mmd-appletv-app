/**
 * useDojoCastOfflineSync
 *
 * Runs at the Dojo stack root (mounted in DojoNavigator). When offlineMode is
 * ON it:
 *   1. Reads the AsyncStorage manifest to find already-cached slide URLs.
 *   2. Seeds cachedSlideCount / totalSlideCount in useDojoSettingsStore.
 *   3. Preloads missing URLs serially via FastImage, incrementing cachedSlideCount
 *      as each succeeds.
 *
 * Re-runs only when the actual URL set changes (or when offlineMode toggles
 * ON). In particular it does NOT re-run on every React-Query refetch tick —
 * useDojoCastPlaylist's 5-min refetchInterval returns a fresh `playlist`
 * reference each time, but if the slide URLs are byte-identical, we skip the
 * reconciliation entirely. A URL-joined `urlKey` string is used as the effect
 * dep instead of the playlist object.
 */

import { useEffect, useMemo } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { selectDojoId } from '../utils/authHelpers';
import { useDojoCastPlaylist } from './useDojoCastPlaylist';
import { useDojoSettingsStore } from '../store/useDojoSettingsStore';
import { filterAndSortDecks } from '../utils/dojoCastFilters';
import { slideCache } from '../services/slideCache';

export function useDojoCastOfflineSync() {
  const dojoId = useAuthStore(s => selectDojoId(s.user));
  const { data: playlist } = useDojoCastPlaylist(dojoId);
  const offlineMode = useDojoSettingsStore(s => s.offlineMode);
  const setCounts = useDojoSettingsStore(s => s.setCacheCounts);

  // Stable identity derived from the slide URL set. Changes only when the
  // actual URLs change (new deck, new slides, deck removed) — NOT on every
  // 5-min React-Query refetch that returns the same payload.
  const urls = useMemo(() => {
    if (!playlist?.data?.decks) return [] as string[];
    return filterAndSortDecks(playlist.data.decks).flatMap(d =>
      d.slides.map(s => s.imageUrl),
    );
  }, [playlist]);
  const urlKey = urls.join('|');

  useEffect(() => {
    if (!offlineMode || urls.length === 0) return;
    let cancelled = false;

    (async () => {
      const manifest = await slideCache.getManifest();
      if (cancelled) return;

      // Manifest is authoritative for "cached" — URLs we've successfully
      // preloaded into SDWebImage / Glide. Seed cachedSlideCount from manifest
      // ∩ current URLs; climb as preloadMany succeeds.
      const cachedNow = urls.filter(u => manifest[u]).length;
      setCounts({ cached: cachedNow, total: urls.length });

      const missing = urls.filter(u => !manifest[u]);
      let newlyCached = 0;
      await slideCache.preloadMany(missing, (_u, ok) => {
        if (cancelled) return;
        if (ok) {
          newlyCached += 1;
          setCounts({
            cached: cachedNow + newlyCached,
            total: urls.length,
          });
        }
      });
    })();

    return () => {
      cancelled = true;
    };
    // urlKey encodes the URL set; urls is kept out of deps because it's a
    // fresh array each render — the key is the stable identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offlineMode, urlKey, setCounts]);
}
