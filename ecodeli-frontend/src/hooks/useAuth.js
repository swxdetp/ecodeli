import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { toast } from 'react-toastify';

const useAuth = () => {
  const navigate = useNavigate();
  const { 
    user, 
    isAuthenticated, 
    isLoading,
    error, 
    login, 
    register, 
    logout, 
    clearError 
  } = useAuthStore();

  // Fonction de connexion améliorée avec gestion des redirections et notifications
  const handleLogin = useCallback(async (email, password) => {
    try {
      await login(email, password);
      toast.success('Connexion réussie!');
      navigate('/dashboard');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Échec de la connexion');
      return false;
    }
  }, [login, navigate]);

  // Fonction d'inscription améliorée avec gestion des redirections et notifications
  const handleRegister = useCallback(async (userData) => {
    try {
      await register(userData);
      toast.success('Inscription réussie! Vous pouvez maintenant vous connecter.');
      navigate('/login');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Échec de l\'inscription');
      return false;
    }
  }, [register, navigate]);

  // Fonction de déconnexion améliorée avec gestion des redirections et notifications
  const handleLogout = useCallback(() => {
    logout();
    toast.info('Vous êtes maintenant déconnecté');
    navigate('/');
  }, [logout, navigate]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    handleLogin,
    handleRegister,
    handleLogout,
    clearError
  };
};

export default useAuth;
