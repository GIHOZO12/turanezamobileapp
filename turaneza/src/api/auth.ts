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


export function fetchMobileToken(input: { email: string; password: string }) {
  return apiFetch<{ access: string; refresh: string }>('/api/v1/users/token/', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function googleAuth(input: { credential: string }) {
  return apiFetch<{ access: string; refresh: string }>('/api/v1/users/google/token/', {
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

export function confirmPasswordReset(input: { email: string; code: string; password: string; confirmPassword: string }) {
  return apiFetch<{ message: string }>('/api/v1/users/password-reset/confirm/', {
    method: 'POST',
    body: JSON.stringify({
      email: input.email,
      code: input.code,
      password: input.password,
      confirm_password: input.confirmPassword,
    }),
  });
}


export function fetchMe() {
  return apiFetch<UserMe>('/api/v1/users/me/');
}


export function logout() {
  return apiFetch<{ message: string }>('/api/v1/users/logout/', { method: 'POST' });
}
