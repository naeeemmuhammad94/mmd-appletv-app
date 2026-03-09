import { create } from 'zustand';
import * as Keychain from 'react-native-keychain';

export interface WatchHistoryEntry {
    contentId: string;
    title: string;
    watchedAt: number;
}

interface WatchHistoryState {
    history: WatchHistoryEntry[];
    loading: boolean;
    loadHistory: () => Promise<void>;
    addToHistory: (item: { contentId: string; title: string }) => Promise<void>;
    clearHistory: () => Promise<void>;
}

const STORAGE_KEY = 'watch_history';
const MAX_HISTORY_ITEMS = 50;

export const useWatchHistoryStore = create<WatchHistoryState>((set, get) => ({
    history: [],
    loading: true,

    loadHistory: async () => {
        set({ loading: true });
        try {
            const credentials = await Keychain.getGenericPassword({ service: STORAGE_KEY });
            if (credentials && credentials.password) {
                const history = JSON.parse(credentials.password) as WatchHistoryEntry[];
                set({ history, loading: false });
            } else {
                set({ history: [], loading: false });
            }
        } catch (error) {
            console.error('Failed to load watch history:', error);
            set({ history: [], loading: false });
        }
    },

    addToHistory: async ({ contentId, title }) => {
        const { history } = get();

        // Remove item if it already exists to move it to the top
        let newHistory = history.filter(item => item.contentId !== contentId);

        // Add new item at the beginning
        newHistory.unshift({
            contentId,
            title,
            watchedAt: Date.now()
        });

        // Limit history size
        if (newHistory.length > MAX_HISTORY_ITEMS) {
            newHistory = newHistory.slice(0, MAX_HISTORY_ITEMS);
        }

        set({ history: newHistory });

        // Persist to storage
        try {
            await Keychain.setGenericPassword('history', JSON.stringify(newHistory), { service: STORAGE_KEY });
        } catch (error) {
            console.error('Failed to save watch history:', error);
        }
    },

    clearHistory: async () => {
        set({ history: [] });
        try {
            await Keychain.resetGenericPassword({ service: STORAGE_KEY });
        } catch (error) {
            console.error('Failed to clear watch history:', error);
        }
    }
}));
