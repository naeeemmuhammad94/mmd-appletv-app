/**
 * API Endpoints configuration
 * Matches dojo-crm-frontend and mmd-kiosk-app
 */

export enum ApiEndpoints {
    // Auth endpoints
    Login = '/user/login',
    Logout = '/user/logout',
    CurrentUser = '/user/current-user',
    SendEmailToResetPassword = '/user/send-email-to-reset-password',

    // Curriculum endpoints
    GetPrograms = '/program-tag-club',

    // Study Content
    StudyContent = '/study-content/',
    StudyContentForContact = '/study-content/getStudyForContact',

    // Study Categories & Sub-Categories
    StudyCategory = '/study-category',
    StudyCategoryById = '/study-category/',
    SubCategoryByCategoryId = '/study-category/sub-category-by-category-id/',

    // Notice Board (Announcements)
    NoticeBoardForContact = '/notice-board/getNoticeBoardForContact',
}
