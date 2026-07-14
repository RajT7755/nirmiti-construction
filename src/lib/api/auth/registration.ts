import { apiRequest } from "../client";

export interface RegisterUserRequest {
  userId: string;
  fullName: string;
  email: string;
  password: string;
}

export interface RegisterUserResponse {
  userId: string;
}

export const registrationApi = {
  register: (body: RegisterUserRequest) =>
    apiRequest<RegisterUserResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  checkUser: (userId: string) =>
    apiRequest<{ exists: boolean }>(`/api/auth/users/${encodeURIComponent(userId)}`),

  login: (body: { loginId: string; password: string }) =>
    apiRequest<{ userId: string; fullName: string; email: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};