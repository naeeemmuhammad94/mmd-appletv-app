/**
 * Study Content Types
 * Based on dojo-crm-frontend validation schemas
 */

import type { CommonApiResponse } from './auth';

// ── Category ──────────────────────────────────────────────────────────────────

export interface StudyCategory {
    _id: string;
    dojo: string;
    name: string;
    image?: string;
}

export interface StudyCategoryListing {
    items: StudyCategory[];
    limit: number;
    page: number;
    total: number;
    totalPages: number;
}

// ── Sub-Category (Beginner / Intermediate / Advanced levels) ─────────────────

export interface StudySubCategory {
    _id: string;
    name: string;
    studyCategoryId: string;
}

// ── Tag ───────────────────────────────────────────────────────────────────────

export interface StudyTag {
    _id: string;
    name: string;
    type: string;
    createdBy?: string;
    dojo?: string;
}

// ── Program ───────────────────────────────────────────────────────────────────

export interface StudyProgram {
    _id: string;
    name: string;
    type: string;
    createdBy?: string;
    dojo?: string;
}

// ── Rank ──────────────────────────────────────────────────────────────────────

export interface StudyRank {
    _id: string;
    rankName: string;
    rankOrder: number;
    rankColor: string;
    stripeImage?: string;
    stripeType?: string;
    numberOfStripe?: number;
    stripeColor?: string;
    program?: StudyProgram;
}

// ── Single Study Content (video / lesson) ────────────────────────────────────

export interface StudyContentItem {
    _id: string;
    title: string;
    contentLink: string;
    category: StudyCategory;
    subCategoryId?: string;
    order: number;
    tags: StudyTag[];
    programs?: StudyProgram[];
    ranks?: StudyRank[];
    event?: {
        _id: string;
        title: string;
        imageUrl?: string;
        description?: string;
    };
    dojo?: string;
}

// ── Paginated Listing ────────────────────────────────────────────────────────

export interface StudyContentListing {
    items: StudyContentItem[];
    limit: number;
    page: number;
    total: number;
    totalPages: number;
    categoryIds?: string[];
    titlesIds?: string[];
    programIds?: string[];
    tagIdsSet?: string[];
    clubsSet?: string[];
}

// ── Search Params ────────────────────────────────────────────────────────────

export interface StudySearchParams {
    search?: string;
    limit?: number;
    page?: number;
    programIds?: string[];
    categoryIds?: string[];
    titles?: string[];
    tagIds?: string[];
    clubIds?: string[];
}

// ── API Response Shortcuts ───────────────────────────────────────────────────

export type StudyContentResponse = CommonApiResponse<StudyContentListing>;
export type StudyCategoryResponse = CommonApiResponse<StudyCategoryListing>;
export type SingleStudyContentResponse = CommonApiResponse<StudyContentItem>;
export type SubCategoryResponse = CommonApiResponse<StudySubCategory[]>;
