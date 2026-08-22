import { apiFetch } from '@/services/api-client';
import type { AuthResponse, LoginRequest, SellerAccountRequest } from '@/types/auth';

export function login(request: LoginRequest) {
  return apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/** Registers from here: a seller account, without access to the farm software. */
export function registerSeller(request: SellerAccountRequest) {
  return apiFetch<AuthResponse>('/api/auth/register-seller', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
