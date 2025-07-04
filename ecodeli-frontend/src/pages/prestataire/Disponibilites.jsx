import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import PrestataireService from '../../api/prestataire.service';

/**
 * Page de gestion des disponibilités pour les prestataires
 * Permet de définir ses disponibilités sur un calendrier mensuel
 */
const PrestataireDisponibilites = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendar, setCalendar] = useState([]);
  const [disponibilites, setDisponibilites] = useState({});
  const [initialDisponibilites, setInitialDisponibilites] = useState({});
  
  // Noms des jours et mois en français
  const joursSemaine = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const moisNoms = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // Générer le calendrier pour le mois actuel
  const genererCalendrier = (date) => {
    const annee = date.getFullYear();
    const mois = date.getMonth();
    
    // Premier jour du mois
    const premierJour = new Date(annee, mois, 1);
    const premierJourSemaine = premierJour.getDay(); // 0 = dimanche, 1 = lundi, ...
    
    // Dernier jour du mois
    const dernierJour = new Date(annee, mois + 1, 0);
    const nbJoursMois = dernierJour.getDate();
    
    // Tableau des semaines et jours
    const semaines = [];
    let jours = [];
    
    // Jours du mois précédent (pour compléter la première semaine)
    const dernierJourMoisPrecedent = new Date(annee, mois, 0).getDate();
    for (let i = premierJourSemaine; i > 0; i--) {
      const jour = dernierJourMoisPrecedent - i + 1;
      jours.push({ 
        jour, 
        mois: mois - 1, 
        annee,
        estMoisCourant: false
      });
    }
    
    // Jours du mois courant
    for (let i = 1; i <= nbJoursMois; i++) {
      const jourDate = new Date(annee, mois, i);
      jours.push({ 
        jour: i, 
        mois, 
        annee,
        estMoisCourant: true,
        jourSemaine: jourDate.getDay(),
        dateFormatee: `${annee}-${String(mois + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      });
      
      // Si on atteint la fin d'une semaine ou la fin du mois
      if (jours.length === 7) {
        semaines.push([...jours]);
        jours = [];
      }
    }
    
    // Jours du mois suivant (pour compléter la dernière semaine)
    if (jours.length > 0) {
      for (let i = 1; jours.length < 7; i++) {
        jours.push({ 
          jour: i, 
          mois: mois + 1, 
          annee,
          estMoisCourant: false
        });
      }
      semaines.push([...jours]);
    }
    
    return semaines;
  };

  // Changer de mois
  const changerMois = (increment) => {
    // Sauvegarder les modifications non enregistrées
    if (hasChanges()) {
      if (window.confirm("Vous avez des modifications non enregistrées. Voulez-vous les sauvegarder avant de changer de mois ?")) {
        handleSaveDisponibilites();
      }
    }
    
    // Changer de mois
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
  };
  
  // Vérifier s'il y a des changements non enregistrés
  const hasChanges = () => {
    const currentKeys = Object.keys(disponibilites);
    const initialKeys = Object.keys(initialDisponibilites);
    
    if (currentKeys.length !== initialKeys.length) return true;
    
    for (const date of currentKeys) {
      if (!initialDisponibilites[date]) return true;
      
      const initial = initialDisponibilites[date];
      const current = disponibilites[date];
      
      if (initial.matin !== current.matin || 
          initial.apres_midi !== current.apres_midi || 
          initial.soir !== current.soir) {
        return true;
      }
    }
    
    return false;
  };

  // Charger les disponibilités
  useEffect(() => {
    const fetchDisponibilites = async () => {
      try {
        setIsLoading(true);
        
        const mois = currentDate.getMonth() + 1;
        const annee = currentDate.getFullYear();
        
        // En production, utiliser l'API réelle
        // const response = await PrestataireService.getDisponibilites(mois, annee);
        
        // Pour le développement, utiliser les données mock
        const response = await PrestataireService.mockData.getDisponibilites();
        
        if (response.data && response.data.success) {
          const disponibilitesData = response.data.data.disponibilites || [];
          
          // Convertir le tableau en objet pour un accès plus facile
          const disponibilitesObj = {};
          disponibilitesData.forEach(item => {
            disponibilitesObj[item.date] = {
              matin: item.matin,
              apres_midi: item.apres_midi,
              soir: item.soir
            };
          });
          
          setDisponibilites(disponibilitesObj);
          setInitialDisponibilites({...disponibilitesObj});
        } else {
          toast.error("Erreur lors de la récupération des disponibilités");
        }
        
        // Générer le calendrier
        const calendarData = genererCalendrier(currentDate);
        setCalendar(calendarData);
      } catch (error) {
        console.error("Erreur lors du chargement des disponibilités:", error);
        toast.error("Impossible de charger les disponibilités");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDisponibilites();
  }, [currentDate]);

  // Gérer la modification d'une disponibilité
  const handleDisponibiliteChange = (date, plage, isAvailable) => {
    setDisponibilites(prev => {
      const newDispos = {...prev};
      
      if (!newDispos[date]) {
        newDispos[date] = {
          matin: false,
          apres_midi: false,
          soir: false
        };
      }
      
      newDispos[date][plage] = isAvailable;
      
      return newDispos;
    });
  };

  // Enregistrer les disponibilités
  const handleSaveDisponibilites = async () => {
    try {
      setIsSaving(true);
      
      // Convertir l'objet en tableau pour l'API
      const disponibilitesArray = Object.entries(disponibilites).map(([date, plages]) => ({
        date,
        matin: plages.matin,
        apres_midi: plages.apres_midi,
        soir: plages.soir
      }));
      
      // En production, utiliser l'API réelle
      // await PrestataireService.updateDisponibilites(disponibilitesArray);
      
      // Simuler un délai d'attente
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Vos disponibilités ont été enregistrées avec succès");
      setInitialDisponibilites({...disponibilites});
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des disponibilités:", error);
      toast.error("Impossible d'enregistrer les disponibilités");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-purple-600 mb-6">Gérer mes disponibilités</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          {/* En-tête du calendrier */}
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => changerMois(-1)}
              className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
            >
              <FaChevronLeft className="text-gray-600" />
            </button>
            
            <h2 className="text-xl font-semibold flex items-center">
              <FaCalendarAlt className="text-purple-600 mr-2" />
              {moisNoms[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            
            <button 
              onClick={() => changerMois(1)}
              className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
            >
              <FaChevronRight className="text-gray-600" />
            </button>
          </div>
          
          {/* Légende des plages horaires */}
          <div className="mb-4 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Sélectionnez vos disponibilités :</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-orange-200 rounded mr-2"></div>
                <span className="text-sm">Matin (8h - 12h)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-200 rounded mr-2"></div>
                <span className="text-sm">Après-midi (14h - 18h)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-200 rounded mr-2"></div>
                <span className="text-sm">Soir (18h - 20h)</span>
              </div>
            </div>
          </div>
          
          {/* Calendrier */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  {joursSemaine.map(jour => (
                    <th key={jour} className="p-2 text-center font-medium text-gray-600 border border-gray-200">
                      {jour}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calendar.map((semaine, index) => (
                  <tr key={index}>
                    {semaine.map((jour, jourIndex) => (
                      <td 
                        key={jourIndex}
                        className={`border border-gray-200 p-1 ${!jour.estMoisCourant ? 'bg-gray-100' : ''} ${jour.jourSemaine === 0 || jour.jourSemaine === 6 ? 'bg-gray-100' : ''}`}
                      >
                        {jour.estMoisCourant ? (
                          <div>
                            {/* Numéro du jour */}
                            <div className="text-right font-medium text-sm text-gray-600 pb-1">
                              {jour.jour}
                            </div>
                            
                            {/* Cases à cocher des disponibilités (uniquement pour les jours de semaine) */}
                            {jour.jourSemaine !== 0 && jour.jourSemaine !== 6 && (
                              <div className="flex flex-col space-y-1">
                                {/* Matin */}
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={disponibilites[jour.dateFormatee]?.matin || false}
                                    onChange={(e) => handleDisponibiliteChange(jour.dateFormatee, 'matin', e.target.checked)}
                                  />
                                  <span className={`block w-full h-5 rounded ${disponibilites[jour.dateFormatee]?.matin ? 'bg-orange-400' : 'bg-orange-200'} text-xs text-center text-white`}>
                                    {disponibilites[jour.dateFormatee]?.matin ? 'Matin ✓' : 'Matin'}
                                  </span>
                                </label>
                                
                                {/* Après-midi */}
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={disponibilites[jour.dateFormatee]?.apres_midi || false}
                                    onChange={(e) => handleDisponibiliteChange(jour.dateFormatee, 'apres_midi', e.target.checked)}
                                  />
                                  <span className={`block w-full h-5 rounded ${disponibilites[jour.dateFormatee]?.apres_midi ? 'bg-green-400' : 'bg-green-200'} text-xs text-center text-white`}>
                                    {disponibilites[jour.dateFormatee]?.apres_midi ? 'A-midi ✓' : 'A-midi'}
                                  </span>
                                </label>
                                
                                {/* Soir */}
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={disponibilites[jour.dateFormatee]?.soir || false}
                                    onChange={(e) => handleDisponibiliteChange(jour.dateFormatee, 'soir', e.target.checked)}
                                  />
                                  <span className={`block w-full h-5 rounded ${disponibilites[jour.dateFormatee]?.soir ? 'bg-blue-400' : 'bg-blue-200'} text-xs text-center text-white`}>
                                    {disponibilites[jour.dateFormatee]?.soir ? 'Soir ✓' : 'Soir'}
                                  </span>
                                </label>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-right font-medium text-sm text-gray-300">
                            {jour.jour}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Bouton d'enregistrement */}
          <div className="mt-6 flex justify-end">
            <button 
              onClick={handleSaveDisponibilites}
              disabled={isSaving || !hasChanges()}
              className={`flex items-center py-2 px-6 rounded-lg text-white ${hasChanges() ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Enregistrer mes disponibilités
                </>
              )}
            </button>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <p><strong>Note:</strong> Les prestations déjà programmées pendant vos heures de disponibilité ne sont pas modifiables ici.</p>
            <p>Pour annuler ou reporter une prestation existante, veuillez vous rendre dans la section "Mes prestations".</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrestataireDisponibilites;
