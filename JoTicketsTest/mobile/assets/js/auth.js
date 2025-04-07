// Vérifie si l'utilisateur est connecté
function isLoggedIn() {
    return localStorage.getItem('user') !== null;
}

// Met à jour l'interface en fonction de l'état de connexion
function updateAuthUI() {
    const authLink = document.getElementById('authLink');
    
    if (isLoggedIn()) {
        const user = JSON.parse(localStorage.getItem('user'));
        authLink.textContent = `Déconnexion (${user.username})`;
        authLink.href = '#';
        authLink.onclick = logout;
    } else {
        authLink.textContent = 'Connexion';
        authLink.href = 'auth.html';
        authLink.onclick = null;
    }
}

// Déconnexion
async function logout() {
    try {
        await fetch('http://127.0.0.1:8000/api/logout/', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Erreur de déconnexion:', error);
    }
    
    // Même en cas d'erreur, on déconnecte localement
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Fonction d'inscription
async function register(username, email, password) {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erreur lors de l\'inscription');
        }
        
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    } catch (error) {
        console.error('Erreur d\'inscription:', error);
        throw error;
    }
}

// Fonction de connexion
async function login(email, password) {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Erreur de connexion');
        }
        
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    } catch (error) {
        console.error('Erreur de connexion:', error);
        throw error;
    }
}

// Vérifier si l'utilisateur est connecté à chaque chargement de page
document.addEventListener('DOMContentLoaded', updateAuthUI);