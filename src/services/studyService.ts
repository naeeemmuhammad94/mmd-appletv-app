/**
 * Study Service
 * API calls for study content, categories, and sub-categories
 * Mirrors dojo-crm-frontend studyContentServices
 */

import { AxiosError } from 'axios';
import axiosInstance from './axios';
import { ApiEndpoints } from '../config/apiEndpoints';
import type { CommonApiResponse } from '../types/auth';
import type {
    StudyContentListing,
    StudyContentItem,
    StudyCategoryListing,
    StudySubCategory,
    StudySearchParams,
    StudyProgram,
} from '../types/study';

/**
 * Get study content for the logged-in contact/student
 * CRM equivalent: getStudyContact() → GET /study-content/getStudyForContact
 */
export async function getStudyContentForContact(
    params?: StudySearchParams
): Promise<CommonApiResponse<StudyContentListing>> {
    try {
        const response = await axiosInstance.get<CommonApiResponse<StudyContentListing>>(
            ApiEndpoints.StudyContentForContact,
            { params }
        );
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<CommonApiResponse<null>>;
        throw {
            success: false,
            error: true,
            message: axiosError.response?.data?.message || 'Failed to fetch study content.',
            data: null,
        };
    }
}

/**
 * Get study content (admin-accessible endpoint)
 * Dojo-app equivalent: GET /study-content/?withoutPagination=true
 */
export async function getStudyContent(
    params?: StudySearchParams
): Promise<CommonApiResponse<StudyContentListing>> {
    try {
        const response = await axiosInstance.get<CommonApiResponse<StudyContentListing>>(
            ApiEndpoints.StudyContent,
            { params }
        );
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<CommonApiResponse<null>>;
        throw {
            success: false,
            error: true,
            message: axiosError.response?.data?.message || 'Failed to fetch study content.',
            data: null,
        };
    }
}

/**
 * Get single study content by ID
 * CRM equivalent: getStudyContentById() → GET /study-content/{id}
 */
export async function getStudyContentById(
    contentId: string
): Promise<CommonApiResponse<StudyContentItem>> {
    try {
        const response = await axiosInstance.get<CommonApiResponse<StudyContentItem>>(
            ApiEndpoints.StudyContent + contentId
        );
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<CommonApiResponse<null>>;
        throw {
            success: false,
            error: true,
            message: axiosError.response?.data?.message || 'Failed to fetch study content detail.',
            data: null,
        };
    }
}

/**
 * Get study categories
 * CRM equivalent: getCategory() → GET /study-category
 */
export async function getStudyCategories(
    params?: { search?: string; limit?: number; page?: number }
): Promise<CommonApiResponse<StudyCategoryListing>> {
    try {
        const response = await axiosInstance.get<CommonApiResponse<StudyCategoryListing>>(
            ApiEndpoints.StudyCategory,
            { params }
        );
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<CommonApiResponse<null>>;
        throw {
            success: false,
            error: true,
            message: axiosError.response?.data?.message || 'Failed to fetch study categories.',
            data: null,
        };
    }
}

/**
 * Get sub-categories for a category (levels like Beginner / Intermediate / Advanced)
 * CRM equivalent: getSubCategoryAgainstCategory() → GET /study-category/sub-category-by-category-id/{id}
 */
export async function getSubCategoriesByCategoryId(
    categoryId: string
): Promise<CommonApiResponse<StudySubCategory[]>> {
    try {
        const response = await axiosInstance.get<CommonApiResponse<StudySubCategory[]>>(
            ApiEndpoints.SubCategoryByCategoryId + categoryId
        );
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<CommonApiResponse<null>>;
        throw {
            success: false,
            error: true,
            message: axiosError.response?.data?.message || 'Failed to fetch sub-categories.',
            data: null,
        };
    }
}

/**
 * Get programs, tags, and clubs
 * Returns { programs: [...], tags: [...], clubs: [...] }
 */
export async function getPrograms(): Promise<CommonApiResponse<{ programs: StudyProgram[]; tags: any[]; clubs: any[] }>> {
    try {
        const response = await axiosInstance.get<CommonApiResponse<{ programs: StudyProgram[]; tags: any[]; clubs: any[] }>>(
            ApiEndpoints.GetPrograms
        );
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<CommonApiResponse<null>>;
        throw {
            success: false,
            error: true,
            message: axiosError.response?.data?.message || 'Failed to fetch programs.',
            data: null,
        };
    }
}

/**
 * Get all sub-categories globally
 * GET /study-category/get-all-sub-category
 */
export async function getAllSubCategories(): Promise<CommonApiResponse<StudySubCategory[]>> {
    try {
        const response = await axiosInstance.get<CommonApiResponse<StudySubCategory[]>>(
            ApiEndpoints.GetAllSubCategories
        );
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<CommonApiResponse<null>>;
        throw {
            success: false,
            error: true,
            message: axiosError.response?.data?.message || 'Failed to fetch all sub-categories.',
            data: null,
        };
    }
}

export const studyService = {
    getStudyContentForContact,
    getStudyContent,
    getStudyContentById,
    getStudyCategories,
    getSubCategoriesByCategoryId,
    getPrograms,
    getAllSubCategories,
};

export default studyService;
