import { create } from 'zustand';
import { DojoCastConnectionStatus } from '../types/dojo';

interface DojoCastState {
  connectionStatus: DojoCastConnectionStatus;
  selectedProgramId: string | null;
  selectedSlideUrl: string | null;
  isPlaying: boolean;
  currentSlideIndex: number;

  setConnectionStatus: (status: DojoCastConnectionStatus) => void;
  selectProgram: (programId: string, slideUrl?: string) => void;
  setPlaying: (playing: boolean) => void;
  setCurrentSlideIndex: (index: number) => void;
  nextSlide: (totalSlides: number) => void;
  prevSlide: (totalSlides: number) => void;
  reset: () => void;
}

export const useDojoCastStore = create<DojoCastState>(set => ({
  connectionStatus: 'disconnected',
  selectedProgramId: null,
  selectedSlideUrl: null,
  isPlaying: false,
  currentSlideIndex: 0,

  setConnectionStatus: status => set({ connectionStatus: status }),

  selectProgram: (programId, slideUrl) =>
    set({ selectedProgramId: programId, selectedSlideUrl: slideUrl ?? null }),

  setPlaying: playing => set({ isPlaying: playing }),

  setCurrentSlideIndex: index => set({ currentSlideIndex: index }),

  nextSlide: totalSlides =>
    set(state => ({
      currentSlideIndex:
        totalSlides <= 0
          ? 0
          : state.currentSlideIndex < totalSlides - 1
          ? state.currentSlideIndex + 1
          : 0,
    })),

  prevSlide: totalSlides =>
    set(state => ({
      currentSlideIndex:
        totalSlides <= 0
          ? 0
          : state.currentSlideIndex > 0
          ? state.currentSlideIndex - 1
          : totalSlides - 1,
    })),

  reset: () =>
    set({
      connectionStatus: 'disconnected',
      selectedProgramId: null,
      selectedSlideUrl: null,
      isPlaying: false,
      currentSlideIndex: 0,
    }),
}));
