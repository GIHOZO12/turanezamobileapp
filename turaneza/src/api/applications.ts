import { apiFetch } from '@/api/client';

export type Occupation = 'employee' | 'entrepreneur' | 'student' | 'none' | 'other';
export type ApplicationStatus = 'pending' | 'review' | 'approved' | 'rejected' | 'withdrawn';

export type PickedFile = { uri: string; name: string; mimeType?: string | null };

/**
 * Only the fields the real product's join form actually asks for (matched against a screenshot
 * of the reference UI) — the backend's GroupApplication model has more fields than this
 * (age, gender, installment_option, has_co_investors, discussed_with_network,
 * comfortable_with_network, goal_alignment, meeting_preference, communication_channels), all with
 * model-level defaults, so omitting them here is fine — DRF just falls back to those defaults.
 */
export type GroupApplicationPayload = {
  group: number;
  name: string;
  email: string;
  phone_number: string;
  location: string;
  id_number: string;
  occupation: Occupation;
  motivation: string;
  skills: string;
  has_experience: boolean;
  financial_ready: boolean;
  understands_commitment: boolean;
  commitment_confirmation: boolean;
  notes?: string;
  consent_acknowledged: boolean;
};

export type GroupApplication = {
  id: number;
  group: number | null;
  status: ApplicationStatus;
  application_number: string;
  momo_payment_code: string;
  commitment_fee_amount_rwf: number;
  created_at: string;
};

type PaginatedResponse<T> = { count: number; next: string | null; previous: string | null; results: T[] };

/**
 * POST /api/v1/groups/applications/ — multipart because proof_of_funds/criminal_record are real
 * file uploads, not JSON. RN's fetch has a special case for FormData.append(key, {uri, name, type})
 * — it streams the file from that URI rather than needing an actual in-memory Blob.
 */
export function submitGroupApplication(
  payload: GroupApplicationPayload,
  files?: { proofOfFunds?: PickedFile; criminalRecord?: PickedFile }
) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(key, typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value));
  });
  if (files?.proofOfFunds) {
    appendFile(formData, 'proof_of_funds', files.proofOfFunds);
  }
  if (files?.criminalRecord) {
    appendFile(formData, 'criminal_record', files.criminalRecord);
  }

  return apiFetch<GroupApplication>('/api/v1/groups/applications/', {
    method: 'POST',
    body: formData,
  });
}

function appendFile(formData: FormData, field: string, file: PickedFile) {
  // @ts-expect-error — RN's FormData accepts this {uri, name, type} shape, the DOM FormData types don't know about it.
  formData.append(field, { uri: file.uri, name: file.name, type: file.mimeType ?? 'application/octet-stream' });
}

/**
 * GET /api/v1/groups/applications/ with no group filter — GroupApplicationViewSet scopes this to
 * "my own applications" for non-staff users (see groups/views.py), so this doubles as "which
 * groups have I already applied to / been approved for," used to decide "Join Group" vs
 * "View Group" vs "Pending Review" on plot cards without a dedicated is_member field.
 */
export function fetchMyApplications() {
  return apiFetch<PaginatedResponse<GroupApplication>>('/api/v1/groups/applications/');
}
