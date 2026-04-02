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
