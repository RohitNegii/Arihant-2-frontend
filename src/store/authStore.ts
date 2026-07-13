import { create } from "zustand";
import { UserProfile } from "../services/auth";

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  showAuthModal: boolean;
  authMode: "login" | "signup";
  pendingAction: (() => void) | null;
}

interface AuthActions {
  initialize: () => void;
  openAuthModal: (mode?: "login" | "signup", action?: () => void) => void;
  closeAuthModal: () => void;
  setAuthMode: (mode: "login" | "signup") => void;
  loginSuccess: (token: string, user: UserProfile) => void;
  logout: () => void;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,
  showAuthModal: false,
  authMode: "login",
  pendingAction: null,

  initialize: () => {
    if (typeof window !== "undefined") {
      try {
        const storedToken = localStorage.getItem("aurum_user_token");
        const storedUser = localStorage.getItem("aurum_user");
        if (storedToken && storedUser) {
          set({
            token: storedToken,
            user: JSON.parse(storedUser),
            isAuthenticated: true,
            isInitialized: true,
          });
          return;
        }
      } catch (e) {
        console.error("Failed to initialize auth store:", e);
      }
    }
    set({ isInitialized: true });
  },

  openAuthModal: (mode = "login", action) => {
    set({
      authMode: mode,
      pendingAction: action || null,
      showAuthModal: true,
    });
  },

  closeAuthModal: () => {
    set({
      showAuthModal: false,
      pendingAction: null,
    });
  },

  setAuthMode: (mode) => {
    set({ authMode: mode });
  },

  loginSuccess: (token, user) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("aurum_user_token", token);
        localStorage.setItem("aurum_user", JSON.stringify(user));
      } catch (e) {
        console.error("Failed to save session to localStorage:", e);
      }
    }

    set({
      token,
      user,
      isAuthenticated: true,
      showAuthModal: false,
    });

    const pending = get().pendingAction;
    if (pending) {
      try {
        pending();
      } catch (e) {
        console.error("Error executing pending action:", e);
      }
      set({ pendingAction: null });
    }
  },

  logout: () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("aurum_user_token");
        localStorage.removeItem("aurum_user");
      } catch (e) {
        console.error("Failed to clear session from localStorage:", e);
      }
    }

    set({
      token: null,
      user: null,
      isAuthenticated: false,
      pendingAction: null,
    });
  },
}));
