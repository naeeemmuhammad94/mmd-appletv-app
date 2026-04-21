/**
 * Type-safe helpers for extracting user info from the auth store.
 *
 * The auth store's `user` field has two possible shapes:
 * - Post-login: `CurrentUser` with nested `user.user.email`, `user.user.firstName`
 * - Post-storage-reload: may be a flat `{ _id, email, firstName, ... }` if stored differently
 *
 * These selectors handle both shapes safely.
 */
import type { CurrentUser } from '../types/auth';

type MaybeUser = CurrentUser | null;

export function getUserEmail(user: MaybeUser): string {
  if (!user) return '';
  // Nested shape: user.user.email
  if (user.user && typeof user.user === 'object' && 'email' in user.user) {
    return user.user.email || '';
  }
  // Flat shape fallback
  const flat = user as unknown as Record<string, unknown>;
  if ('email' in flat && typeof flat.email === 'string') {
    return flat.email;
  }
  return '';
}

export function getUserFirstName(user: MaybeUser): string {
  if (!user) return '';
  // Nested shape: user.user.firstName
  if (user.user && typeof user.user === 'object' && 'firstName' in user.user) {
    return user.user.firstName || '';
  }
  // Flat shape fallback
  const flat = user as unknown as Record<string, unknown>;
  if ('firstName' in flat && typeof flat.firstName === 'string') {
    return flat.firstName;
  }
  return '';
}

export function getUserLastName(user: MaybeUser): string {
  if (!user) return '';
  // Nested shape: user.user.lastName
  if (user.user && typeof user.user === 'object' && 'lastName' in user.user) {
    const ln = (user.user as { lastName?: string }).lastName;
    return ln || '';
  }
  // Flat shape fallback
  const flat = user as unknown as Record<string, unknown>;
  if ('lastName' in flat && typeof flat.lastName === 'string') {
    return flat.lastName;
  }
  return '';
}

/**
 * Returns the user's full name (firstName + lastName). Falls back to firstName
 * alone, then email, then empty string.
 */
export function getUserFullName(user: MaybeUser): string {
  if (!user) return '';
  const first = getUserFirstName(user);
  const last = getUserLastName(user);
  const full = [first, last].filter(Boolean).join(' ').trim();
  return full || first || getUserEmail(user);
}

/**
 * Normalizes a backend role name (e.g., "Student", "Dojo Cast", "Admin") to
 * one of the app's internal role identifiers. Returns null if unrecognized.
 */
export function normalizeBackendRole(
  name: string | undefined | null,
): 'student' | 'dojo' | 'admin' | null {
  if (!name || typeof name !== 'string') return null;
  const n = name.toLowerCase().trim();
  if (n.includes('dojo')) return 'dojo';
  if (n.includes('admin')) return 'admin';
  if (n.includes('student')) return 'student';
  return null;
}

/**
 * Extracts the backend role name from a CurrentUser, handling both nested
 * (user.userRole.role.name) and flat (user.userRole.role.name) shapes.
 */
export function getBackendRoleName(user: MaybeUser): string {
  if (!user) return '';
  // Try standard nested shape
  const ur = (user as { userRole?: { role?: { name?: string } } }).userRole;
  if (ur?.role?.name) return ur.role.name;
  return '';
}

/** Human-readable label for an app role. */
export function roleLabel(role: 'student' | 'dojo' | 'admin'): string {
  switch (role) {
    case 'student':
      return 'Students';
    case 'dojo':
      return 'Dojo Cast';
    case 'admin':
      return 'Admin';
    default:
      return role;
  }
}

/**
 * Returns the dojoId associated with the authed user, or null.
 *
 * On this backend the login response has a top-level `dojo: { _id, owner, ... }`
 * where `_id` is the dojo document id and `owner` is the user's `_id` string.
 * Some other surfaces (`dojo-crm-frontend`) use `dojoDetail` instead of `dojo`,
 * so we check both. We do NOT fall back to `dojo.owner` — that's the user's id,
 * not the dojo's id.
 *
 * Cascade:
 *   1. `user.dojo._id`              — current backend shape (preferred)
 *   2. `user.dojoDetail._id`        — CRM-frontend shape
 *   3. nested `user.user.dojo._id` / `user.user.dojoDetail._id`
 *   4. `user.dojoId` string field   — some API surfaces return this
 *   5. `user._id` / `user.user._id` — last-resort (only correct for accounts
 *                                     where the user record IS the dojo)
 */
export function selectDojoId(user: unknown): string | null {
  if (!user || typeof user !== 'object') return null;
  const u = user as Record<string, unknown>;
  const nested = u.user as Record<string, unknown> | undefined;

  const pickId = (dojoLike: unknown): string | null => {
    if (!dojoLike || typeof dojoLike !== 'object') return null;
    const d = dojoLike as Record<string, unknown>;
    if (typeof d._id === 'string' && d._id) return d._id;
    return null;
  };

  // 1–3: explicit dojo-association fields (flat or nested)
  const candidates: unknown[] = [
    u.dojo,
    u.dojoDetail,
    nested?.dojo,
    nested?.dojoDetail,
  ];
  for (const c of candidates) {
    const id = pickId(c);
    if (id) return id;
  }

  // 4: direct dojoId string field
  if (typeof u.dojoId === 'string' && u.dojoId) return u.dojoId;
  if (nested && typeof nested.dojoId === 'string' && nested.dojoId) {
    return nested.dojoId;
  }

  // 5: last-resort (legacy — only correct when account == dojo)
  if (typeof u._id === 'string' && u._id) return u._id;
  if (nested && typeof nested._id === 'string' && nested._id) return nested._id;

  return null;
}
