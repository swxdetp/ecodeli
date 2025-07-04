import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaUser, FaCalendarAlt, FaClock, FaEuroSign, FaFilter, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import PrestataireService from '../../api/prestataire.service';

const PrestationCard = ({ prestation, onAccept, onRefuse, onComplete }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [refusalReason, setRefusalReason] = useState('');
  const [showRefusalForm, setShowRefusalForm] = useState(false);
  
  // Formatage de la date et heure
  const formatDateTime = (dateString) => {
    const options = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  // Formatage du montant
  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
  };
  
  // Style et texte basés sur le statut
  const getStatusInfo = (status) => {
    switch (status) {
      case 'en_cours':
        return { 
          text: 'En cours', 
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          actions: ['complete']
        };
      case 'a_venir':
        return { 
          text: 'À venir', 
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-800',
          actions: ['accept', 'refuse']
        };
      case 'terminee':
        return { 
          text: 'Terminée', 
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          actions: []
        };
      case 'annulee':
        return { 
          text: 'Annulée', 
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          actions: []
        };
      default:
        return { 
          text: status, 
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          actions: []
        };
    }
  };
  
  const statusInfo = getStatusInfo(prestation.status);
  
  // Gestion du refus
  const handleRefuse = () => {
    if (refusalReason.trim() === '') {
      toast.error("Veuillez indiquer une raison de refus");
      return;
    }
    
    onRefuse(prestation.id, refusalReason);
    setShowRefusalForm(false);
    setRefusalReason('');
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
      {/* Entête */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">
            {prestation.type.charAt(0).toUpperCase() + prestation.type.slice(1).replace(/_/g, ' ')}
          </h3>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.bgColor} ${statusInfo.textColor}`}>
            {statusInfo.text}
          </span>
        </div>
        <p className="text-gray-600 text-sm">{prestation.description}</p>
      </div>
      
      {/* Informations principales */}
      <div className="p-5 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="flex items-center">
          <FaCalendarAlt className="text-purple-500 mr-2" />
          <span className="text-gray-700 text-sm">
            {formatDateTime(prestation.date_debut)}
          </span>
        </div>
        
        <div className="flex items-center">
          <FaUser className="text-purple-500 mr-2" />
          <span className="text-gray-700 text-sm">
            {prestation.client.nom}
          </span>
        </div>
        
        <div className="flex items-center">
          <FaEuroSign className="text-purple-500 mr-2" />
          <span className="text-gray-700 text-sm font-semibold">
            {formatMontant(prestation.montant)}
          </span>
        </div>
      </div>
      
      {/* Détails (collapsible) */}
      {showDetails && (
        <div className="p-5 border-b border-gray-100 bg-gray-50">
          <h4 className="font-semibold mb-3">Détails de l'intervention</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h5 className="text-sm text-gray-500 mb-1">Horaires</h5>
              <div className="flex items-center">
                <FaClock className="text-purple-500 mr-2" />
                <div>
                  <div className="text-sm">Début: {formatDateTime(prestation.date_debut)}</div>
                  <div className="text-sm">Fin: {formatDateTime(prestation.date_fin)}</div>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="text-sm text-gray-500 mb-1">Client</h5>
              <div className="flex items-center mb-2">
                <FaUser className="text-purple-500 mr-2" />
                <span className="text-sm">{prestation.client.nom}</span>
              </div>
              <div className="text-sm">Tél: {prestation.client.telephone}</div>
            </div>
          </div>
          
          <div className="mb-4">
            <h5 className="text-sm text-gray-500 mb-1">Adresse</h5>
            <div className="flex items-start">
              <FaMapMarkerAlt className="text-purple-500 mr-2 mt-1" />
              <div>
                {prestation.adresse && (
                  <p className="text-sm">{prestation.adresse}</p>
                )}
                {prestation.adresse_depart && (
                  <div>
                    <p className="text-sm"><strong>Départ:</strong> {prestation.adresse_depart}</p>
                    <p className="text-sm"><strong>Arrivée:</strong> {prestation.adresse_arrivee}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="p-4 flex flex-wrap items-center justify-between">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-purple-600 hover:text-purple-800 font-medium"
        >
          {showDetails ? 'Masquer les détails' : 'Voir les détails'}
        </button>
        
        <div className="flex space-x-2">
          {showRefusalForm ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={refusalReason}
                onChange={(e) => setRefusalReason(e.target.value)}
                placeholder="Raison du refus"
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              />
              <button
                onClick={handleRefuse}
                className="bg-red-600 text-white rounded px-3 py-1 text-sm hover:bg-red-700"
              >
                Confirmer
              </button>
              <button
                onClick={() => setShowRefusalForm(false)}
                className="bg-gray-300 text-gray-700 rounded px-3 py-1 text-sm hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          ) : (
            <>
              {statusInfo.actions.includes('accept') && (
                <button
                  onClick={() => onAccept(prestation.id)}
                  className="bg-green-600 text-white rounded px-4 py-1 text-sm hover:bg-green-700"
                >
                  Accepter
                </button>
              )}
              {statusInfo.actions.includes('refuse') && (
                <button
                  onClick={() => setShowRefusalForm(true)}
                  className="bg-red-600 text-white rounded px-4 py-1 text-sm hover:bg-red-700"
                >
                  Refuser
                </button>
              )}
              {statusInfo.actions.includes('complete') && (
                <button
                  onClick={() => onComplete(prestation.id)}
                  className="bg-blue-600 text-white rounded px-4 py-1 text-sm hover:bg-blue-700"
                >
                  Terminer
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const PrestatairePrestation = () => {
  const [prestations, setPrestations] = useState([]);
  const [filteredPrestations, setFilteredPrestations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchPrestations = async () => {
      try {
        setIsLoading(true);
        // En production, utiliser l'API réelle
        // const response = await PrestataireService.getPrestations();
        
        // Pour le développement, utiliser les données mock
        const response = await PrestataireService.mockData.getPrestations();
        
        if (response.data && response.data.success) {
          setPrestations(response.data.data.prestations || []);
          setFilteredPrestations(response.data.data.prestations || []);
        } else {
          toast.error("Erreur lors de la récupération des prestations");
        }
      } catch (error) {
        console.error("Erreur lors du chargement des prestations:", error);
        toast.error("Impossible de charger les prestations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrestations();
  }, []);

  // Appliquer les filtres et la recherche
  useEffect(() => {
    let result = [...prestations];
    
    // Filtrer par statut
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status === statusFilter);
    }
    
    // Filtrer par recherche
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.description.toLowerCase().includes(term) || 
        p.client.nom.toLowerCase().includes(term) ||
        (p.adresse && p.adresse.toLowerCase().includes(term)) ||
        (p.adresse_depart && p.adresse_depart.toLowerCase().includes(term)) ||
        (p.adresse_arrivee && p.adresse_arrivee.toLowerCase().includes(term))
      );
    }
    
    setFilteredPrestations(result);
  }, [statusFilter, searchTerm, prestations]);

  // Accepter une prestation
  const handleAccept = async (id) => {
    try {
      // En production: await PrestataireService.accepterPrestation(id);
      toast.success("La prestation a été acceptée");
      
      // Mettre à jour l'état local
      const updatedPrestations = prestations.map(p => {
        if (p.id === id) {
          return { ...p, status: 'en_cours' };
        }
        return p;
      });
      
      setPrestations(updatedPrestations);
    } catch (error) {
      console.error("Erreur lors de l'acceptation de la prestation:", error);
      toast.error("Impossible d'accepter la prestation");
    }
  };

  // Refuser une prestation
  const handleRefuse = async (id, raison) => {
    try {
      // En production: await PrestataireService.refuserPrestation(id, raison);
      toast.success("La prestation a été refusée");
      
      // Mettre à jour l'état local
      const updatedPrestations = prestations.map(p => {
        if (p.id === id) {
          return { ...p, status: 'annulee' };
        }
        return p;
      });
      
      setPrestations(updatedPrestations);
    } catch (error) {
      console.error("Erreur lors du refus de la prestation:", error);
      toast.error("Impossible de refuser la prestation");
    }
  };

  // Terminer une prestation
  const handleComplete = async (id) => {
    try {
      // En production: await PrestataireService.terminerPrestation(id);
      toast.success("La prestation a été marquée comme terminée");
      
      // Mettre à jour l'état local
      const updatedPrestations = prestations.map(p => {
        if (p.id === id) {
          return { ...p, status: 'terminee' };
        }
        return p;
      });
      
      setPrestations(updatedPrestations);
    } catch (error) {
      console.error("Erreur lors de la finalisation de la prestation:", error);
      toast.error("Impossible de terminer la prestation");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-purple-600 mb-6">Mes prestations</h1>
      
      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex items-center md:w-1/3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher..."
              className="bg-gray-50 border border-gray-300 text-gray-900 pl-10 pr-3 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center md:w-1/3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaFilter className="text-gray-400" />
            </div>
            <select
              className="bg-gray-50 border border-gray-300 text-gray-900 pl-10 pr-3 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="a_venir">À venir</option>
              <option value="en_cours">En cours</option>
              <option value="terminee">Terminées</option>
              <option value="annulee">Annulées</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : filteredPrestations.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">Aucune prestation ne correspond à vos critères</p>
        </div>
      ) : (
        <div>
          {filteredPrestations.map(prestation => (
            <PrestationCard 
              key={prestation.id} 
              prestation={prestation}
              onAccept={handleAccept}
              onRefuse={handleRefuse}
              onComplete={handleComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PrestatairePrestation;
