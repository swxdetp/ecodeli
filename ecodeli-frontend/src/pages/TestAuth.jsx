import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../api/auth.service';

const TestAuth = () => {
  const [testResult, setTestResult] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Récupérer le token stocké
    const token = localStorage.getItem('ecodeli_token');
    if (token) {
      setTokenInfo({
        exists: true,
        token: token.substring(0, 10) + '...' + token.substring(token.length - 10),
        length: token.length
      });
    } else {
      setTokenInfo({ exists: false });
    }
  }, []);

  const testAuthApi = async () => {
    setLoading(true);
    setError(null);
    try {
      // Utiliser directement axios pour plus de contrôle
      const token = localStorage.getItem('ecodeli_token');
      const response = await axios.get('/api/test-auth', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      setTestResult(response.data);
    } catch (err) {
      console.error('Erreur de test d\'authentification:', err);
      setError({
        message: err.message,
        response: err.response ? {
          status: err.response.status,
          data: err.response.data
        } : 'Pas de réponse du serveur'
      });
    } finally {
      setLoading(false);
    }
  };

  const testLivreurAnnonces = async () => {
    setLoading(true);
    setError(null);
    try {
      // Utiliser directement axios pour plus de contrôle
      const token = localStorage.getItem('ecodeli_token');
      const response = await axios.get('/api/livreur/annonces', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      setTestResult(response.data);
    } catch (err) {
      console.error('Erreur d\'accès aux annonces livreur:', err);
      setError({
        message: err.message,
        response: err.response ? {
          status: err.response.status,
          data: err.response.data
        } : 'Pas de réponse du serveur'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '20px auto' }}>
      <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '20px' }}>Test d'Authentification</h2>
        <h4>Informations sur le token</h4>
        {tokenInfo && (
          <div style={{ marginBottom: '20px' }}>
            {tokenInfo.exists ? (
              <div style={{ padding: '15px', backgroundColor: '#d1ecf1', borderRadius: '5px', marginBottom: '15px' }}>
                <strong>Token trouvé dans localStorage</strong><br />
                Token masqué: {tokenInfo.token}<br />
                Longueur: {tokenInfo.length} caractères
              </div>
            ) : (
              <div style={{ padding: '15px', backgroundColor: '#f8d7da', borderRadius: '5px', marginBottom: '15px' }}>
                Aucun token trouvé dans localStorage. Veuillez vous connecter d'abord.
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            style={{ 
              padding: '10px 15px', 
              backgroundColor: !loading && tokenInfo?.exists ? '#007bff' : '#cccccc', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: !loading && tokenInfo?.exists ? 'pointer' : 'default' 
            }} 
            onClick={testAuthApi} 
            disabled={loading || !tokenInfo?.exists}
          >
            {loading ? 'Chargement...' : 'Tester /api/test-auth'}
          </button>

          <button 
            style={{ 
              padding: '10px 15px', 
              backgroundColor: !loading && tokenInfo?.exists ? '#28a745' : '#cccccc', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: !loading && tokenInfo?.exists ? 'pointer' : 'default' 
            }}
            onClick={testLivreurAnnonces} 
            disabled={loading || !tokenInfo?.exists}
          >
            {loading ? 'Chargement...' : 'Tester /api/livreur/annonces'}
          </button>
        </div>

        {error && (
          <div style={{ padding: '15px', backgroundColor: '#f8d7da', borderRadius: '5px', marginBottom: '15px' }}>
            <strong>Erreur:</strong> {error.message}
            {error.response && (
              <div style={{ marginTop: '10px' }}>
                <strong>Status:</strong> {error.response.status}
                <pre style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px', marginTop: '10px', overflowX: 'auto' }}>
                  {JSON.stringify(error.response.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {testResult && (
          <div>
            <h4>Résultat du test:</h4>
            <pre style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px', overflowX: 'auto' }}>
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestAuth;
