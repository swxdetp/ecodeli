import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

/**
 * Composant de route protégée pour l'accès administrateur
 * Redirige vers la page de connexion si l'utilisateur n'est pas connecté
 * Redirige vers le dashboard si l'utilisateur n'est pas admin
 */
const AdminRoute = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Si l'utilisateur est authentifié mais n'est pas admin, rediriger vers le dashboard
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Si l'utilisateur est admin, afficher le contenu de la route
  return <Outlet />;
};

export default AdminRoute;
