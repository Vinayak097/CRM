import { useAuthStore } from "../store/authStore";

export const useAuth = () => {
  const store = useAuthStore();
  
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    login: store.login,
    register: store.register,
    logout: store.logout,
    checkAuth: store.checkAuth,
    clearError: store.clearError,
  };
};

export const useUser=()=>{
  const store= useAuthStore();
  return {
    user:store.user
  }
}