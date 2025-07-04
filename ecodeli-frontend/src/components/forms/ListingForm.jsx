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
      address_from: listing?.address_from || listing?.pickup_address || '',
      address_to: listing?.address_to || listing?.delivery_address || '',
      date_from: listing?.date_from ? new Date(listing.date_from).toISOString().split('T')[0] : '',
      date_to: listing?.date_to || listing?.delivery_date ? new Date(listing.date_to || listing.delivery_date).toISOString().split('T')[0] : '',
      type: listing?.type || listing?.package_size || 'small',
      price: listing?.price || ''
    }
  });

  // Reset form when listing prop changes
  useEffect(() => {
    if (listing) {
      reset({
        title: listing.title || '',
        description: listing.description || '',
        address_from: listing.address_from || listing.pickup_address || '',
        address_to: listing.address_to || listing.delivery_address || '',
        date_from: listing.date_from ? new Date(listing.date_from).toISOString().split('T')[0] : '',
        date_to: listing.date_to || listing.delivery_date ? new Date(listing.date_to || listing.delivery_date).toISOString().split('T')[0] : '',
        type: listing.type || listing.package_size || 'small',
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
    <div className="bg-white p-5 sm:p-8 rounded-lg shadow-md w-full">
      <h2 className="text-xl sm:text-2xl font-bold text-center text-green-600 mb-4 sm:mb-6">
        {listing ? 'Modifier l\'annonce' : 'Créer une annonce'}
      </h2>
      
      {serverError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {serverError}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
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
            <label htmlFor="address_from" className="block text-gray-700 mb-2">
              Adresse d'enlèvement*
            </label>
            <input
              id="address_from"
              type="text"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.address_from ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('address_from', { 
                required: 'Adresse d\'enlèvement requise'
              })}
            />
            {errors.address_from && (
              <p className="text-red-500 text-sm mt-1">{errors.address_from.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="address_to" className="block text-gray-700 mb-2">
              Adresse de livraison*
            </label>
            <input
              id="address_to"
              type="text"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.address_to ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('address_to', { 
                required: 'Adresse de livraison requise'
              })}
            />
            {errors.address_to && (
              <p className="text-red-500 text-sm mt-1">{errors.address_to.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label htmlFor="date_from" className="block text-gray-700 mb-2">
              Date d'enlèvement*
            </label>
            <input
              id="date_from"
              type="date"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.date_from ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('date_from', { 
                required: 'Date d\'enlèvement requise'
              })}
            />
            {errors.date_from && (
              <p className="text-red-500 text-sm mt-1">{errors.date_from.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="date_to" className="block text-gray-700 mb-2">
              Date de livraison*
            </label>
            <input
              id="date_to"
              type="date"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.date_to ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('date_to', { 
                required: 'Date de livraison requise'
              })}
            />
            {errors.date_to && (
              <p className="text-red-500 text-sm mt-1">{errors.date_to.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="type" className="block text-gray-700 mb-2">
              Type de colis*
            </label>
            <select
              id="type"
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.type ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('type', { 
                required: 'Type de colis requis'
              })}
            >
              <option value="small">Petit (moins de 2kg)</option>
              <option value="medium">Moyen (2-5kg)</option>
              <option value="large">Grand (5-10kg)</option>
              <option value="extra_large">Très grand (plus de 10kg)</option>
            </select>
            {errors.type && (
              <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
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
        
        <div className="flex justify-center sm:justify-end pt-4">
          <button
            type="submit"
            className="bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 w-full sm:w-auto font-medium"
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
