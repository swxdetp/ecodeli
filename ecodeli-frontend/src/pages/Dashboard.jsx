import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useListings from '../hooks/useListings';
import ListingsList from '../components/listings/ListingsList';

const Dashboard = () => {
  const { user } = useAuth();
  const { getUserListings, userListings, isLoading } = useListings();

  useEffect(() => {
    getUserListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Bonjour, {user?.name || 'Client'}
              </h1>
              <p className="text-gray-600 mt-1">
                Bienvenue sur votre tableau de bord EcoDeli
              </p>
            </div>
            <Link
              to="/annonces/create"
              className="mt-4 md:mt-0 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center"
            >
              <span className="mr-2">+</span> Nouvelle annonce
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Menu</h2>
              <nav className="space-y-2">
                <Link
                  to="/dashboard"
                  className="block text-green-600 font-medium rounded p-2 bg-green-50"
                >
                  Mes annonces
                </Link>
                <Link
                  to="/profile"
                  className="block text-gray-600 hover:text-green-600 rounded p-2 hover:bg-green-50 transition"
                >
                  Mon profil
                </Link>
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Mes annonces
              </h2>
              
              <ListingsList userOnly={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
