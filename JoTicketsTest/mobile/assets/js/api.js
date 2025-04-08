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
        console.log(`Calling API: ${API_BASE_URL}${endpoint}`, fetchOptions);
        const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);
        
        // Vérifier si la réponse est OK
        if (!response.ok) {
            // Si la réponse est 401, l'utilisateur n'est pas authentifié
            if (response.status === 401) {
                // Rediriger vers la page de connexion si on n'y est pas déjà
                if (!window.location.href.includes('auth.html')) {
                    window.location.href = 'auth.html';
                    return null;
                }
            }
            
            // Essayer de lire la réponse comme JSON
            try {
                const error = await response.json();
                console.error('API Error:', error);
                throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
            } catch (e) {
                // Si la réponse n'est pas du JSON
                console.error('Non-JSON Error:', response);
                throw new Error(`HTTP Error: ${response.status}`);
            }
        }
        
        // Essayer de lire la réponse comme JSON
        try {
            const data = await response.json();
            console.log('API Response:', data);
            return data;
        } catch (e) {
            console.error('Invalid JSON Response:', e);
            throw new Error('Server response is not valid JSON');
        }
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Fonctions d'utilitaires pour l'API
async function getEvents() {
    return await fetchAPI('/events/');
}

async function getStadiums() {
    return await fetchAPI('/stadiums/');
}

async function getTeams() {
    return await fetchAPI('/teams/');
}

async function buyTicket(eventId, category, quantity = 1) {
    return await fetchAPI('/buyTicket/', {
        method: 'POST',
        body: JSON.stringify({
            event_id: eventId,
            category: category,
            quantity: quantity
        })
    });
}

async function getUserTickets() {
    return await fetchAPI('/tickets/');
}