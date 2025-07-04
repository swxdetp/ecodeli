import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Header from './Header';
import Footer from './Footer';
import Navigation from './Navigation'; // Added import statement for Navigation component
import 'react-toastify/dist/ReactToastify.css';

const MainLayout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Détecter les changements de taille d'écran pour optimiser les composants enfants
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Header />
      <Navigation />
      <main className="flex-grow px-3 sm:px-4 md:px-6 lg:px-8 w-full">
        {/* Conteneur pour le contenu avec marge supérieure optimisée pour mobile */}
        <div className="pt-4 sm:pt-6 w-full">
          <Outlet />
        </div>
      </main>
      <Footer />
      <ToastContainer 
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default MainLayout;
