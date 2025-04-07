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
        
        // Déterminer les phases en fonction des IDs d'événements
        const getPhase = (eventId) => {
            if (eventId <= 8) return 'group';
            if (eventId <= 12) return 'quarter';
            if (eventId <= 14) return 'semi';
            return 'final';
        };
        
        // Formater les noms des phases
        const getPhaseName = (phase) => {
            switch (phase) {
                case 'group': return 'Phase de groupes';
                case 'quarter': return 'Quart de finale';
                case 'semi': return 'Demi-finale';
                case 'final': return 'Finale';
                default: return '';
            }
        };
        
        // Afficher chaque événement
        events.forEach(event => {
            const phase = getPhase(event.id);
            const phaseName = getPhaseName(phase);
            
            const eventDate = new Date(event.start);
            
            // Ignorer les événements qui n'ont pas d'équipes assignées (matchs futurs non encore définis)
            if (!event.team_home || !event.team_away) {
                const card = document.createElement('div');
                card.className = 'event-card';
                card.dataset.stadium = event.stadium.id;
                card.dataset.phase = phase;
                card.dataset.teams = '';
                
                card.innerHTML = `
                    <div class="event-header">
                        <h3>${phaseName} - Match #${event.id}</h3>
                    </div>
                    <div class="event-teams future-match">
                        <p>Les équipes seront déterminées après les matchs précédents</p>
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
                `;
                
                eventsListElement.appendChild(card);
                return;
            }
            
            const card = document.createElement('div');
            card.className = 'event-card';
            card.dataset.stadium = event.stadium.id;
            card.dataset.teams = `${event.team_home.id},${event.team_away.id}`;
            card.dataset.phase = phase;
            
            // Obtenir les drapeaux des pays à partir des codes
            const homeFlag = getCountryFlag(event.team_home.code);
            const awayFlag = getCountryFlag(event.team_away.code);
            
            card.innerHTML = `
                <div class="event-header">
                    <h3>${phaseName} - Match #${event.id}</h3>
                </div>
                <div class="event-teams">
                    <div class="team">
                        <div class="team-flag">${homeFlag}</div>
                        <div class="team-name">${event.team_home.name}</div>
                        <div class="team-code">${event.team_home.code}</div>
                    </div>
                    <div class="vs">VS</div>
                    <div class="team">
                        <div class="team-flag">${awayFlag}</div>
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
            
            eventsListElement.appendChild(card);
        });
    } catch (error) {
        eventsListElement.innerHTML = `<p class="error">Erreur lors du chargement des matchs: ${error.message}</p>`;
    }
}

// Fonction pour obtenir le drapeau d'un pays à partir de son code
function getCountryFlag(countryCode) {
    // Si le code pays est valide (2 caractères), on affiche l'emoji du drapeau
    if (countryCode && countryCode.length === 2) {
        // Conversion du code pays en emoji de drapeau
        // Les codes pays sont convertis en leurs points de code Unicode correspondants
        const flagOffset = 127397; // 127397 est la différence entre le point de code ASCII et le point de code emoji
        const flagEmoji = countryCode
            .toUpperCase()
            .split('')
            .map(char => char.charCodeAt(0) + flagOffset)
            .map(code => String.fromCodePoint(code))
            .join('');
        
        return flagEmoji;
    }
    
    // Si le code pays n'est pas valide, on retourne un drapeau générique
    return '🏳️';
}

// Charger les événements au chargement de la page
document.addEventListener('DOMContentLoaded', displayEvents);