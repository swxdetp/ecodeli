import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuth from '../../hooks/useAuth';

const RegisterForm = () => {
  const { handleRegister, isLoading } = useAuth();
  const [serverError, setServerError] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [requiresDocument, setRequiresDocument] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    watch,
    setValue,
    formState: { errors } 
  } = useForm();

  const password = watch('password');
  const role = watch('role');
  
  // Effet qui vérifie si le rôle sélectionné nécessite un document d'identité
  useEffect(() => {
    const needsDocument = ['livreur', 'prestataire', 'commercant'].includes(role);
    setSelectedRole(role);
    setRequiresDocument(needsDocument);
  }, [role]);

  const onSubmit = async (data) => {
    setServerError('');
    try {
      // Préparation des données du formulaire
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('password_confirmation', data.passwordConfirm);
      formData.append('role', data.role);
      
      // Ajout conditionnel du document d'identité
      if (requiresDocument && data.identity_document?.[0]) {
        formData.append('identity_document', data.identity_document[0]);
        formData.append('document_type', data.document_type);
        if (data.document_number) {
          formData.append('document_number', data.document_number);
        }
      }
      
      // Envoi des données à l'API
      await handleRegister(formData);
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      setServerError(error.response?.data?.message || 'Une erreur est survenue');
    }
  };

  return (
    <div className="bg-white p-5 sm:p-8 rounded-lg shadow-md max-w-md w-full mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold text-center text-green-600 mb-4 sm:mb-6">Inscription</h2>
      
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

        {/* Nouveau champ pour le choix du rôle */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 text-sm sm:text-base">
            Je m'inscris en tant que
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            <select
              id="role"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.role ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('role', { 
                required: 'Veuillez sélectionner un rôle'
              })}
            >
              <option value="">Sélectionnez votre profil...</option>
              <option value="client">Client - Je souhaite faire livrer mes colis</option>
              <option value="livreur">Livreur - Je souhaite effectuer des livraisons</option>
              <option value="prestataire">Prestataire - Je propose mes services</option>
              <option value="commercant">Commerçant - Je représente un commerce</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
            )}
          </div>
        </div>
        
        {/* Champs conditionnels pour le document d'identité */}
        {requiresDocument && (
          <>
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-amber-700 mb-2 font-medium">Document d'identité requis</p>
              <p className="text-sm text-amber-600 mb-4">
                Pour votre profil {selectedRole === 'livreur' ? 'de livreur' : selectedRole === 'prestataire' ? 'de prestataire' : 'de commerçant'}, 
                vous devez fournir une pièce d'identité valide.
              </p>
              
              {/* Type de document */}
              <div className="mb-4">
                <label htmlFor="document_type" className="block text-gray-700 mb-2">
                  Type de document d'identité
                </label>
                <select
                  id="document_type"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.document_type ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register('document_type', { 
                    required: 'Veuillez sélectionner un type de document'
                  })}
                >
                  <option value="">Sélectionnez le type de document...</option>
                  <option value="carte_identite">Carte d'identité</option>
                  <option value="passeport">Passeport</option>
                  <option value="permis_conduire">Permis de conduire</option>
                </select>
                {errors.document_type && (
                  <p className="text-red-500 text-sm mt-1">{errors.document_type.message}</p>
                )}
              </div>
              
              {/* Numéro du document (optionnel) */}
              <div className="mb-4">
                <label htmlFor="document_number" className="block text-gray-700 mb-2">
                  Numéro du document (optionnel)
                </label>
                <input
                  id="document_number"
                  type="text"
                  placeholder="Numéro de votre document"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 border-gray-300"
                  {...register('document_number')}
                />
              </div>
              
              {/* Fichier du document */}
              <div className="mb-4">
                <label htmlFor="identity_document" className="block text-gray-700 mb-2">
                  Document d'identité (JPEG, PNG, PDF - max 2MB)
                </label>
                <input
                  id="identity_document"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.identity_document ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register('identity_document', { 
                    required: 'Veuillez télécharger votre document d\'identité'
                  })}
                />
                {errors.identity_document && (
                  <p className="text-red-500 text-sm mt-1">{errors.identity_document.message}</p>
                )}
              </div>
            </div>
          </>
        )}
        
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
          className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 text-base font-medium"
          disabled={isLoading}
        >
          {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
        </button>
        
        {requiresDocument && (
          <p className="mt-2 text-xs sm:text-sm text-gray-500 text-center sm:text-left">
            Votre compte sera validé après vérification de votre document d'identité.
          </p>
        )}
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm sm:text-base">
          Vous avez déjà un compte ?{' '}
          <Link to="/login" className="text-green-600 hover:underline font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
