document.addEventListener('DOMContentLoaded', function() {
    // API URL
    const API_BASE_URL = 'http://127.0.0.1:8000/api';
    
    // Éléments DOM
    const startCameraButton = document.getElementById('start-camera');
    const fileInput = document.getElementById('qr-file-input');
    const scannerArea = document.getElementById('scanner-area');
    const scannerVideo = document.getElementById('scanner-video');
    const resultContainer = document.getElementById('result-container');
    const loadingIndicator = document.getElementById('loading-indicator');
    const ticketDetails = document.getElementById('ticket-details');
    const errorMessage = document.getElementById('error-message');
    
    // Instance du scanner
    let qrScanner = null;
    
    // Démarrer la caméra
    startCameraButton.addEventListener('click', function() {
        // Afficher la zone de scan
        scannerArea.style.display = 'block';
        
        // Créer et démarrer le scanner
        qrScanner = new QrScanner(
            scannerVideo,
            result => {
                // Arrêter le scanner
                qrScanner.stop();
                
                // Traiter le résultat
                processQRCode(result.data);
            },
            {
                highlightScanRegion: true,
                highlightCodeOutline: true,
            }
        );
        
        qrScanner.start().catch(error => {
            console.error('Erreur lors du démarrage de la caméra:', error);
            scannerArea.style.display = 'none';
            showError('Impossible d\'accéder à la caméra. Veuillez vérifier vos permissions ou utiliser le chargement d\'image.');
        });
    });
    
    // Charger une image
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        
        if (file) {
            // Vérifier si c'est une image
            if (!file.type.startsWith('image/')) {
                showError('Veuillez sélectionner une image.');
                return;
            }
            
            // Scanner l'image
            QrScanner.scanImage(file)
                .then(result => {
                    processQRCode(result.data);
                })
                .catch(error => {
                    console.error('Erreur lors du scan de l\'image:', error);
                    showError('Aucun QR code détecté dans l\'image.');
                });
        }
    });
    
    // Traiter le QR code
    function processQRCode(qrData) {
        // Afficher le chargement
        loadingIndicator.style.display = 'block';
        ticketDetails.classList.add('hidden');
        errorMessage.classList.add('hidden');
        
        // Appeler l'API pour vérifier le billet
        fetch(`${API_BASE_URL}/getInfo/${qrData}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Billet invalide ou introuvable');
                }
                return response.json();
            })
            .then(data => {
                // Masquer le chargement
                loadingIndicator.style.display = 'none';
                
                // Afficher les détails du billet
                displayTicketDetails(data);
            })
            .catch(error => {
                // Masquer le chargement
                loadingIndicator.style.display = 'none';
                
                // Afficher l'erreur
                showError(error.message);
            });
    }
    
    // Afficher les détails du billet
    function displayTicketDetails(ticket) {
        const eventDate = new Date(ticket.event.start);
        
        ticketDetails.innerHTML = `
            <div class="ticket-header">
                <h3>Billet #${ticket.id.substring(0, 8)}</h3>
            </div>
            <div class="ticket-body">
                <div class="ticket-info">
                    <div class="ticket-info-row">
                        <div class="ticket-info-label">Événement:</div>
                        <div class="ticket-info-value">Match #${ticket.event.id}</div>
                    </div>
                    <div class="ticket-info-row">
                        <div class="ticket-info-label">Équipes:</div>
                        <div class="ticket-info-value">${ticket.event.team_home.name} vs ${ticket.event.team_away.name}</div>
                    </div>
                    <div class="ticket-info-row">
                        <div class="ticket-info-label">Date:</div>
                        <div class="ticket-info-value">${eventDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                    </div>
                    <div class="ticket-info-row">
                        <div class="ticket-info-label">Heure:</div>
                        <div class="ticket-info-value">${eventDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <div class="ticket-info-row">
                        <div class="ticket-info-label">Stade:</div>
                        <div class="ticket-info-value">${ticket.event.stadium.name}, ${ticket.event.stadium.location}</div>
                    </div>
                    <div class="ticket-info-row">
                        <div class="ticket-info-label">Catégorie:</div>
                        <div class="ticket-info-value">
                            <span class="ticket-category category-${ticket.category.toLowerCase()}">${ticket.category}</span>
                        </div>
                    </div>
                    <div class="ticket-info-row">
                        <div class="ticket-info-label">Propriétaire:</div>
                        <div class="ticket-info-value">${ticket.user.username}</div>
                    </div>
                </div>
                
                <div class="ticket-status ${ticket.used ? 'status-invalid' : 'status-valid'}">
                    ${ticket.used ? 'BILLET DÉJÀ UTILISÉ' : 'BILLET VALIDE'}
                </div>
            </div>
        `;
        
        ticketDetails.classList.remove('hidden');
        
        // Ajouter une animation de validation
        if (!ticket.used) {
            ticketDetails.classList.add('valid-animation');
            setTimeout(() => {
                ticketDetails.classList.remove('valid-animation');
            }, 1000);
        }
    }
    
    // Afficher une erreur
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }
});