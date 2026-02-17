/**
 * Announcements React Query Hook
 * Wraps announcement API calls with caching
 */

import { useQuery } from '@tanstack/react-query';
import { announcementService } from '../services/announcementService';

/**
 * Fetch announcements for the logged-in student
 * Used for: Announcements screen
 */
export function useAnnouncements(
    params?: { search?: string; limit?: number; page?: number },
    enabled = true
) {
    return useQuery({
        queryKey: ['announcements', params],
        queryFn: () => announcementService.getAnnouncementsForContact(params),
        enabled,
    });
}
