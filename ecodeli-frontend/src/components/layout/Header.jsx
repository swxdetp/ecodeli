import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Header = () => {
  const { isAuthenticated, handleLogout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-green-600 shadow-md relative z-30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-white text-2xl font-bold">
              EcoDeli
            </Link>
          </div>

          {/* Bouton hamburger pour mobile */}
          <button 
            className="md:hidden text-white focus:outline-none" 
            onClick={toggleMenu}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Navigation pour écrans medium et plus grands */}
          <nav className="hidden md:flex items-center space-x-4">
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
        
        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-green-600 shadow-md">
            <div className="container mx-auto px-4 py-2 flex flex-col space-y-3">
              <Link 
                to="/" 
                className="text-white hover:text-green-100 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Accueil
              </Link>
              
              <Link 
                to="/annonces" 
                className="text-white hover:text-green-100 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Annonces
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-white hover:text-green-100 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Tableau de bord
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-white hover:text-green-100 py-2 text-left"
                  >
                    Déconnexion
                  </button>
                  <span className="text-white px-3 py-2 rounded bg-green-700 inline-block">
                    {user?.name || 'Utilisateur'}
                  </span>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-white hover:text-green-100 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-white text-green-600 px-4 py-2 rounded hover:bg-green-100 inline-block w-fit"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
