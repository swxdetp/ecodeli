import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import useListings from '../../hooks/useListings';

const ListingForm = ({ listing = null, onSuccess = () => {} }) => {
  const { handleCreateListing, handleUpdateListing, isLoading } = useListings();
  const [serverError, setServerError] = useState('');
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset 
  } = useForm({
    defaultValues: {
      title: listing?.title || '',
      description: listing?.description || '',
      pickup_address: listing?.pickup_address || '',
      delivery_address: listing?.delivery_address || '',
      delivery_date: listing?.delivery_date ? new Date(listing.delivery_date).toISOString().split('T')[0] : '',
      package_size: listing?.package_size || 'small',
      price: listing?.price || ''
    }
  });

  // Reset form when listing prop changes
  useEffect(() => {
    if (listing) {
      reset({
        title: listing.title || '',
        description: listing.description || '',
        pickup_address: listing.pickup_address || '',
        delivery_address: listing.delivery_address || '',
        delivery_date: listing.delivery_date ? new Date(listing.delivery_date).toISOString().split('T')[0] : '',
        package_size: listing.package_size || 'small',
        price: listing.price || ''
      });
    }
  }, [listing, reset]);

  const onSubmit = async (data) => {
    setServerError('');
    try {
      if (listing) {
        // Update existing listing
        await handleUpdateListing(listing.id, data);
      } else {
        // Create new listing
        await handleCreateListing(data);
      }
      onSuccess();
    } catch (error) {
      setServerError(error.response?.data?.message || 'Une erreur est survenue');
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-bold text-center text-green-600 mb-6">
        {listing ? 'Modifier l\'annonce' : 'Créer une annonce'}
      </h2>
      
      {serverError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {serverError}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-gray-700 mb-2">
            Titre de l'annonce*
          </label>
          <input
            id="title"
            type="text"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            {...register('title', { 
              required: 'Titre requis',
              maxLength: {
                value: 100,
                message: 'Le titre ne doit pas dépasser 100 caractères'
              }
            })}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-gray-700 mb-2">
            Description*
          </label>
          <textarea
            id="description"
            rows="4"
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            {...register('description', { 
              required: 'Description requise',
              minLength: {
                value: 10,
                message: 'La description doit contenir au moins 10 caractères'
              }
            })}
          ></textarea>
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pickup_address" className="block text-gray-700 mb-2">
              Adresse d'enlèvement*
            </label>
            <input
              id="pickup_address"
              type="text"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.pickup_address ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('pickup_address', { 
                required: 'Adresse d\'enlèvement requise'
              })}
            />
            {errors.pickup_address && (
              <p className="text-red-500 text-sm mt-1">{errors.pickup_address.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="delivery_address" className="block text-gray-700 mb-2">
              Adresse de livraison*
            </label>
            <input
              id="delivery_address"
              type="text"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.delivery_address ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('delivery_address', { 
                required: 'Adresse de livraison requise'
              })}
            />
            {errors.delivery_address && (
              <p className="text-red-500 text-sm mt-1">{errors.delivery_address.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="delivery_date" className="block text-gray-700 mb-2">
              Date de livraison*
            </label>
            <input
              id="delivery_date"
              type="date"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.delivery_date ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('delivery_date', { 
                required: 'Date de livraison requise'
              })}
            />
            {errors.delivery_date && (
              <p className="text-red-500 text-sm mt-1">{errors.delivery_date.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="package_size" className="block text-gray-700 mb-2">
              Taille du colis*
            </label>
            <select
              id="package_size"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.package_size ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('package_size', { 
                required: 'Taille du colis requise'
              })}
            >
              <option value="small">Petit (moins de 2kg)</option>
              <option value="medium">Moyen (2-5kg)</option>
              <option value="large">Grand (5-10kg)</option>
              <option value="extra_large">Très grand (plus de 10kg)</option>
            </select>
            {errors.package_size && (
              <p className="text-red-500 text-sm mt-1">{errors.package_size.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="price" className="block text-gray-700 mb-2">
              Prix proposé (€)*
            </label>
            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('price', { 
                required: 'Prix requis',
                min: {
                  value: 0,
                  message: 'Le prix doit être positif'
                }
              })}
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
            disabled={isLoading}
          >
            {isLoading 
              ? (listing ? 'Mise à jour...' : 'Création...') 
              : (listing ? 'Mettre à jour' : 'Créer l\'annonce')
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default ListingForm;
