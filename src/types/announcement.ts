/**
 * Announcement (Notice Board) Types
 * Based on dojo-crm-frontend noticeBoard validation schemas
 */

import type { CommonApiResponse } from './auth';

export interface Announcement {
    _id: string;
    title: string;
    description: string;
    contactType: string;
    contactStatus: string;
    createdAt: string;
    updatedAt?: string;
    createdBy: {
        user: {
            _id: string;
            firstName: string;
            lastName: string;
            email: string;
        };
        role: {
            _id: string;
            name: string;
        };
    };
    dojo: string;
    contacts: string[];
}

export interface AnnouncementListing {
    items: Announcement[];
    limit: number;
    page: number;
    total: number;
    totalPages: number;
}

export type AnnouncementListResponse = CommonApiResponse<AnnouncementListing>;
