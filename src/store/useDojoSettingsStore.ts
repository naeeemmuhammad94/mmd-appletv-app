import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { slideCache } from '../services/slideCache';

interface DojoSettingsState {
  // Playback
  autoAdvance: boolean;
  slideDuration: 10 | 20 | 30;

  // Offline & Cache
  offlineMode: boolean;
  cachedSlideCount: number;
  totalSlideCount: number;

  // Rotation
  rotation: 0 | 90 | 180 | 270;

  // Actions
  toggleAutoAdvance: () => void;
  setSlideDuration: (d: 10 | 20 | 30) => void;
  toggleOfflineMode: () => void;
  setRotation: (r: 0 | 90 | 180 | 270) => void;
  setCacheCounts: (counts: { cached: number; total: number }) => void;
  clearCache: () => Promise<void>;
}

export const useDojoSettingsStore = create<DojoSettingsState>()(
  persist(
    set => ({
      autoAdvance: true,
      slideDuration: 10,
      offlineMode: true,
      cachedSlideCount: 0,
      totalSlideCount: 0,
      rotation: 0,

      toggleAutoAdvance: () => set(s => ({ autoAdvance: !s.autoAdvance })),
      setSlideDuration: (d: 10 | 20 | 30) => set({ slideDuration: d }),
      toggleOfflineMode: () => set(s => ({ offlineMode: !s.offlineMode })),
      setRotation: (r: 0 | 90 | 180 | 270) => set({ rotation: r }),
      setCacheCounts: ({ cached, total }: { cached: number; total: number }) =>
        set({ cachedSlideCount: cached, totalSlideCount: total }),
      clearCache: async () => {
        await slideCache.clear();
        set({ cachedSlideCount: 0 });
      },
    }),
    {
      name: 'dojo-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
