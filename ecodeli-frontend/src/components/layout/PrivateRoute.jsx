import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const PrivateRoute = () => {
  const { isAuthenticated } = useAuthStore();
  
  // Si l'utilisateur n'est pas authentifié, redirige vers la page de connexion
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Si l'utilisateur est authentifié, affiche les routes enfants
  return <Outlet />;
};

export default PrivateRoute;
