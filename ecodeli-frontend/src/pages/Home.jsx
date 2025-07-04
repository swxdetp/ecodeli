import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-green-700 mb-8">
            Bienvenue sur EcoDeli
          </h1>
          <p className="text-xl mb-10 text-gray-600">
            La plateforme écologique de livraison qui connecte clients et livreurs 
            pour un service rapide et respectueux de l'environnement.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Vous êtes un client ?</h2>
              <p className="mb-6 text-gray-600">
                Publiez vos annonces de livraison et trouvez rapidement un livreur écologique.
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/login" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition">
                  Se connecter
                </Link>
                <Link to="/register" className="border border-green-600 text-green-600 px-4 py-2 rounded-md hover:bg-green-50 transition">
                  S'inscrire
                </Link>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Vous êtes un livreur ?</h2>
              <p className="mb-6 text-gray-600">
                Rejoignez notre réseau de livreurs eco-responsables et recevez des missions.
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/login" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition">
                  Se connecter
                </Link>
                <Link to="/register" className="border border-green-600 text-green-600 px-4 py-2 rounded-md hover:bg-green-50 transition">
                  S'inscrire
                </Link>
              </div>
            </div>
          </div>
          
          <div className="mt-12">
            <h2 className="text-3xl font-bold mb-8">Comment ça marche ?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-4xl font-bold text-green-600 mb-4">1</div>
                <h3 className="text-xl font-semibold mb-3">Créez une annonce</h3>
                <p className="text-gray-600">Décrivez votre besoin de livraison, le lieu et le créneau horaire souhaité.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-4xl font-bold text-green-600 mb-4">2</div>
                <h3 className="text-xl font-semibold mb-3">Un livreur accepte</h3>
                <p className="text-gray-600">Un livreur écologique de notre réseau accepte votre demande et vient récupérer votre colis.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-4xl font-bold text-green-600 mb-4">3</div>
                <h3 className="text-xl font-semibold mb-3">Livraison effectuée</h3>
                <p className="text-gray-600">Suivez la livraison en temps réel jusqu'à la réception par le destinataire.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-10">
            <Link to="/annonces" className="inline-block bg-green-600 text-white px-6 py-3 rounded-md text-lg hover:bg-green-700 transition">
              Voir les annonces disponibles
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
