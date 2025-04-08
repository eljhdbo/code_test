/*******************************************************************************
 * SCANNEUR DE BILLETS - PARIS 2024
 * Version améliorée pour assurer la compatibilité avec les QR codes générés
 ******************************************************************************/

import QrScanner from './qr-scanner.min.js';

// URL de base de l'API backend
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Récupération des éléments du DOM
const fileInput = document.getElementById('file-input');
const result = document.getElementById('result');
const ticketStatus = document.getElementById('ticket-status');
const ticketDetails = document.getElementById('ticket-details');
const validateSection = document.getElementById('validate-section');
const validateButton = document.getElementById('validate-button');
const cancelButton = document.getElementById('cancel-button');
const loader = document.getElementById('loader');

// Variable globale pour l'identifiant du billet en cours
let currentTicketUuid = null;

/**
 * Récupère la valeur d'un cookie par son nom
 */
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

/**
 * Initialisation quand le DOM est chargé
 */
document.addEventListener('DOMContentLoaded', function() {
    // Écouteur pour la sélection de fichier
    fileInput.addEventListener('change', event => {
        const file = event.target.files[0];
        if (!file) return;
        
        resetResults();
        loader.classList.remove('hidden');
        
        // Configuration avancée pour le scanner QR
        const scanConfig = {
            returnDetailedScanResult: true,
            // Augmente la tolérance pour mieux lire les QR codes
            maxScansPerSecond: 2,
            highlightScanRegion: true,
            highlightCodeOutline: true,
        };
        
        // Scan de l'image
        QrScanner.scanImage(file, scanConfig)
            .then(result => {
                console.log("Résultat du scan:", result);
                handleScanResult(result);
            })
            .catch(error => {
                loader.classList.add('hidden');
                displayError(`Impossible de lire le QR code : ${error.message}`, "N/A");
                console.error('Erreur scan:', error);
                
                // Tentative alternative avec une configuration différente
                QrScanner.scanImage(file, { returnDetailedScanResult: true })
                    .then(result => {
                        console.log("Résultat du scan alternatif:", result);
                        handleScanResult(result);
                    })
                    .catch(secondError => {
                        console.error('Échec de la deuxième tentative:', secondError);
                    });
            });
    });
    
    // Écouteurs pour les boutons de validation
    validateButton.addEventListener('click', () => {
        if (!currentTicketUuid) return;
        validateTicket(currentTicketUuid);
    });
    
    cancelButton.addEventListener('click', () => {
        validateSection.classList.add('hidden');
    });
});

/**
 * Réinitialise l'interface utilisateur
 */
function resetResults() {
    result.classList.add('hidden');
    result.classList.remove('valid', 'invalid');
    ticketStatus.innerHTML = '';
    ticketDetails.innerHTML = '';
    validateSection.classList.add('hidden');
    currentTicketUuid = null;
}

/**
 * Traite le résultat du scan QR
 */
function handleScanResult(scanResult) {
    console.log('QR Code scanné:', scanResult);
    
    // Extraction de la valeur du QR code
    const qrContent = typeof scanResult === 'string' ? scanResult : scanResult.data;
    
    // Nettoyage et préparation de la valeur
    const cleanContent = qrContent.trim();
    console.log('Contenu nettoyé:', cleanContent);
    
    // Lancer la vérification du ticket
    verifyTicket(cleanContent);
}

/**
 * Vérifie la validité d'un ticket via l'API
 */
function verifyTicket(ticketUuid) {
    console.log('Vérification du ticket:', ticketUuid);
    currentTicketUuid = ticketUuid;
    
    // Appel à l'API
    fetch(`${API_BASE_URL}/tickets/verify/${encodeURIComponent(ticketUuid)}/`)
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Billet non trouvé dans le système');
                }
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            displayTicketResult(data, ticketUuid);
        })
        .catch(error => {
            console.error('Erreur API:', error);
            
            // Fallback hors-ligne
            simulateVerifyTicket(ticketUuid);
        })
        .finally(() => {
            loader.classList.add('hidden');
        });
}

/**
 * Version hors-ligne de la vérification (fallback)
 */
function simulateVerifyTicket(ticketUuid) {
    const allTickets = JSON.parse(localStorage.getItem('user_tickets') || '[]');
    console.log('Tickets en local:', allTickets);
    
    // Recherche par UUID, format exact ou format brut
    const ticket = allTickets.find(t => {
        const ticketIdStr = String(t.id);
        const ticketUuidStr = String(t.ticket_uuid || '');
        
        return ticketUuidStr === ticketUuid || 
               ticketIdStr === ticketUuid ||
               ticketUuidStr.includes(ticketUuid) ||
               ticketUuid.includes(ticketIdStr);
    });
    
    console.log('Ticket trouvé en local:', ticket);
    
    if (ticket) {
        if (ticket.status === 'USED') {
            const data = {
                valid: false,
                message: "Ce billet a déjà été utilisé.",
                ticket: ticket,
                used_at: ticket.used_at
            };
            displayTicketResult(data, ticketUuid);
        } else {
            const data = {
                valid: true,
                message: "Billet valide.",
                ticket: ticket
            };
            displayTicketResult(data, ticketUuid);
        }
    } else {
        const data = {
            valid: false,
            message: "Billet non trouvé dans le système.",
        };
        displayTicketResult(data, ticketUuid);
    }
    
    loader.classList.add('hidden');
}

/**
 * Marque un ticket comme utilisé via l'API
 */
