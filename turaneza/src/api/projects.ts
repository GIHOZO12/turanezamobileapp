import { apiFetch } from '@/api/client';

export type ProjectStatus = 'funding' | 'active' | 'completed' | 'archived';


export type Project = {
  id: number;
  group: number | null;
  group_name: string;
  name: string;
  slug: string;
  status: ProjectStatus;
  summary: string;
  description: string;
  location: string;
  amenities: string[];
  featured_image: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectDesignAsset = {
  id: number;
  project: number;
  title: string;
  description: string;
  media_type: 'image' | 'video';
  image: string | null;
  video_url: string;
  created_at: string;
};

type PaginatedResponse<T> = { count: number; next: string | null; previous: string | null; results: T[] };


export function fetchProjects() {
  return apiFetch<PaginatedResponse<Project>>('/api/v1/projects/projects/');
}

export function fetchProject(id: string | number) {
  return apiFetch<Project>(`/api/v1/projects/projects/${id}/`);
}


/**
 * PAGE_SIZE is a global 6 (urban_evolution/settings.py) with no page_size override exposed,
 * so a project with more than 6 design assets would silently lose the rest without following
 * every `next` link — same pagination trap fetchGroupMessages already had to work around.
 */
export async function fetchProjectDesigns(projectId: string | number): Promise<ProjectDesignAsset[]> {
  const all: ProjectDesignAsset[] = [];
  let path: string | null = `/api/v1/projects/designs/?project=${projectId}`;
  while (path) {
    const page: PaginatedResponse<ProjectDesignAsset> = await apiFetch<PaginatedResponse<ProjectDesignAsset>>(path);
    all.push(...page.results);
    path = page.next ? page.next.replace(/^https?:\/\/[^/]+/, '') : null;
  }
  return all;
}
