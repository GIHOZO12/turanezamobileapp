import { apiFetch, readFileAsBlob } from '@/api/client';
import type { PickedFile } from '@/api/applications';


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
  plot_image: string | null;
  status: 'pending' | 'approved' | 'rejected';
};


export async function submitPlot(payload: PlotSubmissionPayload, ownershipProof: PickedFile, plotImage?: PickedFile) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(key, String(value));
  });
  const proofBlob = await readFileAsBlob(ownershipProof.uri);
  formData.append('ownership_proof', proofBlob, ownershipProof.name);
  if (plotImage) {
    const imageBlob = await readFileAsBlob(plotImage.uri);
    formData.append('plot_image', imageBlob, plotImage.name);
  }

  return apiFetch<PlotSubmission>('/api/v1/groups/plots/', {
    method: 'POST',
    body: formData,
  });
}
