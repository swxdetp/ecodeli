/**
 * Données simulées pour le développement et test
 */

export const MOCK_LIVRAISONS = [
  {
    id: 1,
    annonce: {
      title: "Livraison de médicaments",
      address_from: "242 Rue du Faubourg Saint-Antoine, 75012 Paris",
      address_to: "38 Rue du Louvre, 75001 Paris",
      description: "Colis urgent à livrer",
      price: 25.50
    },
    status: "pending",
    start_date: "2025-06-29T14:00:00"
  },
  {
    id: 2,
    annonce: {
      title: "Documents importants",
      address_from: "242 Rue du Faubourg Saint-Antoine, 75012 Paris",
      address_to: "5 Rue de Rivoli, 75001 Paris",
      description: "Documents confidentiels",
      price: 18.00
    },
    status: "accepted",
    start_date: "2025-06-30T09:00:00"
  },
  {
    id: 3,
    annonce: {
      title: "Colis express",
      address_from: "15 Avenue des Champs-Élysées, 75008 Paris",
      address_to: "48 Rue de Rivoli, 75004 Paris",
      description: "Petit colis prioritaire",
      price: 15.75
    },
    status: "in_progress",
    start_date: "2025-06-29T10:30:00"
  }
];

export const MOCK_ANNONCES = [
  {
    id: 4,
    title: "Livraison de fleurs",
    address_from: "242 Rue du Faubourg Saint-Antoine, 75012 Paris",
    address_to: "15 Rue de la Paix, 75002 Paris",
    description: "Bouquet fragile",
    price: 22.00,
    status: "disponible",
    created_at: "2025-06-28T15:00:00"
  },
  {
    id: 5,
    title: "Petit paquet",
    address_from: "242 Rue du Faubourg Saint-Antoine, 75012 Paris",
    address_to: "65 Rue de Lyon, 75012 Paris",
    description: "Livraison locale",
    price: 12.50,
    status: "disponible",
    created_at: "2025-06-29T09:15:00"
  },
  {
    id: 6,
    title: "Documents administratifs",
    address_from: "10 Rue de Sèvres, 75007 Paris",
    address_to: "22 Avenue Montaigne, 75008 Paris",
    description: "Dossier administratif urgent",
    price: 19.90,
    status: "disponible",
    created_at: "2025-06-29T08:30:00"
  },
  {
    id: 7,
    title: "Colis alimentaire",
    address_from: "35 Avenue Simon Bolivar, 75019 Paris",
    address_to: "8 Rue Custine, 75018 Paris",
    description: "Produits frais - livraison rapide",
    price: 24.00,
    status: "disponible",
    created_at: "2025-06-29T07:45:00"
  }
];

export const MOCK_DASHBOARD = {
  stats: {
    livraisons_en_cours: 2,
    livraisons_completees: 15,
    gains_totaux: 350.75,
    gains_cette_semaine: 125.50
  },
  prochaines_livraisons: MOCK_LIVRAISONS.slice(0, 2)
};
