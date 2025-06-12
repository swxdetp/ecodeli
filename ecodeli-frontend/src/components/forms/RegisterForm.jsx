import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuth from '../../hooks/useAuth';

const RegisterForm = () => {
  const { handleRegister, isLoading } = useAuth();
  const [serverError, setServerError] = useState('');
  
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors } 
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await handleRegister({
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.passwordConfirm
      });
    } catch (error) {
      setServerError(error.response?.data?.message || 'Une erreur est survenue');
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
      <h2 className="text-2xl font-bold text-center text-green-600 mb-6">Inscription</h2>
      
      {serverError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {serverError}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 mb-2">
            Nom complet
          </label>
          <input
            id="name"
            type="text"
            placeholder="Jean Dupont"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            {...register('name', { 
              required: 'Nom requis',
              minLength: {
                value: 2,
                message: 'Le nom doit contenir au moins 2 caractères'
              }
            })}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="votre@email.com"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            {...register('email', { 
              required: 'Email requis',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Adresse email invalide'
              }
            })}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 mb-2">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            {...register('password', { 
              required: 'Mot de passe requis',
              minLength: {
                value: 6,
                message: 'Le mot de passe doit contenir au moins 6 caractères'
              }
            })}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label htmlFor="passwordConfirm" className="block text-gray-700 mb-2">
            Confirmer le mot de passe
          </label>
          <input
            id="passwordConfirm"
            type="password"
            placeholder="••••••••"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.passwordConfirm ? 'border-red-500' : 'border-gray-300'
            }`}
            {...register('passwordConfirm', { 
              required: 'Confirmation du mot de passe requise',
              validate: value => value === password || 'Les mots de passe ne correspondent pas'
            })}
          />
          {errors.passwordConfirm && (
            <p className="text-red-500 text-sm mt-1">{errors.passwordConfirm.message}</p>
          )}
        </div>
        
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
          disabled={isLoading}
        >
          {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Vous avez déjà un compte ?{' '}
          <Link to="/login" className="text-green-600 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
