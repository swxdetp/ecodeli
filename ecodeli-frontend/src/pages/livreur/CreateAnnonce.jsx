import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuthStore from '../../store/authStore';
import axios from '../../api/axios';
import { toast } from 'react-toastify';

const CreateAnnonce = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Ajout automatique de l'ID de l'utilisateur connecté
      const annonceData = {
        ...data,
        user_id: user.id,
        type: 'livraison',
        status: 'active',
        // Conversion des valeurs booléennes
        is_fragile: data.is_fragile === 'true',
        is_urgent: data.is_urgent === 'true',
      };
      
      // Appel à l'API pour créer l'annonce
      const response = await axios.post('/livreur/annonces', annonceData);
      
      // Création d'une livraison associée à cette annonce
      if (response.data && response.data.data && response.data.data.id) {
        const annonceId = response.data.data.id;
        
        // Créer automatiquement la livraison associée
        await axios.post('/livreur/livraisons', {
          annonce_id: annonceId,
          livreur_id: user.id,
          status: 'pending',
          notes: `Livraison automatiquement créée pour l'annonce #${annonceId}`
        });
        
        toast.success("Annonce créée avec succès et ajoutée à vos livraisons");
        navigate('/livreur/livraisons');
      } else {
        toast.error("L'annonce a été créée mais il y a eu un problème avec la livraison");
        navigate('/livreur/annonces');
      }
    } catch (error) {
      console.error("Erreur lors de la création de l'annonce:", error);
      toast.error(error.response?.data?.message || "Erreur lors de la création de l'annonce");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-green-600 mb-6">Créer une nouvelle annonce</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Titre */}
              <div className="col-span-2">
                <label className="block text-gray-700 mb-1" htmlFor="title">
                  Titre de l'annonce*
                </label>
                <input
                  id="title"
                  type="text"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register('title', { required: 'Le titre est obligatoire' })}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>
              
              {/* Description */}
              <div className="col-span-2">
                <label className="block text-gray-700 mb-1" htmlFor="description">
                  Description*
                </label>
                <textarea
                  id="description"
                  rows="4"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register('description', { required: 'La description est obligatoire' })}
                ></textarea>
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>
              
              {/* Prix */}
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="price">
                  Prix (€)*
                </label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register('price', { 
                    required: 'Le prix est obligatoire',
                    min: { value: 0.01, message: 'Le prix doit être positif' } 
                  })}
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                )}
              </div>
              
              {/* Poids */}
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="weight">
                  Poids (kg)
                </label>
                <input
                  id="weight"
                  type="number"
                  step="0.1"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.weight ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register('weight', { 
                    min: { value: 0.1, message: 'Le poids doit être positif' } 
                  })}
                />
                {errors.weight && (
                  <p className="text-red-500 text-sm mt-1">{errors.weight.message}</p>
                )}
              </div>
              
              {/* Dimensions */}
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="dimensions">
                  Dimensions (LxlxH cm)
                </label>
                <input
                  id="dimensions"
                  type="text"
                  placeholder="ex: 30x20x15"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.dimensions ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register('dimensions')}
                />
              </div>
              
              {/* Options */}
              <div>
                <label className="block text-gray-700 mb-2">Options</label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <select
                      id="is_fragile"
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 border-gray-300"
                      {...register('is_fragile')}
                    >
                      <option value="false">Non fragile</option>
                      <option value="true">Fragile</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <select
                      id="is_urgent"
                      className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 border-gray-300"
                      {...register('is_urgent')}
                    >
                      <option value="false">Standard</option>
                      <option value="true">Urgent</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Adresse de départ */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-gray-700 mb-1" htmlFor="address_from">
                  Adresse de départ*
                </label>
                <input
                  id="address_from"
                  type="text"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.address_from ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register('address_from', { required: "L'adresse de départ est obligatoire" })}
                />
                {errors.address_from && (
                  <p className="text-red-500 text-sm mt-1">{errors.address_from.message}</p>
                )}
              </div>
              
              {/* Adresse d'arrivée */}
              <div className="col-span-2 md:col-span-1">
                <label className="block text-gray-700 mb-1" htmlFor="address_to">
                  Adresse d'arrivée*
                </label>
                <input
                  id="address_to"
                  type="text"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.address_to ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register('address_to', { required: "L'adresse d'arrivée est obligatoire" })}
                />
                {errors.address_to && (
                  <p className="text-red-500 text-sm mt-1">{errors.address_to.message}</p>
                )}
              </div>
              
              {/* Date de départ */}
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="date_from">
                  Date de départ*
                </label>
                <input
                  id="date_from"
                  type="datetime-local"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.date_from ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register('date_from', { required: 'La date de départ est obligatoire' })}
                />
                {errors.date_from && (
                  <p className="text-red-500 text-sm mt-1">{errors.date_from.message}</p>
                )}
              </div>
              
              {/* Date d'arrivée */}
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="date_to">
                  Date d'arrivée*
                </label>
                <input
                  id="date_to"
                  type="datetime-local"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.date_to ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register('date_to', { required: "La date d'arrivée est obligatoire" })}
                />
                {errors.date_to && (
                  <p className="text-red-500 text-sm mt-1">{errors.date_to.message}</p>
                )}
              </div>
            </div>
            
            <div className="mt-8 flex justify-end space-x-4">
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => navigate('/livreur/dashboard')}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 rounded-md text-white hover:bg-green-700 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Création en cours...' : 'Créer l\'annonce'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAnnonce;
