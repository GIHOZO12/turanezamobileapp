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


export function fetchProjectDesigns(projectId: string | number) {
  return apiFetch<PaginatedResponse<ProjectDesignAsset>>(`/api/v1/projects/designs/?project=${projectId}`);
}
