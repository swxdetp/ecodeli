import React from 'react';
import { Navigate } from 'react-router-dom';
import LoginForm from '../components/forms/LoginForm';
import useAuthStore from '../store/authStore';
import useAuth from '../hooks/useAuth';

const Login = () => {
  const { isAuthenticated } = useAuthStore();
  const { user } = useAuth();
  
  // Rediriger vers le tableau de bord approprié si l'utilisateur est déjà connecté
  if (isAuthenticated) {
    // Redirection selon le rôle
    switch(user?.role) {
      case 'admin':
        return <Navigate to="/admin" />;
      case 'livreur':
        return <Navigate to="/livreur/dashboard" />;
      case 'commercant':
      case 'prestataire':
        // À implémenter: espaces spécifiques pour commerçants et prestataires
        return <Navigate to="/dashboard" />;
      case 'client':
      default:
        return <Navigate to="/dashboard" />;
    }
  }

  return (
    <div className="min-h-screen bg-green-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center text-green-600 mb-8">
            Connexion à votre compte EcoDeli
          </h1>
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
