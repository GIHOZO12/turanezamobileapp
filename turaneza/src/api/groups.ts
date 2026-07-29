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

export type GroupMembership = {
  id: number;
  group: number;
  user: { id: number; full_name: string; email: string; phone: string; country_code: string; role: string };
  role: 'member' | 'admin';
  status: 'active' | 'pending' | 'removed';
  joined_at: string;
};

type PaginatedResponse<T> = { count: number; next: string | null; previous: string | null; results: T[] };


export function fetchInvestGroups() {
  return apiFetch<PaginatedResponse<InvestGroup>>('/api/v1/groups/groups/');
}

export function fetchInvestGroup(id: number | string) {
  return apiFetch<InvestGroup>(`/api/v1/groups/groups/${id}/`);
}


export function fetchGroupDocuments(groupId: number | string) {
  return apiFetch<PaginatedResponse<GroupDocument>>(`/api/v1/groups/documents/?group=${groupId}`);
}


/**
 * GET /api/v1/groups/memberships/?group={id} — every membership row for that group (any status:
 * active/pending/removed), gated server-side to callers who are themselves an active member or
 * platform admin (silently returns empty otherwise, not a 403). Filter to status==="active" and
 * exclude the current user client-side to build a "pick someone to message" list.
 */
export function fetchGroupMembers(groupId: number | string) {
  return apiFetch<PaginatedResponse<GroupMembership>>(`/api/v1/groups/memberships/?group=${groupId}`);
}

export function sendPreJoinMessage(input: { groupId: number; recipientId: number; body: string }) {
  return apiFetch('/api/v1/groups/messages/', {
    method: 'POST',
    body: JSON.stringify({ group: input.groupId, recipient_id: input.recipientId, body: input.body }),
  });
}
