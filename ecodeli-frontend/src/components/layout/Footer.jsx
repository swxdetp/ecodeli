import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 text-center sm:text-left">
          <div>
            <h3 className="text-xl font-bold mb-4">EcoDeli</h3>
            <p className="text-gray-300">
              Livraison écologique pour un monde durable.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Liens utiles</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/annonces" className="text-gray-300 hover:text-white">
                  Annonces
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white">
                  Espace client
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-300">Email: contact@ecodeli.fr</li>
              <li className="text-gray-300">Téléphone: +33 01 23 45 67 89</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-6 md:mt-8 pt-4 md:pt-6 text-center text-gray-400">
          <p className="text-sm md:text-base">&copy; {new Date().getFullYear()} EcoDeli - Tous droits réservés</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
