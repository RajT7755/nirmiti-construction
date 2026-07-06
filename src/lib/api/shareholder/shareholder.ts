import { apiRequest } from "../client";

export const shareholderApi = {
  list: () => apiRequest<unknown[]>("/api/shareholders"),
};
