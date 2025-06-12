import React from 'react';
import { Navigate } from 'react-router-dom';
import RegisterForm from '../components/forms/RegisterForm';
import useAuthStore from '../store/authStore';

const Register = () => {
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
            Créer un compte EcoDeli
          </h1>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default Register;
