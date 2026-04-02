export interface DojoProgram {
  id: string;
  title: string;
  subtitle: string;
  level: string;
  slideCount: number;
  week: number;
  /** Whether this program's slides are currently synced/active */
  isActive: boolean;
  /** Placeholder image URI or require() source */
  image?: string;
}

export interface DojoSlide {
  id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
}

export type DojoCastConnectionStatus = 'disconnected' | 'connected' | 'error';

export interface DojoCastSlide {
  dojo: string;
  url: string;
  label: string;
  order: number;
  _id: string;
  type: string;
}
