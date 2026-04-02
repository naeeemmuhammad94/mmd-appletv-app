/**
 * Dojo Cast Slides React Query Hook
 * Fetches available Google Slides presentations for Dojo Cast
 */

import { useQuery } from '@tanstack/react-query';
import { getDojoCastSlides } from '../services/dojoCastService';

export function useDojoCastSlides(enabled = true) {
  return useQuery({
    queryKey: ['dojo-cast-slides'],
    queryFn: getDojoCastSlides,
    enabled,
  });
}
