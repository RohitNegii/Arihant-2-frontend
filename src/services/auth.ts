import { postRequest, getRequest } from "../utils/api";

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: "customer" | "admin";
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: UserProfile;
  message?: string;
}

export const sendOtpApi = async (phone: string, type: "login" | "signup"): Promise<AuthResponse> => {
  return postRequest<AuthResponse>("/auth/send-otp", { phone, type });
};

export const verifyOtpApi = async (
  phone: string,
  otp: string,
  name?: string,
  email?: string
): Promise<AuthResponse> => {
  return postRequest<AuthResponse>("/auth/verify-otp", { phone, otp, name, email });
};

export const fetchCurrentUser = async (token: string): Promise<{ success: boolean; user: UserProfile }> => {
  return getRequest<{ success: boolean; user: UserProfile }>("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
