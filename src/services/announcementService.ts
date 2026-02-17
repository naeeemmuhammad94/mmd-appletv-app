/**
 * Announcement Service
 * API calls for notice board / announcements
 * Mirrors dojo-crm-frontend noticeBoardServices
 */

import { AxiosError } from 'axios';
import axiosInstance from './axios';
import { ApiEndpoints } from '../config/apiEndpoints';
import type { CommonApiResponse } from '../types/auth';
import type { AnnouncementListing } from '../types/announcement';

/**
 * Get announcements for the logged-in contact/student
 * CRM equivalent: getStudentNoticeBoardList() → GET /notice-board/getNoticeBoardForContact
 */
export async function getAnnouncementsForContact(
    params?: { search?: string; limit?: number; page?: number }
): Promise<CommonApiResponse<AnnouncementListing>> {
    try {
        const response = await axiosInstance.get<CommonApiResponse<AnnouncementListing>>(
            ApiEndpoints.NoticeBoardForContact,
            { params }
        );
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<CommonApiResponse<null>>;
        throw {
            success: false,
            error: true,
            message: axiosError.response?.data?.message || 'Failed to fetch announcements.',
            data: null,
        };
    }
}

export const announcementService = {
    getAnnouncementsForContact,
};

export default announcementService;
