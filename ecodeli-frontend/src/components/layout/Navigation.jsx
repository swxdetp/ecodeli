import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Navigation = () => {
  const { isAuthenticated, user } = useAuth();

  // Style pour les liens actifs
  const activeStyle = "font-medium text-green-600";
  const normalStyle = "text-gray-600 hover:text-green-600";

  // Liens pour utilisateurs authentifiés seulement
  const authenticatedLinks = [
    { to: "/dashboard", label: "Tableau de bord" },
    { to: "/annonces/create", label: "Créer une annonce" },
    { to: "/profile", label: "Mon profil" },
  ];

  // Liens publics (accessibles à tous)
  const publicLinks = [
    { to: "/", label: "Accueil", exact: true },
    { to: "/annonces", label: "Annonces" },
  ];

  return (
    <nav className="bg-white py-2 border-b">
      <div className="container mx-auto px-4">
        <div className="flex space-x-6">
          {publicLinks.map((link, index) => (
            <NavLink
              key={index}
              to={link.to}
              end={link.exact}
              className={({ isActive }) => 
                isActive ? activeStyle : normalStyle
              }
            >
              {link.label}
            </NavLink>
          ))}

          {isAuthenticated && (
            <>
              {authenticatedLinks.map((link, index) => (
                <NavLink
                  key={index}
                  to={link.to}
                  className={({ isActive }) => 
                    isActive ? activeStyle : normalStyle
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
