import React from 'react';
import { Navigate } from 'react-router-dom';
import LoginForm from '../components/forms/LoginForm';
import useAuthStore from '../store/authStore';

const Login = () => {
  const { isAuthenticated } = useAuthStore();
  
  // Rediriger vers le tableau de bord si l'utilisateur est déjà connecté
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
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
