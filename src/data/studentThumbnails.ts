import type { ImageSourcePropType } from 'react-native';

/**
 * Bundled student thumbnails.
 *
 * Files live in `assets/student/program/` (and later `training-area/`),
 * named with URL-safe lowercase + underscore. iOS won't fetch asset URLs
 * with raw spaces or commas, so filenames are kept simple and the alias
 * list lives here in source.
 *
 * To add a new image:
 *   1. Drop the .png into `assets/student/program/` with a snake_case name.
 *   2. Add a `require()` entry to ASSETS below (RN bundler can't resolve
 *      dynamic require strings — every file must be listed).
 *   3. Add one or more entries to ALIAS_TO_KEY mapping API name strings
 *      to the asset key. Multiple aliases can point at the same key.
 *
 * Lookup is case- and whitespace-insensitive (see `normalize`).
 */

const ASSETS = {
  // Programs (14 files — multiple aliases each via ALIAS_TO_KEY below)
  ata: require('../../assets/student/program/ata.png'),
  ata_tigers: require('../../assets/student/program/ata_tigers.png'),
  dragons: require('../../assets/student/program/dragons.png'),
  jiu_jitsu: require('../../assets/student/program/jiu_jitsu.png'),
  karate: require('../../assets/student/program/karate.png'),
  kickboxing: require('../../assets/student/program/kickboxing.png'),
  kids: require('../../assets/student/program/kids.png'),
  krav_maga: require('../../assets/student/program/krav_maga.png'),
  kung_fu: require('../../assets/student/program/kung_fu.png'),
  taekwondo: require('../../assets/student/program/taekwondo.png'),
  tai_chi: require('../../assets/student/program/tai_chi.png'),
  warrior: require('../../assets/student/program/warrior.png'),
  leadership: require('../../assets/student/program/leadership.png'),
  legacy: require('../../assets/student/program/legacy.png'),
  // Training areas (10 files — single alias each, name == filename)
  board_breaking: require('../../assets/student/training-area/board_breaking.png'),
  chi_building: require('../../assets/student/training-area/chi_building.png'),
  conditioning: require('../../assets/student/training-area/conditioning.png'),
  floor_walking: require('../../assets/student/training-area/floor_walking.png'),
  forms: require('../../assets/student/training-area/forms.png'),
  general: require('../../assets/student/training-area/general.png'),
  meditation: require('../../assets/student/training-area/meditation.png'),
  sparring: require('../../assets/student/training-area/sparring.png'),
  temple_exercises: require('../../assets/student/training-area/temple_exercises.png'),
  weapons: require('../../assets/student/training-area/weapons.png'),
  balance_structure: require('../../assets/student/training-area/balance_structure.png'),
} as const;

type AssetKey = keyof typeof ASSETS;

// Alias → asset key. Many → one. Lookup is case- and
// whitespace-insensitive after `normalize` runs.
const ALIAS_TO_KEY: Record<string, AssetKey> = {
  // ata
  ata: 'ata',
  'ata taekwondo': 'ata',
  // ata_tigers
  'ata tigers': 'ata_tigers',
  'tiny tigers': 'ata_tigers',
  tigers: 'ata_tigers',
  // dragons
  dragons: 'dragons',
  'lil dragons': 'dragons',
  "lil' dragons": 'dragons',
  // jiu_jitsu
  'jiu jitsu': 'jiu_jitsu',
  jujitsu: 'jiu_jitsu',
  bjj: 'jiu_jitsu',
  'brazilian jiu jitsu': 'jiu_jitsu',
  'brazilian ju jitsu': 'jiu_jitsu',
  judo: 'jiu_jitsu',
  wrestling: 'jiu_jitsu',
  // karate
  karate: 'karate',
  adult: 'karate',
  teen: 'karate',
  // kickboxing
  kickboxing: 'kickboxing',
  fit: 'kickboxing',
  fitness: 'kickboxing',
  // kids
  kids: 'kids',
  mak: 'kids',
  'martial arts kids': 'kids',
  'martial art kids': 'kids',
  // krav_maga
  'krav maga': 'krav_maga',
  kravmaga: 'krav_maga',
  // kung_fu
  'kung fu': 'kung_fu',
  shaolin: 'kung_fu',
  chinese: 'kung_fu',
  // taekwondo
  taekwondo: 'taekwondo',
  tkd: 'taekwondo',
  // tai_chi
  'tai chi': 'tai_chi',
  // warrior
  warrior: 'warrior',
  boxing: 'warrior',
  'muay thai': 'warrior',
  kenpo: 'warrior',
  kempo: 'warrior',
  // leadership
  leadership: 'leadership',
  champion: 'leadership',
  champions: 'leadership',
  // legacy
  legacy: 'legacy',
  instructor: 'legacy',
  cit: 'legacy',
  // Training-area aliases — single name each. Add more entries here if
  // the API returns alternate spellings (e.g. 'free sparring' → 'sparring').
  'board breaking': 'board_breaking',
  'chi building': 'chi_building',
  conditioning: 'conditioning',
  'floor walking': 'floor_walking',
  forms: 'forms',
  general: 'general',
  meditation: 'meditation',
  sparring: 'sparring',
  'temple exercises': 'temple_exercises',
  'temple excercises': 'temple_exercises', // common API misspelling
  weapons: 'weapons',
  'balance structure': 'balance_structure',
};

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Returns the bundled thumbnail for a program / training-area name, or
 * `undefined` if no alias matches. Callers should treat `undefined` as
 * "no thumbnail" and fall back to whatever placeholder their card uses.
 */
export function resolveStudentThumbnail(
  name?: string | null,
): ImageSourcePropType | undefined {
  if (!name) return undefined;
  const key = ALIAS_TO_KEY[normalize(name)];
  return key ? ASSETS[key] : undefined;
}
