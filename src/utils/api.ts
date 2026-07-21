import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL
});

// Add request interceptor to automatically attach authorization header
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("aurum_user_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auto-handle 401 Unauthorized responses (session expired / user deleted)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response && error.response.status === 401) {
      const isAuthEndpoint = error.config && error.config.url && (
        error.config.url.includes("/login") || 
        error.config.url.includes("/verify-otp") ||
        error.config.url.includes("/send-otp")
      );
      if (!isAuthEndpoint) {
        localStorage.removeItem("aurum_user_token");
        localStorage.removeItem("aurum_user");
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export const getRequest = async <T = any>(url: string, config = {}): Promise<T> => {
  return (await api.get<T>(url, config)).data;
};

export const postRequest = async <T = any>(url: string, data = {}, config = {}): Promise<T> => {
  return (await api.post<T>(url, data, config)).data;
};

export const putRequest = async <T = any>(url: string, data = {}, config = {}): Promise<T> => {
  return (await api.put<T>(url, data, config)).data;
};

export const patchRequest = async <T = any>(url: string, data = {}, config = {}): Promise<T> => {
  return (await api.patch<T>(url, data, config)).data;
};

export const deleteRequest = async <T = any>(url: string, config = {}): Promise<T> => {
  return (await api.delete<T>(url, config)).data;
};

export const getImageUrl = (path?: string) => {
  if (!path) return "/emerald_ring.png";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const baseUrl = API_URL.replace("/api", "");
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};
