import { StudyContentItem } from '../types/study';

export const validateImageRegex = /\.(jpg|jpeg|png|svg|gif)$/i;

export function getImageUrl(item: StudyContentItem): string | undefined {
    // 1. Check contentLink if it acts as a thumbnail (is an image)
    if (item.contentLink && validateImageRegex.test(item.contentLink)) {
        return item.contentLink;
    }
    // 2. Check category image
    if (item.category?.image) {
        return item.category.image;
    }
    // 3. Check event image (fallback)
    if (item.event?.imageUrl) {
        return item.event.imageUrl;
    }
    return undefined;
}

const CATEGORY_ICONS: Record<string, string> = {
    'karate': 'sports-martial-arts',
    'forms': 'self-improvement',
    'sparring': 'sports-kabaddi',
    'weapons': 'gavel',
    'fitness': 'fitness-center',
    'default': 'school',
};

export function getCategoryIcon(name: string): string {
    const key = name.toLowerCase();
    return (
        Object.entries(CATEGORY_ICONS).find(([k]) => key.includes(k))?.[1] ||
        CATEGORY_ICONS.default
    );
}
