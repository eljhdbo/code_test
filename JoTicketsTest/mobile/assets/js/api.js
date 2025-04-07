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

// Fonction pour appeler l'API avec les options par défaut
async function fetchAPI(endpoint, options = {}) {
    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // Si c'est une méthode POST, ajouter le token CSRF
    if (options.method === 'POST') {
        defaultOptions.headers['X-CSRFToken'] = getCookie('csrftoken');
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
            
            const error = await response.json();
            throw new Error(error.message || 'Une erreur est survenue');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erreur API:', error);
        throw error;
    }
}

// Récupérer la liste des événements
async function getEvents() {
    return fetchAPI('/events');
}

// Récupérer la liste des équipes
async function getTeams() {
    return fetchAPI('/teams');
}

// Récupérer la liste des stades
async function getStadiums() {
    return fetchAPI('/stadiums');
}

// Acheter un billet
async function buyTicket(eventId, category, quantity) {
    return fetchAPI('/buyTicket', {
        method: 'POST',
        body: JSON.stringify({
            event_id: eventId,
            category: category,
            quantity: quantity
        })
    });
}

// Récupérer les billets de l'utilisateur connecté
async function getUserTickets() {
    return fetchAPI('/tickets');
}

// Vérifier un billet par son ID (pour le scanner)
async function verifyTicket(ticketId) {
    return fetchAPI(`/getInfo/${ticketId}`);
}