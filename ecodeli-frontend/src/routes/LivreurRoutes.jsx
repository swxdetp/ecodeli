import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

// Layout
import LivreurLayout from '../components/livreur/LivreurLayout';

// Pages livreur
import Dashboard from '../pages/livreur/Dashboard';
import Annonces from '../pages/livreur/Annonces';
import Livraisons from '../pages/livreur/Livraisons';
import Profil from '../pages/livreur/Profil';
import MapTest from '../pages/livreur/MapTest';

const LivreurRoutes = () => {
  const { isAuthenticated, user } = useAuthStore();
  
  // Vérifier si l'utilisateur est authentifié et a le rôle de livreur
  if (!isAuthenticated || user?.role !== 'livreur') {
    return <Navigate to="/login" />;
  }
  
  return (
    <Routes>
      <Route element={<LivreurLayout />}>
        <Route path="" element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="annonces" element={<Annonces />} />
        <Route path="livraisons" element={<Livraisons />} />
        <Route path="profil" element={<Profil />} />
        <Route path="map-test" element={<MapTest />} />
      </Route>
      
      {/* Route par défaut - rediriger vers le tableau de bord */}
      <Route path="*" element={<Navigate to="dashboard" />} />
    </Routes>
  );
};

export default LivreurRoutes;
