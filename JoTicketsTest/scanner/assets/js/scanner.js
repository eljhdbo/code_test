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
        
        // Réinitialiser les résultats précédents
        ticketDetails.classList.add('hidden');
        errorMessage.classList.add('hidden');
        
        // Vérifier si un scanner existe déjà et l'arrêter
        if (qrScanner) {
            qrScanner.stop();
        }
        
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
                returnDetailedScanResult: true
            }
        );
        
        // Démarrer le scan
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
            // Réinitialiser les résultats précédents
            ticketDetails.classList.add('hidden');
            errorMessage.classList.add('hidden');
            
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
        
        // Vérifier si les données du QR code ressemblent à un UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(qrData)) {
            loadingIndicator.style.display = 'none';
            showError('QR code invalide. Ce n\'est pas un billet valide.');
            return;
        }
        
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
                
                // Si le billet n'est pas encore utilisé, proposer de le valider
                if (!data.is_used) {
                    addValidateButton(data.id);
                }
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
        
        let statusClass = ticket.is_used ? 'status-invalid' : 'status-valid';
        let statusText = ticket.is_used ? 'BILLET DÉJÀ UTILISÉ' : 'BILLET VALIDE';
        
        ticketDetails.innerHTML = `
            <div class="ticket-header">
                <h3>Billet #${ticket.id.substring(0, 8)}...</h3>
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
                    <div class="ticket-info-row">
                        <div class="ticket-info-label">Date d'achat:</div>
                        <div class="ticket-info-value">${new Date(ticket.purchase_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                </div>
                
                <div class="ticket-status ${statusClass}">
                    ${statusText}
                </div>
                
                <div id="validate-button-container" class="validate-button-container">
                    <!-- Le bouton de validation sera ajouté ici si le billet est valide -->
                </div>
            </div>
        `;
        
        ticketDetails.classList.remove('hidden');
    }
    
    // Ajouter un bouton de validation pour les billets valides
    function addValidateButton(ticketId) {
        const validateButtonContainer = document.getElementById('validate-button-container');
        
        if (validateButtonContainer) {
            validateButtonContainer.innerHTML = `
                <button id="validate-button" class="btn btn-primary">Valider ce billet</button>
            `;
            
            document.getElementById('validate-button').addEventListener('click', function() {
                validateTicket(ticketId);
            });
        }
    }
    
    // Valider un billet
    function validateTicket(ticketId) {
        // Afficher le chargement
        loadingIndicator.style.display = 'block';
        
        // Appeler l'API pour valider le billet
        fetch(`${API_BASE_URL}/validateTicket/${ticketId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de la validation du billet');
            }
            return response.json();
        })
        .then(data => {
            // Masquer le chargement
            loadingIndicator.style.display = 'none';
            
            // Mettre à jour l'affichage du billet
            displayTicketDetails(data.ticket);
            
            // Ajouter une notification de succès
            const successNotification = document.createElement('div');
            successNotification.className = 'success-notification';
            successNotification.textContent = 'Billet validé avec succès!';
            
            document.body.appendChild(successNotification);
            
            // Supprimer la notification après 3 secondes
            setTimeout(() => {
                document.body.removeChild(successNotification);
            }, 3000);
        })
        .catch(error => {
            // Masquer le chargement
            loadingIndicator.style.display = 'none';
            
            // Afficher l'erreur
            showError(error.message);
        });
    }
    
    // Afficher une erreur
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }
    
    // Ajouter des styles CSS pour la notification de succès
    const style = document.createElement('style');
    style.textContent = `
        .success-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: var(--success-color);
            color: white;
            padding: 15px 20px;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease-out, fadeOut 0.3s ease-in 2.7s forwards;
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        
        .validate-button-container {
            margin-top: 20px;
            text-align: center;
        }
    `;
    
    document.head.appendChild(style);
});