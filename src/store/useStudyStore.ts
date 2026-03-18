import { create } from 'zustand';
import { studyService } from '../services/studyService';
import type {
  StudyCategory,
  StudyContentItem,
  StudySubCategory,
  StudyProgram,
} from '../types/study';

interface StudyState {
  categories: StudyCategory[];
  programs: StudyProgram[]; // Extracted from contentItems
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
  fetchStudyContent: (filters: {
    programIds?: string[];
    categoryIds?: string[];
    search?: string;
    limit?: number;
    page?: number;
    withoutPagination?: boolean;
  }) => Promise<void>;
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

const extractProgramsAndCategories = (items: StudyContentItem[]) => {
  const uniqueCategories: StudyCategory[] = [];
  const seenCategoryIds = new Set<string>();
  const uniquePrograms: StudyProgram[] = [];
  const seenProgramIds = new Set<string>();

  items.forEach(item => {
    // Categories (extracting logic from dojo-app)
    if (item.category && !seenCategoryIds.has(item.category._id)) {
      uniqueCategories.push(item.category);
      seenCategoryIds.add(item.category._id);
    }
    // Programs (exact dojo-app loop structure)
    if (item.programs && Array.isArray(item.programs)) {
      item.programs.forEach(program => {
        if (program && !seenProgramIds.has(program._id)) {
          uniquePrograms.push(program);
          seenProgramIds.add(program._id);
        }
      });
    }
  });

  return { uniqueCategories, uniquePrograms };
};

export const useStudyStore = create<StudyStore>((set, get) => ({
  ...initialState,

  fetchCategories: async () => {
    set({ loadingCategories: true, error: null });
    try {
      const response = await studyService.getStudyContentForContact({
        limit: 500,
        page: 1,
        pagination: true,
      });

      if (response.success && response.data) {
        // Handle both { items: [...] } and direct array [...] response shapes
        const items: StudyContentItem[] = Array.isArray(response.data)
          ? response.data
          : response.data.items || [];

        const { uniqueCategories, uniquePrograms } =
          extractProgramsAndCategories(items);

        // Log findings to match dojo-app visibility
        console.log('[StudyStore] Programs found:', uniquePrograms.length);
        console.log('[StudyStore] Categories found:', uniqueCategories.length);

        set({
          categories: uniqueCategories,
          programs: uniquePrograms,
          contentItems: items,
          loadingCategories: false,
        });
      } else {
        throw new Error(response.message || 'Failed to fetch study data');
      }
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Error fetching study categories';
      console.error('[StudyStore] fetchCategories FAILED:', msg);
      set({
        loadingCategories: false,
        error: msg,
      });
    }
  },

  fetchPrograms: async () => {
    const { programs, contentItems } = get();
    if (programs.length > 0) return; // Already loaded

    set({ loadingPrograms: true });

    try {
      // If contentItems already loaded, just extract from them
      if (contentItems.length > 0) {
        const { uniquePrograms } = extractProgramsAndCategories(contentItems);
        console.log(
          '[StudyStore] Programs extracted from contentItems:',
          uniquePrograms.length,
        );
        set({ programs: uniquePrograms, loadingPrograms: false });
        return;
      }

      // Replicate dojo-app behavior: fetch directly from study content endpoint
      const response = await studyService.getStudyContentForContact({
        limit: 500,
        page: 1,
        pagination: true,
      });

      if (response.success && response.data) {
        const items: StudyContentItem[] = Array.isArray(response.data)
          ? response.data
          : response.data.items || [];

        const { uniquePrograms } = extractProgramsAndCategories(items);
        console.log(
          '[StudyStore] Programs fetched and extracted independently:',
          uniquePrograms.length,
        );
        set({ programs: uniquePrograms, loadingPrograms: false });
      } else {
        set({ loadingPrograms: false });
      }
    } catch (error) {
      console.error('[StudyStore] fetchPrograms failed:', error);
      set({ loadingPrograms: false });
    }
  },

  fetchTrainingAreas: async () => {
    set({ loadingTrainingAreas: true });
    try {
      const response = await studyService.getStudyCategories({
        page: 1,
        limit: 10,
      });

      if (response.success && response.data) {
        const items = Array.isArray(response.data)
          ? response.data
          : response.data.items || [];
        set({ trainingAreas: items, loadingTrainingAreas: false });
      } else {
        console.error(
          '[StudyStore] Training areas API failed:',
          response.message,
        );
        set({ loadingTrainingAreas: false });
      }
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Error fetching training areas';
      console.error('[StudyStore] fetchTrainingAreas FAILED:', msg);
      set({ loadingTrainingAreas: false });
    }
  },

  fetchSubCategories: async (categoryId: string) => {
    try {
      const response = await studyService.getSubCategoriesByCategoryId(
        categoryId,
      );
      if (response.success && response.data) {
        set(state => ({
          subCategories: {
            ...state.subCategories,
            [categoryId]: response.data || [],
          },
        }));
      }
    } catch (error) {
      console.error('Failed to fetch sub-categories', error);
    }
  },

  fetchStudyContent: async filters => {
    set({ loadingContent: true, error: null });
    try {
      // Dojo app logic:
      // ALWAYS pass limit=500, page=1, pagination=true for both category and program filters

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let queryParams: Record<string, any> = { ...filters };

      if (filters.categoryIds && filters.categoryIds.length > 0) {
        queryParams.limit = 500;
        queryParams.page = 1;
        queryParams.pagination = true;
      } else if (filters.programIds && filters.programIds.length > 0) {
        queryParams.limit = 500;
        queryParams.page = 1;
        queryParams.pagination = true;
      }

      const response = await studyService.getStudyContentForContact(
        queryParams,
      );

      if (response.success && response.data) {
        const items = Array.isArray(response.data)
          ? response.data
          : response.data.items || [];
        set({
          contentItems: items,
          loadingContent: false,
        });
      } else {
        throw new Error(response.message || 'Failed to fetch content');
      }
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : 'Error fetching study content';
      set({
        loadingContent: false,
        error: msg,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
