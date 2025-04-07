// Vérifie si l'utilisateur est connecté
function isLoggedIn() {
    return localStorage.getItem('user') !== null;
}

// Met à jour l'interface en fonction de l'état de connexion
function updateAuthUI() {
    const authLink = document.getElementById('authLink');
    
    if (isLoggedIn()) {
        const user = JSON.parse(localStorage.getItem('user'));
        authLink.textContent = 'Déconnexion';
        authLink.href = '#';
        authLink.onclick = logout;
    } else {
        authLink.textContent = 'Connexion';
        authLink.href = 'auth.html';
        authLink.onclick = null;
    }
}

// Déconnexion
function logout() {
    localStorage.removeItem('user');
    updateAuthUI();
    
    // Rediriger vers la page d'accueil
    window.location.href = 'index.html';
}

// Connexion
async function login(email, password) {
    try {
        const response = await fetchAPI('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        // Stocker les informations de l'utilisateur
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Rediriger vers la page d'accueil
        window.location.href = 'index.html';
    } catch (error) {
        throw error;
    }
}

// Inscription
async function register(username, email, password) {
    try {
        const response = await fetchAPI('/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
        
        // Stocker les informations de l'utilisateur
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Rediriger vers la page d'accueil
        window.location.href = 'index.html';
    } catch (error) {
        throw error;
    }
}

// Vérifier si l'utilisateur est connecté
document.addEventListener('DOMContentLoaded', updateAuthUI);