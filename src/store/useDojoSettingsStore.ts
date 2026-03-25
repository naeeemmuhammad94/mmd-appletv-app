import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DojoSettingsState {
  // Playback
  autoAdvance: boolean;
  slideDuration: 10 | 20 | 30;

  // Offline & Cache
  offlineMode: boolean;
  storageUsedMB: number;

  // Rotation
  rotation: 0 | 90 | 180 | 270;

  // Actions
  toggleAutoAdvance: () => void;
  setSlideDuration: (d: 10 | 20 | 30) => void;
  toggleOfflineMode: () => void;
  setRotation: (r: 0 | 90 | 180 | 270) => void;
  clearCache: () => void;
}

export const useDojoSettingsStore = create<DojoSettingsState>()(
  persist(
    set => ({
      autoAdvance: true,
      slideDuration: 10,
      offlineMode: true,
      storageUsedMB: 120,
      rotation: 0,

      toggleAutoAdvance: () => set(s => ({ autoAdvance: !s.autoAdvance })),
      setSlideDuration: (d: 10 | 20 | 30) => set({ slideDuration: d }),
      toggleOfflineMode: () => set(s => ({ offlineMode: !s.offlineMode })),
      setRotation: (r: 0 | 90 | 180 | 270) => set({ rotation: r }),
      clearCache: () => set({ storageUsedMB: 0, offlineMode: false }),
    }),
    {
      name: 'dojo-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
