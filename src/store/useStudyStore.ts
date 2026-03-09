import { create } from 'zustand';
import { studyService } from '../services/studyService';
import type { StudyCategory, StudyContentItem, StudySubCategory, StudyProgram } from '../types/study';

interface StudyState {
    categories: StudyCategory[];
    programs: StudyProgram[]; // From /program-tag-club
    trainingAreas: StudyCategory[]; // From /study-category
    subCategories: Record<string, StudySubCategory[]>;
    contentItems: StudyContentItem[];
    loadingCategories: boolean;
    loadingPrograms: boolean;
    loadingTrainingAreas: boolean;
    loadingContent: boolean;
    error: string | null;
}

interface StudyActions {
    fetchCategories: () => Promise<void>;
    fetchPrograms: () => Promise<void>;
    fetchTrainingAreas: () => Promise<void>;
    fetchSubCategories: (categoryId: string) => Promise<void>;
    fetchStudyContent: (filters: { programIds?: string[]; categoryIds?: string[]; search?: string; limit?: number; page?: number, withoutPagination?: boolean }) => Promise<void>;
    clearError: () => void;
}

type StudyStore = StudyState & StudyActions;

const initialState: StudyState = {
    categories: [],
    programs: [],
    trainingAreas: [],
    subCategories: {},
    contentItems: [],
    loadingCategories: false,
    loadingPrograms: false,
    loadingTrainingAreas: false,
    loadingContent: false,
    error: null,
};

export const useStudyStore = create<StudyStore>((set, get) => ({
    ...initialState,

    fetchCategories: async () => {
        set({ loadingCategories: true, error: null });
        try {
            const response = await studyService.getStudyContentForContact({ limit: 500, page: 1, pagination: true });

            if (response.success && response.data) {
                // Handle both { items: [...] } and direct array [...] response shapes
                const items: StudyContentItem[] = Array.isArray(response.data)
                    ? response.data
                    : (response.data.items || []);

                // Extract unique categories (same as dojo-app "Select a category")
                const uniqueCategories: StudyCategory[] = [];
                const seenCategoryIds = new Set<string>();

                // Extract unique programs (same as dojo-app "Select a program")
                const uniquePrograms: StudyProgram[] = [];
                const seenProgramIds = new Set<string>();

                items.forEach((item) => {
                    // Categories
                    if (item.category && !seenCategoryIds.has(item.category._id)) {
                        uniqueCategories.push(item.category);
                        seenCategoryIds.add(item.category._id);
                    }
                    // Programs
                    if (item.programs && Array.isArray(item.programs)) {
                        item.programs.forEach((program) => {
                            if (program && !seenProgramIds.has(program._id)) {
                                uniquePrograms.push(program);
                                seenProgramIds.add(program._id);
                            }
                        });
                    }
                });

                // Log first item's subCategoryId to verify field exists
                if (items.length > 0) {
                    console.log('[StudyStore] First item subCategoryId:', items[0].subCategoryId);
                    console.log('[StudyStore] Programs found:', uniquePrograms.length);
                    console.log('[StudyStore] Categories found:', uniqueCategories.length);
                }

                set({
                    categories: uniqueCategories,
                    programs: uniquePrograms,
                    contentItems: items,
                    loadingCategories: false
                });
            } else {
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

    fetchPrograms: async () => {
        // Programs are extracted from content items in fetchCategories.
        // This is a no-op if fetchCategories has already run.
        // If called before fetchCategories, load content first.
        const { contentItems, programs } = get();
        if (programs.length > 0) return; // Already extracted

        if (contentItems.length === 0) {
            // Content not loaded yet — fetch it
            set({ loadingPrograms: true });
            try {
                const response = await studyService.getStudyContentForContact({ limit: 500, page: 1, pagination: true });
                if (response.success && response.data) {
                    const items: StudyContentItem[] = Array.isArray(response.data)
                        ? response.data
                        : (response.data.items || []);

                    const uniquePrograms: StudyProgram[] = [];
                    const seenProgramIds = new Set<string>();
                    items.forEach(item => {
                        item.programs?.forEach(program => {
                            if (program && !seenProgramIds.has(program._id)) {
                                uniquePrograms.push(program);
                                seenProgramIds.add(program._id);
                            }
                        });
                    });
                    set({ programs: uniquePrograms, loadingPrograms: false });
                } else {
                    set({ loadingPrograms: false });
                }
            } catch (error: any) {
                console.log('[StudyStore] fetchPrograms fallback failed:', error.message || error);
                set({ loadingPrograms: false });
            }
        } else {
            // Extract from already loaded content
            const uniquePrograms: StudyProgram[] = [];
            const seenProgramIds = new Set<string>();
            contentItems.forEach(item => {
                item.programs?.forEach(program => {
                    if (program && !seenProgramIds.has(program._id)) {
                        uniquePrograms.push(program);
                        seenProgramIds.add(program._id);
                    }
                });
            });
            set({ programs: uniquePrograms });
        }
    },

    fetchTrainingAreas: async () => {
        set({ loadingTrainingAreas: true });
        try {
            const response = await studyService.getStudyCategories({ page: 1, limit: 10 });

            if (response.success && response.data) {
                const items = Array.isArray(response.data)
                    ? response.data
                    : (response.data.items || []);
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
            // ALWAYS pass limit=500, page=1, pagination=true for both category and program filters

            let queryParams: any = { ...filters };

            if (filters.categoryIds && filters.categoryIds.length > 0) {
                queryParams.limit = 500;
                queryParams.page = 1;
                queryParams.pagination = true;
            } else if (filters.programIds && filters.programIds.length > 0) {
                queryParams.limit = 500;
                queryParams.page = 1;
                queryParams.pagination = true;
            }

            const response = await studyService.getStudyContentForContact(queryParams);

            if (response.success && response.data) {
                const items = Array.isArray(response.data)
                    ? response.data
                    : (response.data.items || []);
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
