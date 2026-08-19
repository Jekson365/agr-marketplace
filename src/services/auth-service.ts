import { apiFetch } from '@/services/api-client';
import type { AuthResponse, LoginRequest } from '@/types/auth';

/** The same endpoint the web SPA signs in against; the token it returns is good for either. */
export function login(request: LoginRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
