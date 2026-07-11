import { apiRequest } from "../client";
import type { ProjectData } from "@/lib/types";

export type CreateProjectRequest = Omit<ProjectData, "id" | "createdAt">;
export type UpdateProjectRequest = Partial<Omit<ProjectData, "id">>;

export const projectsApi = {
  list: () => apiRequest<ProjectData[]>("/api/projects"),

  get: (id: string) => apiRequest<ProjectData>(`/api/projects/${id}`),

  create: (body: CreateProjectRequest) =>
    apiRequest<ProjectData>("/api/projects", { method: "POST", body: JSON.stringify(body) }),

  update: (id: string, body: UpdateProjectRequest) =>
    apiRequest<ProjectData>(`/api/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  remove: (id: string) =>
    apiRequest<{ deleted: boolean }>(`/api/projects/${id}`, { method: "DELETE" }),
};
