import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

// Layout
import PrestataireLayout from '../components/prestataire/PrestataireLayout';

// Pages
import Dashboard from '../pages/prestataire/Dashboard';
import Prestations from '../pages/prestataire/Prestations';
import Disponibilites from '../pages/prestataire/Disponibilites';
import Factures from '../pages/prestataire/Factures';
import Profil from '../pages/prestataire/Profil';
import Evaluations from '../pages/prestataire/Evaluations';

/**
 * Protection de route pour les prestataires
 * Vérifie si l'utilisateur est connecté et a le rôle de prestataire
 */
const PrestataireRoute = () => {
  const { isLoggedIn, user } = useAuthStore();
  
  // Vérifier si l'utilisateur est connecté
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  // Vérifier si l'utilisateur a le rôle de prestataire
  if (user?.role !== 'prestataire') {
    return <Navigate to="/" replace />;
  }
  
  // L'utilisateur est connecté et a le rôle de prestataire
  return <Outlet />;
};

/**
 * Configuration des routes pour l'espace prestataire
 */
const prestataireRoutes = [
  {
    path: '/prestataire',
    element: (
      <PrestataireRoute>
        <PrestataireLayout />
      </PrestataireRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/prestataire/tableau-de-bord" replace />
      },
      {
        path: 'tableau-de-bord',
        element: <Dashboard />
      },
      {
        path: 'prestations',
        element: <Prestations />
      },
      {
        path: 'disponibilites',
        element: <Disponibilites />
      },
      {
        path: 'factures',
        element: <Factures />
      },
      {
        path: 'profil',
        element: <Profil />
      },
      {
        path: 'evaluations',
        element: <Evaluations />
      }
    ]
  }
];

export default prestataireRoutes;