function validateTicket(ticketUuid) {
    loader.classList.remove('hidden');
    validateSection.classList.add('hidden');
    
    fetch(`${API_BASE_URL}/tickets/verify/${encodeURIComponent(ticketUuid)}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert("✅ Billet marqué comme utilisé avec succès!");
                // Recharger les infos du ticket
                verifyTicket(ticketUuid);
            } else {
                alert(`❌ Erreur: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Erreur API:', error);
            simulateValidateTicket(ticketUuid);
        })
        .finally(() => {
            loader.classList.add('hidden');
        });
}

/**
 * Version hors-ligne de la validation des tickets
 */
function simulateValidateTicket(ticketUuid) {
    const allTickets = JSON.parse(localStorage.getItem('user_tickets') || '[]');
    
    // Recherche avancée du ticket
    const ticketIndex = allTickets.findIndex(t => {
        const ticketIdStr = String(t.id);
        const ticketUuidStr = String(t.ticket_uuid || '');
        
        return ticketUuidStr === ticketUuid || 
               ticketIdStr === ticketUuid ||
               ticketUuidStr.includes(ticketUuid) ||
               ticketUuid.includes(ticketIdStr);
    });
    
    if (ticketIndex !== -1) {
        allTickets[ticketIndex].status = 'USED';
        allTickets[ticketIndex].used_at = new Date().toISOString();
        
        localStorage.setItem('user_tickets', JSON.stringify(allTickets));
        
        alert("✅ Billet marqué comme utilisé avec succès!");
        validateSection.classList.add('hidden');
        
        const data = {
            valid: false,
            message: "Ce billet a déjà été utilisé.",
            ticket: allTickets[ticketIndex],
            used_at: allTickets[ticketIndex].used_at
        };
        displayTicketResult(data, ticketUuid);
    } else {
        alert("❌ Erreur: Billet non trouvé.");
    }
    
    loader.classList.add('hidden');
}

/**
 * Affiche les informations du ticket et son statut
 */
function displayTicketResult(data, ticketUuid) {
    result.classList.remove('hidden');
    
    if (data.valid) {
        // Affichage ticket valide
        result.classList.add('valid');
        result.classList.remove('invalid');
        ticketStatus.innerHTML = `
            <div class="ticket-status status-valid">
                <h3>✓ BILLET VALIDE</h3>
                <p>${data.message}</p>
            </div>
        `;
        
        validateSection.classList.remove('hidden');
        
        const ticket = data.ticket;
        const eventDetails = ticket.event_details;
        
        if (eventDetails && eventDetails.time) {
            const matchDate = new Date(eventDetails.time);
            
            ticketDetails.innerHTML = `
                <div class="ticket-info-row">
                    <div class="ticket-info-label">Match:</div>
                    <div class="ticket-info-value">${eventDetails.team_home_name} vs ${eventDetails.team_away_name}</div>
                </div>
                <div class="ticket-info-row">
                    <div class="ticket-info-label">Date:</div>
                    <div class="ticket-info-value">${matchDate.toLocaleDateString('fr-FR')}</div>
                </div>
                <div class="ticket-info-row">
                    <div class="ticket-info-label">Heure:</div>
                    <div class="ticket-info-value">${matchDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div class="ticket-info-row">
                    <div class="ticket-info-label">Stade:</div>
                    <div class="ticket-info-value">${eventDetails.stadium_name || 'Non précisé'}</div>
                </div>
                <div class="ticket-info-row">
                    <div class="ticket-info-label">Catégorie:</div>
                    <div class="ticket-info-value">${ticket.ticket_type || ticket.category}</div>
                </div>
                <div class="ticket-info-row">
                    <div class="ticket-info-label">Place:</div>
                    <div class="ticket-info-value">${ticket.seat || ticket.seat_number || 'Non assignée'}</div>
                </div>
                <div class="ticket-info-row">
                    <div class="ticket-info-label">Référence:</div>
                    <div class="ticket-info-value">${ticket.id}</div>
                </div>
            `;
        } else {
            // Affichage minimal
            ticketDetails.innerHTML = `
                <div class="ticket-info-row">
                    <div class="ticket-info-label">ID du billet:</div>
                    <div class="ticket-info-value">${ticket.id || ticketUuid}</div>
                </div>
                <div class="ticket-info-row">
                    <div class="ticket-info-label">Catégorie:</div>
                    <div class="ticket-info-value">${ticket.ticket_type || ticket.category || 'Non précisée'}</div>
                </div>
                <div class="ticket-info-row">
                    <div class="ticket-info-label">Informations:</div>
                    <div class="ticket-info-value">Détails complets non disponibles</div>
                </div>
            `;
        }
    } else {
        // Affichage ticket invalide
        result.classList.add('invalid');
        result.classList.remove('valid');
        
        let statusMessage = `
            <div class="ticket-status status-invalid">
                <h3>✗ BILLET INVALIDE</h3>
                <p>${data.message}</p>
        `;
        
        if (data.used_at) {
            const usedDate = new Date(data.used_at);
            statusMessage += `<p>Utilisé le: ${usedDate.toLocaleDateString('fr-FR')} à ${usedDate.toLocaleTimeString('fr-FR')}</p>`;
        }
        
        statusMessage += `<p>ID scanné: ${ticketUuid}</p></div>`;
        
        ticketStatus.innerHTML = statusMessage;
        ticketDetails.innerHTML = '';
        validateSection.classList.add('hidden');
    }
}

/**
 * Affiche un message d'erreur
 */
function displayError(errorMessage, ticketUuid) {
    result.classList.remove('hidden');
    result.classList.add('invalid');
    result.classList.remove('valid');
    
    ticketStatus.innerHTML = `
        <div class="ticket-status status-invalid">
            <h3>✗ ERREUR</h3>
            <p>${errorMessage}</p>
            <p>ID scanné: ${ticketUuid}</p>
        </div>
    `;
    
    ticketDetails.innerHTML = '';
    validateSection.classList.add('hidden');
}