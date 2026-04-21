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

export type DojoCastSource = 'google_slides' | 'canva';
export type DojoCastAuthMethod = 'public' | 'oauth';
export type DojoCastSyncStatus = 'pending' | 'syncing' | 'synced' | 'error';
export type DojoCastTransitionType = 'fade' | 'slide' | 'none';

export interface DojoCastRenderedSlide {
  _id: string;
  deck: string;
  slideIndex: number;
  imageUrl: string;
  thumbnailUrl: string;
  videoUrl: string | null;
  videoDuration: number | null;
  width: number;
  height: number;
}

export interface DojoCastDeck {
  _id: string;
  dojo: string;
  source: DojoCastSource;
  sourceId: string;
  label: string;
  order: number;
  authMethod: DojoCastAuthMethod;
  syncIntervalMin: number;
  syncStatus: DojoCastSyncStatus;
  lastSyncAt: string | null;
  isActive: boolean;
  slides: DojoCastRenderedSlide[];
}

export interface DojoCastPlaylistConfig {
  dojo: string;
  defaultSlideDuration: number;
  transitionType: DojoCastTransitionType;
  transitionDuration: number;
  loopPlaylist: boolean;
  shuffleOrder: boolean;
  showClock: boolean;
  scheduleStart: string | null;
  scheduleEnd: string | null;
}

export interface DojoCastPlaylistResponse {
  decks: DojoCastDeck[];
  config: DojoCastPlaylistConfig;
  lastUpdatedAt: string;
  nextSyncAt: string;
}
