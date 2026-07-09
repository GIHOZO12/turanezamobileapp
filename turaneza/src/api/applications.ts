import { apiFetch, readFileAsBlob } from '@/api/client';

export type Occupation = 'employee' | 'entrepreneur' | 'student' | 'none' | 'other';
export type ApplicationStatus = 'pending' | 'review' | 'approved' | 'rejected' | 'withdrawn';

export type PickedFile = { uri: string; name: string; mimeType?: string | null };


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
  commitment_fee_proof: string | null;
  created_at: string;
};

type PaginatedResponse<T> = { count: number; next: string | null; previous: string | null; results: T[] };


export async function submitGroupApplication(
  payload: GroupApplicationPayload,
  files?: { proofOfFunds?: PickedFile; criminalRecord?: PickedFile }
) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(key, typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value));
  });
  if (files?.proofOfFunds) {
    await appendFile(formData, 'proof_of_funds', files.proofOfFunds);
  }
  if (files?.criminalRecord) {
    await appendFile(formData, 'criminal_record', files.criminalRecord);
  }

  return apiFetch<GroupApplication>('/api/v1/groups/applications/', {
    method: 'POST',
    body: formData,
  });
}

async function appendFile(formData: FormData, field: string, file: PickedFile) {
  const blob = await readFileAsBlob(file.uri);
  formData.append(field, blob, file.name);
}


export function fetchMyApplications() {
  return apiFetch<PaginatedResponse<GroupApplication>>('/api/v1/groups/applications/');
}

export function fetchGroupApplication(id: string | number) {
  return apiFetch<GroupApplication>(`/api/v1/groups/applications/${id}/`);
}


export async function submitCommitmentFeeProof(applicationId: number, proof: PickedFile) {
  const formData = new FormData();
  await appendFile(formData, 'commitment_fee_proof', proof);
  return apiFetch<GroupApplication>(`/api/v1/groups/applications/${applicationId}/commitment-fee/`, {
    method: 'POST',
    body: formData,
  });
}

