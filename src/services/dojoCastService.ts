/**
 * Dojo Cast Service
 * API calls for the new Dojo Cast playlist endpoint.
 */

import axiosInstance from './axios';
import { ApiEndpoints } from '../config/apiEndpoints';
import type { CommonApiResponse } from '../types/auth';
import type { DojoCastPlaylistResponse } from '../types/dojo';

export async function getDojoCastPlaylist(
  dojoId: string,
): Promise<CommonApiResponse<DojoCastPlaylistResponse>> {
  const { data } = await axiosInstance.get(
    `${ApiEndpoints.DojoCastPlaylist}/${dojoId}`,
  );
  return data;
}
