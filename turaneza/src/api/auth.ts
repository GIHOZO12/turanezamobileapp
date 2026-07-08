import { apiFetch } from '@/api/client';

export type UserMe = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  country_code: string;
  role: string;
  verification: 'pending' | 'verified' | 'rejected';
  twofa_enabled: boolean;
  is_email_verified: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_super_admin: boolean;
  deposit_paid: boolean;
};

export function signup(input: { fullName: string; email: string; password: string; phone?: string }) {
  return apiFetch<{ full_name: string; email: string; phone: string; country_code: string }>('/api/v1/users/signup/', {
    method: 'POST',
    body: JSON.stringify({
      full_name: input.fullName,
      email: input.email,
      password: input.password,
      phone: input.phone ?? '',
    }),
  });
}

export function verifyEmail(input: { email: string; code: string }) {
  return apiFetch<{ message: string }>('/api/v1/users/verify/', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function resendVerificationCode(input: { email: string }) {
  return apiFetch<{ message: string }>('/api/v1/users/resend/', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function login(input: { email: string; password: string }) {
  return apiFetch<{ message: string }>('/api/v1/users/login/', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/**
 * POST /api/v1/users/token/ — NOT part of the backend yet; see the MobileTokenView snippet
 * flagged separately. Reuses the same LoginSerializer as /login/ (so email verification etc.
 * is enforced identically) but returns JWT tokens instead of a session cookie, which is what
 * lets the app do authenticated mutations (applications, payments, ...) without hitting
 * Django's CSRF protection. Until that endpoint exists this 404s — callers treat that as
 * "mutations aren't available yet" rather than a hard failure, since sign-in/browsing still
 * work fine on the session cookie alone.
 */
export function fetchMobileToken(input: { email: string; password: string }) {
  return apiFetch<{ access: string; refresh: string }>('/api/v1/users/token/', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function requestPasswordReset(input: { email: string }) {
  return apiFetch<{ message: string }>('/api/v1/users/password-reset/', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/** Session-authenticated — relies on the cookie jar already holding a valid sessionid. */
export function fetchMe() {
  return apiFetch<UserMe>('/api/v1/users/me/');
}
