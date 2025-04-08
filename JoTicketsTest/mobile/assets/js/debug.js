// Utilitaire de débogage pour l'application
const DEBUG = true;

// Fonction pour afficher des messages de débogage
function debug(message, data = null) {
    if (!DEBUG) return;
    
    if (data) {
        console.log(`[DEBUG] ${message}:`, data);
    } else {
        console.log(`[DEBUG] ${message}`);
    }
}

// Interception des erreurs non gérées
window.addEventListener('error', function(event) {
    console.error('Uncaught error:', event.error);
});

// Améliorez les messages d'erreur API
window.fetchAPIWithDebug = async function(endpoint, options = {}) {
    debug(`API Request: ${endpoint}`, options);
    
    try {
        const result = await fetchAPI(endpoint, options);
        debug(`API Response: ${endpoint}`, result);
        return result;
    } catch (error) {
        console.error(`API Error: ${endpoint}`, error);
        throw error;
    }
};