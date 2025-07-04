<?php

require 'vendor/autoload.php';

use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;

// Créer un client HTTP
$client = new GuzzleHttp\Client();

try {
    // Tester l'authentification
    $response = $client->post('http://localhost:8000/api/auth/login', [
        'json' => [
            'email' => 'romain@romain.fr',
            'password' => '123456'
        ],
        'headers' => [
            'Accept' => 'application/json',
            'Content-Type' => 'application/json'
        ]
    ]);
    
    echo "Status: " . $response->getStatusCode() . "\n";
    echo "Response: " . $response->getBody() . "\n";
} catch (ClientException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Status: " . $e->getResponse()->getStatusCode() . "\n";
    echo "Response: " . $e->getResponse()->getBody() . "\n";
} catch (Exception $e) {
    echo "General Error: " . $e->getMessage() . "\n";
}
