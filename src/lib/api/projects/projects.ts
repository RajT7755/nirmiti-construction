import { apiRequest } from "../client";
import type { ProjectData } from "@/lib/types";

export type CreateProjectRequest = Omit<ProjectData, "id" | "createdAt">;
export type UpdateProjectRequest = Partial<Omit<ProjectData, "id">>;

/** Sent with DELETE to re-authenticate destructive action on the backend */
export type DeleteProjectRequest = {
  username: string;
  password: string;
};

export type DeleteProjectResponse = {
  deleted: boolean;
  projectId: string;
};

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

  /**
   * DELETE /api/projects/:id
   * Optional body: DeleteProjectRequest (login re-auth for backend)
   */
  remove: (id: string, body?: DeleteProjectRequest) =>
    apiRequest<DeleteProjectResponse>(`/api/projects/${id}`, {
      method: "DELETE",
      body: body ? JSON.stringify(body) : undefined,
    }),
};
