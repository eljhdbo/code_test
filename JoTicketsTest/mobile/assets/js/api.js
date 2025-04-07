// Configuration de l'API
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Fonction utilitaire pour récupérer le token CSRF
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Fonction pour obtenir le token CSRF
async function ensureCsrfToken() {
    if (!getCookie('csrftoken')) {
        await fetch(`${API_BASE_URL}/csrf-token/`, {
            credentials: 'include'
        });
    }
    return getCookie('csrftoken');
}

// Fonction pour appeler l'API avec les options par défaut
async function fetchAPI(endpoint, options = {}) {
    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // Si c'est une méthode POST, s'assurer d'avoir un token CSRF
    if (options.method === 'POST') {
        const csrftoken = await ensureCsrfToken();
        defaultOptions.headers['X-CSRFToken'] = csrftoken;
    }

    // Fusionner les options par défaut avec les options passées
    const fetchOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);
        
        // Vérifier si la réponse est OK
        if (!response.ok) {
            // Si la réponse est 401, l'utilisateur n'est pas authentifié
            if (response.status === 401) {
                // Rediriger vers la page de connexion si on n'y est pas déjà
                if (!window.location.href.includes('auth.html')) {
                    window.location.href = 'auth.html';
                }
            }
            
            // Essayer de lire la réponse comme JSON
            try {
                const error = await response.json();
                throw new Error(error.message || 'Une erreur est survenue');
            } catch (e) {
                // Si la réponse n'est pas du JSON
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
        }
        
        // Essayer de lire la réponse comme JSON
        try {
            return await response.json();
        } catch (e) {
            console.error('Réponse non-JSON:', e);
            throw new Error('La réponse du serveur n\'est pas au format JSON valide');
        }
    } catch (error) {
        console.error('Erreur API:', error);
        throw error;
    }
}