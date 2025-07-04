import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { FaHome, FaBoxOpen, FaTruck, FaCalendarAlt, FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

const LivreurLayout = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleLogout = () => {
    logout();
    // La redirection vers la page d'accueil est gérée par le store
  };
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  
  // Détecter les changements de taille d'écran
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false); // Fermer le menu sur grand écran
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Fermer le menu quand on change de route
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);
  
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };
  
  const navigateTo = (path) => {
    navigate(path);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };
  
  return (
    <div className="relative min-h-screen bg-gray-100">
      {/* Header mobile */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-green-800 p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-white">EcoDeli</h1>
          <span className="ml-2 text-sm text-green-200">Espace Livreur</span>
        </div>
        <button 
          onClick={toggleSidebar} 
          className="text-white p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300"
          aria-label="Menu"
        >
          {isSidebarOpen ? (
            <FaTimes size={24} />
          ) : (
            <FaBars size={24} />
          )}
        </button>
      </header>

      {/* Overlay sombre quand le menu est ouvert sur mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 z-30" 
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* Menu mobile (plein écran) */}
      {isMobile && (
        <nav 
          className={`fixed inset-0 z-50 bg-green-800 transform ${isSidebarOpen ? 'translate-y-0' : '-translate-y-full'} transition-transform duration-300 ease-in-out flex flex-col pt-16 pb-6 px-4 overflow-y-auto`}
          aria-hidden={!isSidebarOpen}
        >
          <div className="mb-8 p-2 border-b border-green-700 pb-4">
            <div className="flex items-center justify-center mb-4">
              <FaUser size={48} className="text-green-300" />
            </div>
            <h2 className="text-center font-medium text-lg text-white">{user?.name || 'Livreur'}</h2>
          </div>
          
          <div className="flex-1 space-y-1">
            <button 
              onClick={() => navigateTo('/livreur/dashboard')} 
              className={`w-full flex items-center py-4 px-3 rounded-md ${isActive('/livreur/dashboard') ? 'bg-green-700' : 'hover:bg-green-700'}`}
            >
              <FaHome className="mr-3" size={20} />
              <span className="text-lg">Tableau de bord</span>
            </button>
            
            <button 
              onClick={() => navigateTo('/livreur/annonces/create')} 
              className={`w-full flex items-center py-4 px-3 rounded-md ${isActive('/livreur/annonces/create') ? 'bg-green-700' : 'hover:bg-green-700'}`}
            >
              <FaBoxOpen className="mr-3" size={20} />
              <span className="text-lg">Créer une annonce</span>
            </button>
            
            <button 
              onClick={() => navigateTo('/livreur/livraisons')} 
              className={`w-full flex items-center py-4 px-3 rounded-md ${isActive('/livreur/livraisons') ? 'bg-green-700' : 'hover:bg-green-700'}`}
            >
              <FaTruck className="mr-3" size={20} />
              <span className="text-lg">Mes livraisons</span>
            </button>
            
            <button 
              onClick={() => navigateTo('/livreur/disponibilites')} 
              className={`w-full flex items-center py-4 px-3 rounded-md ${isActive('/livreur/disponibilites') ? 'bg-green-700' : 'hover:bg-green-700'}`}
            >
              <FaCalendarAlt className="mr-3" size={20} />
              <span className="text-lg">Mes disponibilités</span>
            </button>
            
            <button 
              onClick={() => navigateTo('/livreur/profil')} 
              className={`w-full flex items-center py-4 px-3 rounded-md ${isActive('/livreur/profil') ? 'bg-green-700' : 'hover:bg-green-700'}`}
            >
              <FaUser className="mr-3" size={20} />
              <span className="text-lg">Mon profil</span>
            </button>
          </div>
          
          <button 
            onClick={handleLogout}
            className="mt-6 w-full flex items-center py-4 px-3 rounded-md bg-red-700 hover:bg-red-800 transition-colors"
          >
            <FaSignOutAlt className="mr-3" size={20} />
            <span className="text-lg">Déconnexion</span>
          </button>
        </nav>
      )}

      {/* Barre latérale desktop */}
      {!isMobile && (
        <aside className="hidden md:block fixed md:static top-0 left-0 z-30 w-64 h-full bg-green-800 text-white overflow-y-auto">

        <div className="p-4 border-b border-green-700">
          <h1 className="text-xl font-bold">EcoDeli</h1>
          <p className="text-sm opacity-75">Espace Livreur</p>
        </div>
        
        <div className="p-4">
          <span className="text-sm text-green-300">Bienvenue,</span>
          <h2 className="font-medium text-lg">{user?.name || 'Livreur'}</h2>
        </div>
        
        <nav className="mt-4">
          <ul>
            <li>
              <Link 
                to="/livreur/dashboard" 
                className={`flex items-center px-4 py-3 hover:bg-green-700 ${isActive('/livreur/dashboard') ? 'bg-green-700' : ''}`}
              >
                <FaHome className="mr-3" />
                <span>Tableau de bord</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/livreur/annonces/create" 
                className={`flex items-center px-4 py-3 hover:bg-green-700 ${isActive('/livreur/annonces/create') ? 'bg-green-700' : ''}`}
              >
                <FaBoxOpen className="mr-3" />
                <span>Créer une annonce</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/livreur/livraisons" 
                className={`flex items-center px-4 py-3 hover:bg-green-700 ${isActive('/livreur/livraisons') ? 'bg-green-700' : ''}`}
              >
                <FaTruck className="mr-3" />
                <span>Mes livraisons</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/livreur/disponibilites" 
                className={`flex items-center px-4 py-3 hover:bg-green-700 ${isActive('/livreur/disponibilites') ? 'bg-green-700' : ''}`}
              >
                <FaCalendarAlt className="mr-3" />
                <span>Mes disponibilités</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/profile" 
                className={`flex items-center px-4 py-3 hover:bg-green-700 ${isActive('/profile') ? 'bg-green-700' : ''}`}
              >
                <FaUser className="mr-3" />
                <span>Mon profil</span>
              </Link>
            </li>
            <li>
              <button 
                onClick={handleLogout}
                className="flex items-center w-full text-left px-4 py-3 hover:bg-green-700"
              >
                <FaSignOutAlt className="mr-3" />
                <span>Déconnexion</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>
      )}
      
      {/* Contenu principal */}
      <main className="md:ml-64">
        <div className="p-4 sm:p-6 pt-20 md:pt-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default LivreurLayout;
