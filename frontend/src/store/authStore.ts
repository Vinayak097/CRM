import { create } from "zustand";
import authService, {
  type User,
  type LoginRequest,
  type RegisterRequest,
} from "../services/authService";

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem("user"),

  login: async (credentials: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(credentials);
      const user = response.user;
      localStorage.setItem("user", JSON.stringify(user));
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(data);
      const user = response.user;
      localStorage.setItem("user", JSON.stringify(user));
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Registration failed";
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();

      localStorage.removeItem("user");
      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });
    } catch (error) {
      // Still clear local state even if logout fails
      localStorage.removeItem("user");
      set({
        user: null,
        isAuthenticated: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const response = await authService.verifySession();
      const user = response.user;
      localStorage.setItem("user", JSON.stringify(user));
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      localStorage.removeItem("user");
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.response?.data?.error || "Session verification failed",
      });
    }
  },
}));
