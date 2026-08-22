import { apiFetch } from '@/services/api-client';
import type { SellerProfile, User } from '@/types/auth';

/** The signed-in seller as the server has them — read fresh rather than from the stored session,
 *  which is only as new as the last sign-in. */
export function getSellerProfile() {
  return apiFetch<User>('/api/sellers/me');
}

export function updateSellerProfile(profile: SellerProfile) {
  return apiFetch<User>('/api/sellers/profile', {
    method: 'PUT',
    body: JSON.stringify(profile),
  });
}
