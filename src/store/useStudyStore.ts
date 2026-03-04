import { create } from 'zustand';
import { studyService } from '../services/studyService';
import type { StudyCategory, StudyContentItem, StudySubCategory } from '../types/study';

interface StudyState {
    categories: StudyCategory[];
    trainingAreas: StudyCategory[]; // From /study-category
    subCategories: Record<string, StudySubCategory[]>;
    contentItems: StudyContentItem[];
    loadingCategories: boolean;
    loadingTrainingAreas: boolean;
    loadingContent: boolean;
    error: string | null;
}

interface StudyActions {
    fetchCategories: () => Promise<void>;
    fetchTrainingAreas: () => Promise<void>;
    fetchSubCategories: (categoryId: string) => Promise<void>;
    fetchStudyContent: (filters: { programIds?: string[]; categoryIds?: string[]; search?: string; limit?: number; page?: number, withoutPagination?: boolean }) => Promise<void>;
    clearError: () => void;
}

type StudyStore = StudyState & StudyActions;

const initialState: StudyState = {
    categories: [],
    trainingAreas: [],
    subCategories: {},
    contentItems: [],
    loadingCategories: false,
    loadingTrainingAreas: false,
    loadingContent: false,
    error: null,
};

export const useStudyStore = create<StudyStore>((set, get) => ({
    ...initialState,

    fetchCategories: async () => {
        set({ loadingCategories: true, error: null });
        try {
            // TODO: Switch back to getStudyContentForContact when using student accounts
            console.log('[StudyStore] Calling getStudyContent (admin endpoint)...');
            const response = await studyService.getStudyContent({ withoutPagination: true });

            console.log('[StudyStore] response.success:', response.success);
            console.log('[StudyStore] response.data type:', typeof response.data, Array.isArray(response.data) ? '(array)' : '');
            console.log('[StudyStore] response.data keys:', response.data ? Object.keys(response.data) : 'null');
            console.log('[StudyStore] response.data.items?:', response.data?.items?.length ?? 'NO .items KEY');
            // Log first 300 chars of stringified response to see the shape
            console.log('[StudyStore] response snippet:', JSON.stringify(response).substring(0, 300));

            if (response.success && response.data) {
                // Handle both { items: [...] } and direct array [...] response shapes
                const items: StudyContentItem[] = Array.isArray(response.data)
                    ? response.data
                    : (response.data.items || []);
                console.log('[StudyStore] Parsed', items.length, 'study content items');

                if (items.length > 0) {
                    console.log('[StudyStore] First item keys:', Object.keys(items[0]));
                    console.log('[StudyStore] First item title:', items[0].title);
                    console.log('[StudyStore] First item category:', JSON.stringify(items[0].category));
                    console.log('[StudyStore] First item tags:', JSON.stringify(items[0].tags?.slice(0, 2)));
                }

                const uniqueCategories: StudyCategory[] = [];
                const seenCategoryIds = new Set<string>();

                items.forEach((item) => {
                    if (item.category && !seenCategoryIds.has(item.category._id)) {
                        uniqueCategories.push(item.category);
                        seenCategoryIds.add(item.category._id);
                    }
                });

                console.log('[StudyStore] Derived', uniqueCategories.length, 'unique categories');

                set({
                    categories: uniqueCategories,
                    contentItems: items,
                    loadingCategories: false
                });
            } else {
                console.error('[StudyStore] API returned success=false or no data. Message:', response.message);
                throw new Error(response.message || 'Failed to fetch study data');
            }
        } catch (error: any) {
            console.error('[StudyStore] fetchCategories FAILED:', error.message || error);
            set({
                loadingCategories: false,
                error: error.message || 'Error fetching study categories',
            });
        }
    },

    fetchTrainingAreas: async () => {
        set({ loadingTrainingAreas: true });
        try {
            console.log('[StudyStore] Calling getStudyCategories (training areas)...');
            const response = await studyService.getStudyCategories({ page: 1, limit: 10 });

            if (response.success && response.data) {
                const items = Array.isArray(response.data)
                    ? response.data
                    : (response.data.items || []);
                console.log('[StudyStore] Fetched', items.length, 'training areas');
                set({ trainingAreas: items, loadingTrainingAreas: false });
            } else {
                console.error('[StudyStore] Training areas API failed:', response.message);
                set({ loadingTrainingAreas: false });
            }
        } catch (error: any) {
            console.error('[StudyStore] fetchTrainingAreas FAILED:', error.message || error);
            set({ loadingTrainingAreas: false });
        }
    },

    fetchSubCategories: async (categoryId: string) => {
        try {
            const response = await studyService.getSubCategoriesByCategoryId(categoryId);
            if (response.success && response.data) {
                set((state) => ({
                    subCategories: {
                        ...state.subCategories,
                        [categoryId]: response.data || [],
                    }
                }));
            }
        } catch (error) {
            console.error('Failed to fetch sub-categories', error);
        }
    },

    fetchStudyContent: async (filters) => {
        set({ loadingContent: true, error: null });
        try {
            // Dojo app logic:
            // if categoryIds > 0 -> withoutPagination = true
            // if programIds > 0 -> limit = 500, pagination = true

            let queryParams: any = { ...filters };

            if (filters.categoryIds && filters.categoryIds.length > 0) {
                queryParams.withoutPagination = true;
                // Axios custom serialization for arrays may be needed, but the service uses standard params.
                // We'll pass them down. Our Axios interceptor needs to stringify arrays correctly like `categoryIds[]=123`
            } else if (filters.programIds && filters.programIds.length > 0) {
                queryParams.limit = 500;
                queryParams.page = 1;
                queryParams.pagination = true;
            }

            const response = await studyService.getStudyContentForContact(queryParams);

            if (response.success && response.data) {
                const items = response.data.items || [];
                set({
                    contentItems: items,
                    loadingContent: false
                });
            } else {
                throw new Error(response.message || 'Failed to fetch content');
            }
        } catch (error: any) {
            set({
                loadingContent: false,
                error: error.message || 'Error fetching study content',
            });
        }
    },

    clearError: () => set({ error: null }),
}));
