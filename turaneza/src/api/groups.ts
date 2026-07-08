import { apiFetch } from '@/api/client';

export type InvestGroup = {
  id: number;
  name: string;
  reference_code: string;
  slug: string;
  description: string;
  status: 'active' | 'inactive' | 'archived';
  max_members: number;
  min_investment: string;
  total_units: number;
  building_cost: string;
  plot_location: string;
  plot_size_sqm: string | null;
  land_registration_status: string;
  land_registration_status_label: string;
  land_title_number: string;
  proposed_house_description: string;
  member_unit_share: string;
  funding_progress: { contributed: string; required: string; percent: number };
  created_by: { id: number; full_name: string; email: string; phone: string; country_code: string; role: string };
  members_count: number;
  created_at: string;
  updated_at: string;
};

export type GroupDocument = {
  id: number;
  group: number;
  title: string;
  document_type: 'architectural' | 'boq' | 'legal' | 'other';
  file: string;
  uploaded_by: { id: number; full_name: string; email: string } | null;
  uploaded_at: string;
};

type PaginatedResponse<T> = { count: number; next: string | null; previous: string | null; results: T[] };

/**
 * GET /api/v1/groups/groups/ (InvestGroupViewSet) — this is what the mockup and the app itself
 * call a "plot": a co-investment group anchored to one raw land parcel, not the `projects`
 * app's `Project` model (that's built/income-producing real estate, a different concept).
 * IsAuthenticatedOrReadOnly, but the app is already signed in by the time this screen renders.
 * No server-side search/filter is wired up for this viewset (no filterset/search_fields
 * configured), so filtering happens client-side over whatever page is in memory.
 */
export function fetchInvestGroups() {
  return apiFetch<PaginatedResponse<InvestGroup>>('/api/v1/groups/groups/');
}

export function fetchInvestGroup(id: number | string) {
  return apiFetch<InvestGroup>(`/api/v1/groups/groups/${id}/`);
}

/**
 * GET /api/v1/groups/documents/?group={id} — IsAuthenticated, and further scoped server-side to
 * staff/admins or active members of that specific group (regular non-members get an empty list
 * back, not a 403 — the endpoint itself doesn't require group membership, just being signed in).
 */
export function fetchGroupDocuments(groupId: number | string) {
  return apiFetch<PaginatedResponse<GroupDocument>>(`/api/v1/groups/documents/?group=${groupId}`);
}

/**
 * POST /api/v1/groups/messages/ — a non-member messaging a group's admin before applying.
 * GroupMessageSerializer.validate() specifically allows this: a non-member's message is only
 * accepted if `recipient_id` is the group's actual admin (checked server-side), which is exactly
 * `group.created_by.id`. Unlike applications, this viewset already carries a CSRF-exempt session
 * auth class (see groups/views.py), so it works even before the JWT token endpoint exists.
 */
export function sendPreJoinMessage(input: { groupId: number; recipientId: number; body: string }) {
  return apiFetch('/api/v1/groups/messages/', {
    method: 'POST',
    body: JSON.stringify({ group: input.groupId, recipient_id: input.recipientId, body: input.body }),
  });
}
