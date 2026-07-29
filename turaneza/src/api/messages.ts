import { apiFetch } from '@/api/client';

type MemberSummary = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  country_code: string;
  role: string;
};

export type GroupMessage = {
  id: number;
  group: number;
  sender: MemberSummary;
  recipient: MemberSummary | null;
  body: string;
  is_direct: boolean;
  created_at: string;
};

type PaginatedResponse<T> = { count: number; next: string | null; previous: string | null; results: T[] };

/**
 * GroupMessage.recipient is nullable: null = shared group feed (what "Group Chat" means here),
 * set = a private 1:1 thread with that specific member — pass recipientId to fetch that thread
 * instead of the shared feed (groups/views.py's GroupMessageViewSet.get_queryset).
 *
 * PAGE_SIZE is a global 6 (urban_evolution/settings.py) with no page_size override exposed, and
 * ordering is oldest-first — so page 1 alone would show the OLDEST 6 messages, not the most recent
 * ones a chat UI needs. This follows every `next` link to collect the full feed instead. Fine at
 * this app's current message volume; would need a real "latest page first" API to scale further.
 */
export async function fetchGroupMessages(groupId: string | number, recipientId?: string | number): Promise<GroupMessage[]> {
  const all: GroupMessage[] = [];
  let path: string | null = `/api/v1/groups/messages/?group=${groupId}${recipientId != null ? `&recipient=${recipientId}` : ''}`;
  while (path) {
    const page: PaginatedResponse<GroupMessage> = await apiFetch<PaginatedResponse<GroupMessage>>(path);
    all.push(...page.results);
    path = page.next ? page.next.replace(/^https?:\/\/[^/]+/, '') : null;
  }
  return all;
}

/** POST /api/v1/groups/messages/ — omitting recipientId posts to the shared group feed instead. */
export function sendGroupMessage(groupId: number, body: string, recipientId?: number) {
  return apiFetch<GroupMessage>('/api/v1/groups/messages/', {
    method: 'POST',
    body: JSON.stringify({ group: groupId, body, ...(recipientId != null ? { recipient_id: recipientId } : {}) }),
  });
}
