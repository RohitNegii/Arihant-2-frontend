import { postRequest, getRequest } from "../utils/api";

export interface UserProfile {
  id: string;
  name: string;
  phone?: string;
  email: string;
  role: "customer" | "admin";
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: UserProfile;
  message?: string;
  code?: string;
}

export const sendOtpApi = async (email: string, type: "login" | "signup"): Promise<AuthResponse> => {
  return postRequest<AuthResponse>("/auth/send-otp", { email, type });
};

export const verifyOtpApi = async (
  email: string,
  otp: string,
  name?: string,
  phone?: string
): Promise<AuthResponse> => {
  return postRequest<AuthResponse>("/auth/verify-otp", { email, otp, name, phone });
};

export const fetchCurrentUser = async (token: string): Promise<{ success: boolean; user: UserProfile }> => {
  return getRequest<{ success: boolean; user: UserProfile }>("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
