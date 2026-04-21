/**
 * Dojo Cast Playlist React Query Hook
 * Fetches the full deck+slide playlist for a given dojo.
 */

import { useQuery } from '@tanstack/react-query';
import { getDojoCastPlaylist } from '../services/dojoCastService';

export function useDojoCastPlaylist(dojoId: string | null) {
  return useQuery({
    queryKey: ['dojo-cast-playlist', dojoId],
    queryFn: () => getDojoCastPlaylist(dojoId as string),
    enabled: Boolean(dojoId),
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  });
}
