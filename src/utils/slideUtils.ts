/**
 * Shared utility functions for Dojo Cast slide URLs.
 */

/**
 * Returns a preview/thumbnail image URL for a slide.
 * - Google Slides: exports the first slide as JPEG via the public export endpoint.
 * - Canva: no public thumbnail URL available — returns null (shows placeholder).
 */
export function getSlidePreviewUrl(url: string): string | null {
  if (url.includes('docs.google.com/presentation')) {
    const match = url.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
      return `https://docs.google.com/presentation/d/${match[1]}/export/jpeg`;
    }
  }
  return null;
}
