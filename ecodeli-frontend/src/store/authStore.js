import { create } from 'zustand';
import AuthService from '../api/auth.service';

const useAuthStore = create((set) => ({
  user: AuthService.getCurrentUser(),
  isAuthenticated: AuthService.isLoggedIn(),
  isLoading: false,
  error: null,
  
  // Actions
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await AuthService.login(email, password);
      // Correctement extraire l'utilisateur à partir de la structure de réponse API
      const user = data.data.user;
      set({ user, isAuthenticated: true, isLoading: false });
      // Retourner l'utilisateur directement pour la logique de redirection
      return user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Une erreur est survenue lors de la connexion';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const data = await AuthService.register(userData);
      set({ isLoading: false });
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Une erreur est survenue lors de l\'inscription';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  logout: () => {
    AuthService.logout();
    set({ user: null, isAuthenticated: false });
  },
  
  // Mettre à jour les informations de l'utilisateur
  setUser: (updatedUserData) => {
    set((state) => ({
      user: { ...state.user, ...updatedUserData }
    }));
  },
  
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
