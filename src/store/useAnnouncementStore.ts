import { create } from 'zustand';
import { announcementService } from '../services/announcementService';
import type { Announcement } from '../types/announcement';
import { format } from 'date-fns'; // eslint-disable-line @typescript-eslint/no-unused-vars

interface AnnouncementState {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
}

interface AnnouncementActions {
  fetchAnnouncements: (params?: {
    search?: string;
    limit?: number;
    page?: number;
  }) => Promise<void>;
  clearError: () => void;
}

type AnnouncementStore = AnnouncementState & AnnouncementActions;

const initialState: AnnouncementState = {
  announcements: [],
  loading: false,
  error: null,
};

export const useAnnouncementStore = create<AnnouncementStore>(set => ({
  ...initialState,

  fetchAnnouncements: async (params = { limit: 50, page: 1 }) => {
    set({ loading: true, error: null });
    try {
      const response = await announcementService.getAnnouncementsForContact(
        params,
      );
      if (response.success && response.data) {
        set({
          announcements: response.data.items || [],
          loading: false,
        });
      } else {
        throw new Error(response.message || 'Failed to fetch announcements');
      }
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || 'Error fetching announcements',
      });
    }
  },

  clearError: () => set({ error: null }),
}));
