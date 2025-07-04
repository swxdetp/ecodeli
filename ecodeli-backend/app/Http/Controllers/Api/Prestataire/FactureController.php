<?php

namespace App\Http\Controllers\Api\Prestataire;

use App\Http\Controllers\Controller;
use App\Models\Facture;
use App\Models\Prestation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class FactureController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $status = $request->query('status');
        $query = Auth::user()->factures();
        
        if ($status) {
            $query->where('status', $status);
        }
        
        $factures = $query->with('facturable')->latest()->paginate(10);
        
        return response()->json([
            'success' => true,
            'message' => 'Liste des factures récupérée avec succès',
            'data' => $factures
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'prestation_id' => 'required|exists:prestations,id',
            'montant_ht' => 'required|numeric',
            'tva' => 'required|numeric',
        ]);
        
        // Vérifier que la prestation appartient au prestataire connecté
        $prestation = Prestation::findOrFail($validated['prestation_id']);
        
        if ($prestation->prestataire_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à cette prestation',
                'data' => null
            ], 403);
        }
        
        // Vérifier que la prestation est terminée
        if ($prestation->status !== 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de créer une facture pour une prestation non terminée',
                'data' => null
            ], 400);
        }
        
        // Vérifier qu'une facture n'existe pas déjà
        if ($prestation->facture()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Une facture existe déjà pour cette prestation',
                'data' => null
            ], 400);
        }
        
        // Générer le numéro de facture
        $lastFacture = Facture::latest()->first();
        $lastNumber = $lastFacture ? intval(substr($lastFacture->numero, 4)) : 0;
        $newNumber = $lastNumber + 1;
        $numero = 'FAC-' . str_pad($newNumber, 6, '0', STR_PAD_LEFT);
        
        // Calculer le montant TTC
        $montantTtc = $validated['montant_ht'] * (1 + $validated['tva'] / 100);
        
        // Créer la facture
        $facture = new Facture([
            'user_id' => Auth::id(),
            'numero' => $numero,
            'montant_ht' => $validated['montant_ht'],
            'tva' => $validated['tva'],
            'montant_ttc' => $montantTtc,
            'date_emission' => now(),
            'date_echeance' => now()->addDays(30),
            'status' => 'pending',
        ]);
        
        $prestation->facture()->save($facture);
        
        // Générer le PDF de la facture
        $pdfPath = $this->generatePdf($facture);
        $facture->update(['pdf_path' => $pdfPath]);
        
        return response()->json([
            'success' => true,
            'message' => 'Facture créée avec succès',
            'data' => $facture
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Facture $facture)
    {
        // Vérifier que la facture appartient au prestataire connecté
        if ($facture->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à cette facture',
                'data' => null
            ], 403);
        }
        
        $facture->load('facturable', 'paiement');
        
        return response()->json([
            'success' => true,
            'message' => 'Détails de la facture récupérés avec succès',
            'data' => $facture
        ]);
    }

    /**
     * Download the PDF of the invoice.
     */
    public function download(Facture $facture)
    {
        // Vérifier que la facture appartient au prestataire connecté
        if ($facture->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé à cette facture',
                'data' => null
            ], 403);
        }
        
        if (!$facture->pdf_path || !Storage::exists($facture->pdf_path)) {
            return response()->json([
                'success' => false,
                'message' => 'Le PDF de cette facture n\'existe pas',
                'data' => null
            ], 404);
        }
        
        return Storage::download($facture->pdf_path, 'facture-' . $facture->numero . '.pdf');
    }

    /**
     * Generate monthly invoices for all completed prestations.
     */
    public function generateMonthly()
    {
        $user = Auth::user();
        
        // Récupérer toutes les prestations terminées sans facture
        $prestations = $user->prestations()
            ->where('status', 'completed')
            ->whereDoesntHave('facture')
            ->get();
            
        if ($prestations->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Aucune prestation à facturer',
                'data' => null
            ], 400);
        }
        
        $facturesCreated = 0;
        
        foreach ($prestations as $prestation) {
            // Générer le numéro de facture
            $lastFacture = Facture::latest()->first();
            $lastNumber = $lastFacture ? intval(substr($lastFacture->numero, 4)) : 0;
            $newNumber = $lastNumber + 1;
            $numero = 'FAC-' . str_pad($newNumber, 6, '0', STR_PAD_LEFT);
            
            // Calculer le montant TTC
            $tva = 20; // Taux de TVA par défaut
            $montantTtc = $prestation->price * (1 + $tva / 100);
            
            // Créer la facture
            $facture = new Facture([
                'user_id' => $user->id,
                'numero' => $numero,
                'montant_ht' => $prestation->price,
                'tva' => $tva,
                'montant_ttc' => $montantTtc,
                'date_emission' => now(),
                'date_echeance' => now()->addDays(30),
                'status' => 'pending',
            ]);
            
            $prestation->facture()->save($facture);
            
            // Générer le PDF de la facture
            $pdfPath = $this->generatePdf($facture);
            $facture->update(['pdf_path' => $pdfPath]);
            
            $facturesCreated++;
        }
        
        return response()->json([
            'success' => true,
            'message' => $facturesCreated . ' facture(s) générée(s) avec succès',
            'data' => null
        ]);
    }

    /**
     * Generate a PDF for an invoice.
     */
    private function generatePdf(Facture $facture)
    {
        // Ici, vous intégreriez une bibliothèque comme DOMPDF pour générer le PDF
        // Pour l'exemple, nous allons simplement simuler la génération d'un PDF
        
        $path = 'factures/' . $facture->user_id . '/' . $facture->numero . '.pdf';
        
        // Simuler la création du fichier
        Storage::makeDirectory(dirname($path));
        Storage::put($path, 'Contenu simulé de la facture ' . $facture->numero);
        
        return $path;
    }
}
