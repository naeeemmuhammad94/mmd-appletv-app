/**
 * Dojo Cast Service
 * API calls for Dojo Cast slides
 */

import axiosInstance from './axios';
import { ApiEndpoints } from '../config/apiEndpoints';
import type { CommonApiResponse } from '../types/auth';
import type { DojoCastSlide } from '../types/dojo';

interface DojoCastSlidesResponse {
  items: DojoCastSlide[];
}

/**
 * Get dojo cast slides for the current dojo
 */
export async function getDojoCastSlides(): Promise<
  CommonApiResponse<DojoCastSlidesResponse>
> {
  const { data } = await axiosInstance.get(ApiEndpoints.DojoCastSlides);
  return data;
}
