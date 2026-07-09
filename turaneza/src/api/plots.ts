import { apiFetch, readFileAsBlob } from '@/api/client';
import type { PickedFile } from '@/api/applications';

/**
 * Mirrors PlotSubmissionCreateSerializer (groups/serializers.py). Despite the model itself
 * marking land_title_number and ownership_proof as blank=True, the serializer overrides both
 * without `required=False`, which makes them required at submission time regardless — same
 * story for plot_location (required at the model level, no blank=True). Only `description` is
 * genuinely optional.
 */
export type PlotSubmissionPayload = {
  description?: string;
  plot_location: string;
  plot_size_sqm: number;
  land_title_number: string;
};

export type PlotSubmission = {
  id: number;
  description: string;
  plot_location: string;
  plot_size_sqm: string;
  land_title_number: string;
  ownership_proof: string;
  status: 'pending' | 'approved' | 'rejected';
};

/**
 * POST /api/v1/groups/plots/ (PlotSubmissionViewSet) — IsAuthenticated, multipart because
 * ownership_proof is a real required file upload. Rides on the JWT (see api/client.ts) rather
 * than the session cookie, same as group applications — that's what lets this succeed without
 * hitting Django's CSRF protection on session-authenticated POSTs.
 *
 * The file part must be a real native-backed Blob (see readFileAsBlob in api/client.ts for why —
 * neither RN's classic {uri, name, type} shape nor a Response.blob()-built Blob work here).
 */
export async function submitPlot(payload: PlotSubmissionPayload, ownershipProof: PickedFile) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(key, String(value));
  });
  const blob = await readFileAsBlob(ownershipProof.uri);
  formData.append('ownership_proof', blob, ownershipProof.name);

  return apiFetch<PlotSubmission>('/api/v1/groups/plots/', {
    method: 'POST',
    body: formData,
  });
}
