// Fonction pour afficher les événements
async function displayEvents() {
    const eventsListElement = document.getElementById('events-list');
    
    try {
        // Récupérer les données des événements
        const events = await getEvents();
        
        // Vider le conteneur
        eventsListElement.innerHTML = '';
        
        if (events.length === 0) {
            eventsListElement.innerHTML = '<p class="no-events">Aucun match à venir</p>';
            return;
        }
        
        // Afficher chaque événement
        events.forEach(event => {
            const eventCard = createEventCard(event);
            eventsListElement.appendChild(eventCard);
        });
    } catch (error) {
        eventsListElement.innerHTML = `<p class="error">Erreur lors du chargement des matchs: ${error.message}</p>`;
    }
}

// Créer une carte d'événement
function createEventCard(event) {
    const eventDate = new Date(event.start);
    
    const card = document.createElement('div');
    card.className = 'event-card';
    
    card.innerHTML = `
        <div class="event-header">
            <h3>Match #${event.id}</h3>
        </div>
        <div class="event-teams">
            <div class="team">
                <div class="team-flag">🏳️</div>
                <div class="team-name">${event.team_home.name}</div>
                <div class="team-code">${event.team_home.code}</div>
            </div>
            <div class="vs">VS</div>
            <div class="team">
                <div class="team-flag">🏳️</div>
                <div class="team-name">${event.team_away.name}</div>
                <div class="team-code">${event.team_away.code}</div>
            </div>
        </div>
        <div class="event-details">
            <div class="event-detail">
                <span class="detail-icon">📅</span>
                <span>${eventDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="event-detail">
                <span class="detail-icon">⏰</span>
                <span>${eventDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div class="event-detail">
                <span class="detail-icon">🏟️</span>
                <span>${event.stadium.name}, ${event.stadium.location}</span>
            </div>
        </div>
        <div class="event-actions">
            <a href="ticket-purchase.html?event=${event.id}" class="btn btn-primary">Acheter un billet</a>
        </div>
    `;
    
    return card;
}

// Charger les événements au chargement de la page
document.addEventListener('DOMContentLoaded', displayEvents);