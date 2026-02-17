/**
 * Study React Query Hooks
 * Wraps study API calls with caching and state management
 */

import { useQuery } from '@tanstack/react-query';
import { studyService } from '../services/studyService';
import type { StudySearchParams } from '../types/study';

/**
 * Fetch study content for the logged-in student
 * Used for: Home → Programs row, Recently Watched, Search results
 */
export function useStudyContent(params?: StudySearchParams, enabled = true) {
    return useQuery({
        queryKey: ['studyContent', params],
        queryFn: () => studyService.getStudyContentForContact(params),
        enabled,
    });
}

/**
 * Fetch all study categories
 * Used for: Home → Training Area section
 */
export function useStudyCategories(params?: { search?: string; limit?: number; page?: number }) {
    return useQuery({
        queryKey: ['studyCategories', params],
        queryFn: () => studyService.getStudyCategories(params),
    });
}

/**
 * Fetch sub-categories (levels) for a specific category
 * Used for: Program Detail → Beginner / Intermediate / Advanced sections
 */
export function useSubCategories(categoryId: string, enabled = true) {
    return useQuery({
        queryKey: ['subCategories', categoryId],
        queryFn: () => studyService.getSubCategoriesByCategoryId(categoryId),
        enabled: enabled && !!categoryId,
    });
}

/**
 * Fetch single study content by ID
 * Used for: Video detail / playback
 */
export function useStudyContentById(contentId: string, enabled = true) {
    return useQuery({
        queryKey: ['studyContentDetail', contentId],
        queryFn: () => studyService.getStudyContentById(contentId),
        enabled: enabled && !!contentId,
    });
}
