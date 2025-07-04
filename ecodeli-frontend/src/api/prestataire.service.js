import API from './axios-config';

/**
 * Service pour gérer les opérations API liées aux prestataires
 */
const PrestataireService = {
  /**
   * Récupérer les données du tableau de bord
   */
  getDashboard: () => {
    return API.get('/prestataire/dashboard');
  },
  
  /**
   * Récupérer le profil du prestataire
   */
  getProfil: () => {
    return API.get('/prestataire/profil');
  },
  
  /**
   * Mettre à jour le profil du prestataire
   */
  updateProfil: (data) => {
    return API.put('/prestataire/profil', data);
  },
  
  /**
   * Télécharger un document (pièce d'identité, diplômes, certifications...)
   */
  uploadDocument: (formData) => {
    return API.post('/prestataire/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  /**
   * Récupérer toutes les prestations du prestataire
   */
  getPrestations: (params = {}) => {
    return API.get('/prestataire/prestations', { params });
  },
  
  /**
   * Récupérer une prestation spécifique
   */
  getPrestation: (id) => {
    return API.get(`/prestataire/prestations/${id}`);
  },
  
  /**
   * Accepter une prestation
   */
  accepterPrestation: (id) => {
    return API.put(`/prestataire/prestations/${id}/accepter`);
  },
  
  /**
   * Refuser une prestation
   */
  refuserPrestation: (id, raison) => {
    return API.put(`/prestataire/prestations/${id}/refuser`, { raison });
  },
  
  /**
   * Marquer une prestation comme terminée
   */
  terminerPrestation: (id, details = {}) => {
    return API.put(`/prestataire/prestations/${id}/terminer`, details);
  },
  
  /**
   * Récupérer le calendrier de disponibilités du prestataire
   */
  getDisponibilites: (mois, annee) => {
    return API.get('/prestataire/disponibilites', { params: { mois, annee } });
  },
  
  /**
   * Mettre à jour les disponibilités du prestataire
   */
  updateDisponibilites: (disponibilites) => {
    return API.post('/prestataire/disponibilites', { disponibilites });
  },
  
  /**
   * Récupérer les factures du prestataire
   */
  getFactures: (params = {}) => {
    return API.get('/prestataire/factures', { params });
  },
  
  /**
   * Télécharger une facture au format PDF
   */
  downloadFacturePDF: (id) => {
    return API.get(`/prestataire/factures/${id}/download`, { responseType: 'blob' });
  },
  
  /**
   * Récupérer les évaluations du prestataire
   */
  getEvaluations: (params = {}) => {
    return API.get('/prestataire/evaluations', { params });
  },
  
  /**
   * Récupérer les types de prestations disponibles
   */
  getTypesPrestations: () => {
    return API.get('/prestataire/types-prestations');
  },
  
  /**
   * Mettre à jour les types de prestations que le prestataire peut réaliser
   */
  updateTypesPrestations: (typesPrestations) => {
    return API.put('/prestataire/types-prestations', { typesPrestations });
  },
  
  /**
   * Simuler les endpoints qui ne sont pas encore implémentés côté backend
   * À utiliser pendant le développement
   */
  mockData: {
    getDashboard: () => {
      return Promise.resolve({
        data: {
          success: true,
          data: {
            prestations_en_cours: 3,
            prestations_terminees: 15,
            revenus_mois: 450.75,
            revenus_total: 2830.50,
            note_moyenne: 4.7,
            prestations_recentes: [
              { id: 1, type: 'transport', status: 'en_cours', date: '2025-07-02', description: 'Transport de Mme Martin chez son médecin', client: 'Martin Sophie' },
              { id: 2, type: 'courses', status: 'terminee', date: '2025-06-28', description: 'Courses au supermarché local', client: 'Dubois Jean' },
              { id: 3, type: 'gardiennage', status: 'en_cours', date: '2025-07-01', description: 'Garde du chat pendant absence', client: 'Lefebvre Marie' }
            ]
          }
        }
      });
    },
    
    getPrestations: () => {
      return Promise.resolve({
        data: {
          success: true,
          data: {
            prestations: [
              {
                id: 1,
                type: 'transport',
                status: 'en_cours',
                date_debut: '2025-07-02T10:00:00',
                date_fin: '2025-07-02T11:30:00',
                description: 'Transport de Mme Martin chez son médecin',
                adresse_depart: '15 rue des Lilas, 75013 Paris',
                adresse_arrivee: 'Cabinet médical, 28 avenue Parmentier, 75011 Paris',
                client: { id: 12, nom: 'Martin Sophie', telephone: '0612345678' },
                montant: 45.00
              },
              {
                id: 2,
                type: 'courses',
                status: 'terminee',
                date_debut: '2025-06-28T14:00:00',
                date_fin: '2025-06-28T16:00:00',
                description: 'Courses au supermarché local',
                adresse: '3 rue du Commerce, 75015 Paris',
                client: { id: 8, nom: 'Dubois Jean', telephone: '0678901234' },
                montant: 30.00
              },
              {
                id: 3,
                type: 'gardiennage',
                status: 'en_cours',
                date_debut: '2025-07-01T08:00:00',
                date_fin: '2025-07-05T18:00:00',
                description: 'Garde du chat pendant absence',
                adresse: '42 rue de la Paix, 75002 Paris',
                client: { id: 15, nom: 'Lefebvre Marie', telephone: '0687654321' },
                montant: 250.00
              },
              {
                id: 4,
                type: 'transport_aeroport',
                status: 'a_venir',
                date_debut: '2025-07-10T05:30:00',
                date_fin: '2025-07-10T07:30:00',
                description: 'Transport à l\'aéroport Charles de Gaulle',
                adresse_depart: '7 rue du Faubourg Saint-Honoré, 75008 Paris',
                adresse_arrivee: 'Aéroport CDG, Terminal 2E',
                client: { id: 20, nom: 'Moreau Pierre', telephone: '0612387645' },
                montant: 75.00
              },
              {
                id: 5,
                type: 'menage',
                status: 'terminee',
                date_debut: '2025-06-25T13:00:00',
                date_fin: '2025-06-25T16:00:00',
                description: 'Ménage complet de l\'appartement',
                adresse: '18 rue de Rivoli, 75004 Paris',
                client: { id: 9, nom: 'Bernard Claire', telephone: '0690123456' },
                montant: 60.00
              }
            ],
            total: 5,
            page: 1,
            pages_total: 1
          }
        }
      });
    },
    
    getFactures: () => {
      return Promise.resolve({
        data: {
          success: true,
          data: {
            factures: [
              {
                id: 1,
                numero: 'FACT-2025-06',
                date: '2025-06-30',
                montant_total: 485.50,
                status: 'payee',
                prestations_count: 12,
                url_pdf: '/factures/pdf/1'
              },
              {
                id: 2,
                numero: 'FACT-2025-05',
                date: '2025-05-31',
                montant_total: 520.75,
                status: 'payee',
                prestations_count: 15,
                url_pdf: '/factures/pdf/2'
              },
              {
                id: 3,
                numero: 'FACT-2025-04',
                date: '2025-04-30',
                montant_total: 410.25,
                status: 'payee',
                prestations_count: 10,
                url_pdf: '/factures/pdf/3'
              }
            ],
            total: 3,
            page: 1,
            pages_total: 1
          }
        }
      });
    },
    
    getEvaluations: () => {
      return Promise.resolve({
        data: {
          success: true,
          data: {
            evaluations: [
              {
                id: 1,
                prestation_id: 2,
                note: 5,
                commentaire: 'Service impeccable, très ponctuel et professionnel',
                date: '2025-06-29',
                client: 'Dubois Jean'
              },
              {
                id: 2,
                prestation_id: 5,
                note: 4,
                commentaire: 'Très bon service, appartement bien nettoyé',
                date: '2025-06-26',
                client: 'Bernard Claire'
              },
              {
                id: 3,
                prestation_id: 10,
                note: 5,
                commentaire: 'Excellente prise en charge, très attentionné',
                date: '2025-06-20',
                client: 'Petit Thomas'
              }
            ],
            moyenne: 4.7,
            total: 3,
            page: 1,
            pages_total: 1
          }
        }
      });
    },
    
    getDisponibilites: () => {
      const aujourdhui = new Date();
      const annee = aujourdhui.getFullYear();
      const mois = aujourdhui.getMonth() + 1;
      
      // Générer un calendrier avec des disponibilités aléatoires
      const jours_mois = new Date(annee, mois, 0).getDate();
      const disponibilites = [];
      
      for (let jour = 1; jour <= jours_mois; jour++) {
        // Éviter les weekends
        const date = new Date(annee, mois - 1, jour);
        const est_weekend = date.getDay() === 0 || date.getDay() === 6;
        
        if (!est_weekend) {
          disponibilites.push({
            date: `${annee}-${String(mois).padStart(2, '0')}-${String(jour).padStart(2, '0')}`,
            matin: Math.random() > 0.3,
            apres_midi: Math.random() > 0.3,
            soir: Math.random() > 0.7
          });
        }
      }
      
      return Promise.resolve({
        data: {
          success: true,
          data: {
            disponibilites,
            mois,
            annee
          }
        }
      });
    },
    
    getTypesPrestations: () => {
      return Promise.resolve({
        data: {
          success: true,
          data: {
            types_disponibles: [
              { id: 1, nom: 'Transport de personnes', description: 'Accompagner des personnes à des rendez-vous', qualification_requise: false },
              { id: 2, nom: 'Courses', description: 'Faire les courses pour des clients', qualification_requise: false },
              { id: 3, nom: 'Gardiennage animaux', description: 'Garde d\'animaux à domicile', qualification_requise: false },
              { id: 4, nom: 'Transport aéroport', description: 'Transfert vers/depuis l\'aéroport', qualification_requise: false },
              { id: 5, nom: 'Ménage', description: 'Services de nettoyage', qualification_requise: false },
              { id: 6, nom: 'Aide aux personnes âgées', description: 'Aide spécifique pour personnes âgées', qualification_requise: true },
              { id: 7, nom: 'Jardinage', description: 'Entretien de jardin', qualification_requise: false },
              { id: 8, nom: 'Petit bricolage', description: 'Petites réparations à domicile', qualification_requise: false }
            ],
            types_prestataire: [1, 2, 4, 5]
          }
        }
      });
    }
  }
};

export default PrestataireService;
