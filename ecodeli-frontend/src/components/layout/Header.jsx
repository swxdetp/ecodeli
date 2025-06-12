import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Header = () => {
  const { isAuthenticated, handleLogout, user } = useAuth();

  return (
    <header className="bg-green-600 shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-white text-2xl font-bold">
              EcoDeli
            </Link>
          </div>

          <nav className="flex items-center space-x-4">
            <Link to="/" className="text-white hover:text-green-100">
              Accueil
            </Link>
            
            <Link to="/annonces" className="text-white hover:text-green-100">
              Annonces
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-white hover:text-green-100">
                  Tableau de bord
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-white hover:text-green-100"
                >
                  Déconnexion
                </button>
                <span className="text-white px-3 py-1 rounded bg-green-700">
                  {user?.name || 'Utilisateur'}
                </span>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white hover:text-green-100">
                  Connexion
                </Link>
                <Link to="/register" className="bg-white text-green-600 px-4 py-2 rounded hover:bg-green-100">
                  Inscription
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
