import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';

// Layout
import MainLayout from './components/layout/MainLayout';
import PrivateRoute from './components/layout/PrivateRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Listings from './pages/Listings';
import ListingDetail from './pages/ListingDetail';
import ListingForm from './pages/ListingForm';

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
            
            {/* Gestion des annonces */}
            <Route path="/annonces/create" element={<ListingForm />} />
            <Route path="/annonces/edit/:id" element={<ListingForm />} />
            
            {/* Compatibilité avec les anciens chemins */}
            <Route path="/listings/create" element={<Navigate to="/annonces/create" replace />} />
            <Route path="/listings/:id/edit" element={<Navigate to="/annonces/edit/:id" replace />} />
          </Route>
          
          {/* Route par défaut - redirection vers l'accueil */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
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
