import { apiFetch } from '@/api/client';

export type NotificationCategory = 'general' | 'payment' | 'project' | 'compliance' | 'governance' | 'support';

export type AppNotification = {
  id: number;
  category: NotificationCategory;
  title: string;
  body: string;
  data: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

type PaginatedResponse<T> = { count: number; next: string | null; previous: string | null; results: T[] };


export function fetchNotifications() {
  return apiFetch<PaginatedResponse<AppNotification>>('/api/v1/notifications/notifications/');
}

export function markNotificationRead(id: number) {
  return apiFetch<AppNotification>(`/api/v1/notifications/notifications/${id}/mark-read/`, { method: 'POST' });
}

export function markAllNotificationsRead() {
  return apiFetch<{ message: string }>('/api/v1/notifications/notifications/mark-all-read/', { method: 'POST' });
}
