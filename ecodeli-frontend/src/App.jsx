import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';

// Layout
import MainLayout from './components/layout/MainLayout';
import PrivateRoute from './components/layout/PrivateRoute';
import AdminRoute from './components/layout/AdminRoute';
import AdminLayout from './components/layout/AdminLayout';
import LivreurRoutes from './routes/LivreurRoutes';
import PrestataireRoutes from './routes/PrestataireRoutes';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Listings from './pages/Listings';
import ListingDetail from './pages/ListingDetail';
import ListingForm from './pages/ListingForm';
import Profile from './pages/Profile';

// Pages Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminAnnonces from './pages/admin/Annonces';
import AdminLivraisons from './pages/admin/Livraisons';
import AdminInvitations from './pages/admin/Invitations';
import LivraisonsValidation from './pages/admin/LivraisonsValidation';

// Page de test
import TestAuth from './pages/TestAuth';

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes publiques avec MainLayout */}
        <Route element={<MainLayout />}>
          {/* Page d'accueil */}
          <Route path="/" element={<Home />} />
          
          {/* Routes d'authentification */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Routes des annonces publiques */}
          <Route path="/annonces" element={<Listings />} />
          <Route path="/annonces/:id" element={<ListingDetail />} />
          
          {/* Compatibilité avec les anciens chemins */}
          <Route path="/listings" element={<Navigate to="/annonces" replace />} />
          <Route path="/listings/:id" element={<Navigate to="/annonces/:id" replace />} />
          
          {/* Routes protégées */}
          <Route element={<PrivateRoute />}>
            {/* Dashboard utilisateur */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Gestion des annonces */}
            <Route path="/annonces/create" element={<ListingForm />} />
            <Route path="/annonces/edit/:id" element={<ListingForm />} />
            
            {/* Compatibilité avec les anciens chemins */}
            <Route path="/listings/create" element={<Navigate to="/annonces/create" replace />} />
            <Route path="/listings/:id/edit" element={<Navigate to="/annonces/edit/:id" replace />} />
          </Route>
          
          {/* Page de test d'authentification */}
          <Route path="/test-auth" element={<TestAuth />} />
          
          {/* Route par défaut pour les utilisateurs standards */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
        
        {/* Console d'administration avec son propre layout */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/annonces" element={<AdminAnnonces />} />
            <Route path="/admin/livraisons" element={<AdminLivraisons />} />
            <Route path="/admin/livraisons/validation" element={<LivraisonsValidation />} />
            <Route path="/admin/invitations" element={<AdminInvitations />} />
          </Route>
        </Route>
        
        {/* Espace livreur */}
        <Route path="/livreur/*" element={<LivreurRoutes />} />
        
        {/* Espace prestataire */}
        <Route path="/prestataire/*" element={<PrestataireRoutes />} />
        
        {/* Route par défaut globale */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* Configuration globale des notifications */}
      <ToastContainer 
        position="top-right"
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
    </Router>
  );
}

export default App;
