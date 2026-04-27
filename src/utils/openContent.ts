import type { NavigationProp } from '@react-navigation/native';
import { getMediaType } from './getMediaType';
import type { StudentStackParamList } from '../navigation';

export interface OpenableContent {
  contentLink?: string;
  title?: string;
  _id?: string;
}

/**
 * Dispatch navigation based on the content's URL pattern.
 *
 * - video → VideoPlayer
 * - pdf   → PdfViewer
 * - image → ImageViewer
 * - unknown → no-op (caller is free to ignore unsupported content)
 */
export function openContent(
  navigation: NavigationProp<StudentStackParamList>,
  item: OpenableContent,
): void {
  const url = item.contentLink ?? '';
  const type = getMediaType(url);
  const title = item.title ?? '';
  const contentId = item._id ?? '';

  switch (type) {
    case 'video':
      navigation.navigate('VideoPlayer', {
        videoUrl: url,
        title,
        contentId,
      });
      return;
    case 'pdf':
      navigation.navigate('PdfViewer', { url, title, contentId });
      return;
    case 'image':
      navigation.navigate('ImageViewer', { url, title, contentId });
      return;
    case 'unknown':
      return;
  }
}
