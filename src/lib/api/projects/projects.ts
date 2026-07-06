import { apiRequest } from "../client";
import type { ProjectData } from "@/lib/types";

export const projectsApi = {
  list: () => apiRequest<ProjectData[]>("/api/projects"),
  create: (body: ProjectData) =>
    apiRequest<ProjectData>("/api/projects", { method: "POST", body: JSON.stringify(body) }),
};
