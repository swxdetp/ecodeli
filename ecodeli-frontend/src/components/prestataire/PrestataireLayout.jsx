import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { 
  FaTachometerAlt, 
  FaCalendarAlt,
  FaClipboardList,
  FaFileInvoiceDollar,
  FaStar,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';

/**
 * Layout principal pour l'espace prestataire
 * Inclut une navigation responsive avec menu burger sur mobile
 */
const PrestataireLayout = () => {
  const { logout, user } = useAuthStore();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = useState(false);

  // Détecter les changements de taille d'écran
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fermer le menu quand on change de route
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar pour desktop */}
      {!isMobile && (
        <div className="w-64 h-full bg-white shadow-lg z-20 flex-shrink-0">
          <div className="p-4 bg-purple-700 text-white">
            <h2 className="text-lg font-bold">EcoDeli</h2>
            <p className="text-sm">Espace Prestataire</p>
          </div>
          <div className="p-4 border-b border-gray-200">
            <p className="text-gray-500 text-sm">Bienvenue,</p>
            <p className="font-semibold">{user?.name || 'Prestataire'}</p>
          </div>
          <nav className="p-2">
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/prestataire/dashboard"
                  className={`flex items-center p-3 rounded-lg hover:bg-purple-50 transition-colors ${isActive('/prestataire/dashboard') ? 'bg-purple-100 text-purple-700' : 'text-gray-700'}`}
                >
                  <FaTachometerAlt className="mr-3" />
                  <span className="font-medium">Tableau de bord</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/prestataire/prestations"
                  className={`flex items-center p-3 rounded-lg hover:bg-purple-50 transition-colors ${isActive('/prestataire/prestations') ? 'bg-purple-100 text-purple-700' : 'text-gray-700'}`}
                >
                  <FaClipboardList className="mr-3" />
                  <span className="font-medium">Mes prestations</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/prestataire/disponibilites"
                  className={`flex items-center p-3 rounded-lg hover:bg-purple-50 transition-colors ${isActive('/prestataire/disponibilites') ? 'bg-purple-100 text-purple-700' : 'text-gray-700'}`}
                >
                  <FaCalendarAlt className="mr-3" />
                  <span className="font-medium">Calendrier</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/prestataire/factures"
                  className={`flex items-center p-3 rounded-lg hover:bg-purple-50 transition-colors ${isActive('/prestataire/factures') ? 'bg-purple-100 text-purple-700' : 'text-gray-700'}`}
                >
                  <FaFileInvoiceDollar className="mr-3" />
                  <span className="font-medium">Mes factures</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/prestataire/evaluations"
                  className={`flex items-center p-3 rounded-lg hover:bg-purple-50 transition-colors ${isActive('/prestataire/evaluations') ? 'bg-purple-100 text-purple-700' : 'text-gray-700'}`}
                >
                  <FaStar className="mr-3" />
                  <span className="font-medium">Évaluations</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/prestataire/profil"
                  className={`flex items-center p-3 rounded-lg hover:bg-purple-50 transition-colors ${isActive('/prestataire/profil') ? 'bg-purple-100 text-purple-700' : 'text-gray-700'}`}
                >
                  <FaUser className="mr-3" />
                  <span className="font-medium">Mon profil</span>
                </Link>
              </li>
              <li>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center p-3 rounded-lg hover:bg-purple-50 transition-colors text-gray-700"
                >
                  <FaSignOutAlt className="mr-3" />
                  <span className="font-medium">Déconnexion</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Header mobile + Contenu */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header mobile avec bouton menu */}
        {isMobile && (
          <header className="bg-purple-700 text-white shadow-lg z-10">
            <div className="flex items-center justify-between p-4">
              <h2 className="text-lg font-bold">EcoDeli - Espace Prestataire</h2>
              <button 
                onClick={() => setMenuOpen(!menuOpen)} 
                className="p-1 rounded focus:outline-none"
                aria-label="Menu"
              >
                {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </header>
        )}

        {/* Menu mobile */}
        {isMobile && (
          <div className={`fixed inset-0 z-50 transition-all duration-300 ${menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Overlay sombre */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setMenuOpen(false)}
            ></div>
            
            {/* Menu */}
            <div className={`absolute top-0 left-0 h-full w-4/5 max-w-sm bg-white shadow-lg transform transition-transform duration-300 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <div className="p-4 bg-purple-700 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold">EcoDeli</h2>
                  <p className="text-sm">Espace Prestataire</p>
                </div>
                <button 
                  onClick={() => setMenuOpen(false)}
                  className="p-1"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <div className="p-4 border-b border-gray-200">
                <p className="text-gray-500 text-sm">Bienvenue,</p>
                <p className="font-semibold">{user?.name || 'Prestataire'}</p>
              </div>
              <nav className="p-4">
                <ul className="space-y-4">
                  <li>
                    <Link 
                      to="/prestataire/dashboard"
                      className={`flex items-center p-3 rounded-lg hover:bg-purple-50 transition-colors ${isActive('/prestataire/dashboard') ? 'bg-purple-100 text-purple-700' : 'text-gray-700'}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <FaTachometerAlt className="mr-3" size={20} />
                      <span className="text-lg font-medium">Tableau de bord</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/prestataire/prestations"
                      className={`flex items-center p-3 rounded-lg hover:bg-purple-50 transition-colors ${isActive('/prestataire/prestations') ? 'bg-purple-100 text-purple-700' : 'text-gray-700'}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <FaClipboardList className="mr-3" size={20} />
                      <span className="text-lg font-medium">Mes prestations</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/prestataire/disponibilites"
                      className={`flex items-center p-3 rounded-lg hover:bg-purple-50 transition-colors ${isActive('/prestataire/disponibilites') ? 'bg-purple-100 text-purple-700' : 'text-gray-700'}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <FaCalendarAlt className="mr-3" size={20} />
                      <span className="text-lg font-medium">Calendrier</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/prestataire/factures"
                      className={`flex items-center p-3 rounded-lg hover:bg-purple-50 transition-colors ${isActive('/prestataire/factures') ? 'bg-purple-100 text-purple-700' : 'text-gray-700'}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <FaFileInvoiceDollar className="mr-3" size={20} />
                      <span className="text-lg font-medium">Mes factures</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/prestataire/evaluations"
                      className={`flex items-center p-3 rounded-lg hover:bg-purple-50 transition-colors ${isActive('/prestataire/evaluations') ? 'bg-purple-100 text-purple-700' : 'text-gray-700'}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <FaStar className="mr-3" size={20} />
                      <span className="text-lg font-medium">Évaluations</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/prestataire/profil"
                      className={`flex items-center p-3 rounded-lg hover:bg-purple-50 transition-colors ${isActive('/prestataire/profil') ? 'bg-purple-100 text-purple-700' : 'text-gray-700'}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <FaUser className="mr-3" size={20} />
                      <span className="text-lg font-medium">Mon profil</span>
                    </Link>
                  </li>
                  <li>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center p-3 rounded-lg hover:bg-purple-50 transition-colors text-gray-700"
                    >
                      <FaSignOutAlt className="mr-3" size={20} />
                      <span className="text-lg font-medium">Déconnexion</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}

        {/* Contenu principal */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PrestataireLayout;
