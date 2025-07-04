import React, { useState } from 'react';
import useAuthStore from '../../store/authStore';
import { toast } from 'react-toastify';

const Disponibilites = () => {
  const { user } = useAuthStore();
  const [disponibilites, setDisponibilites] = useState({
    lundi: { matin: false, apresMidi: false, soir: false },
    mardi: { matin: false, apresMidi: false, soir: false },
    mercredi: { matin: false, apresMidi: false, soir: false },
    jeudi: { matin: false, apresMidi: false, soir: false },
    vendredi: { matin: false, apresMidi: false, soir: false },
    samedi: { matin: false, apresMidi: false, soir: false },
    dimanche: { matin: false, apresMidi: false, soir: false },
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (jour, periode) => {
    setDisponibilites(prev => ({
      ...prev,
      [jour]: {
        ...prev[jour],
        [periode]: !prev[jour][periode]
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Simule un appel API (à remplacer par un vrai appel quand le backend sera prêt)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Disponibilités mises à jour avec succès');
      setIsSaving(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la mise à jour des disponibilités');
      setIsSaving(false);
    }
  };

  const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  const periodes = [
    { id: 'matin', label: 'Matin (6h-12h)' },
    { id: 'apresMidi', label: 'Après-midi (12h-18h)' },
    { id: 'soir', label: 'Soir (18h-00h)' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-green-600 mb-6">Mes disponibilités</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="mb-4 text-gray-700">
          Définissez vos disponibilités pour recevoir des propositions de livraisons qui correspondent à votre emploi du temps.
        </p>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Jour</th>
                {periodes.map(periode => (
                  <th key={periode.id} className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                    {periode.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jours.map(jour => (
                <tr key={jour} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium capitalize">{jour}</td>
                  {periodes.map(periode => (
                    <td key={`${jour}-${periode.id}`} className="px-4 py-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`${jour}-${periode.id}`}
                          checked={disponibilites[jour][periode.id]}
                          onChange={() => handleToggle(jour, periode.id)}
                          className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <label htmlFor={`${jour}-${periode.id}`} className="ml-2 text-sm text-gray-700">
                          Disponible
                        </label>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Sauvegarde en cours...' : 'Enregistrer mes disponibilités'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Disponibilites;
