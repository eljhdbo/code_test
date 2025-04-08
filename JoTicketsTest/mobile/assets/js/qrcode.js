/*
Vue d'ensemble du fichier :
Ce fichier définit une classe QRCodeManager qui gère la génération et le téléchargement de codes QR.
Version améliorée pour garantir la compatibilité avec le scanner de billets.
*/

class QRCodeManager {
    constructor() {
        this.loadQRiousLibrary();
    }
    
    // Cette méthode charge dynamiquement la bibliothèque QRious depuis internet
    loadQRiousLibrary() {
        if (typeof QRious === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/qrious@4.0.2/dist/qrious.min.js';
            script.async = true;
            document.head.appendChild(script);
            
            script.onload = () => {
                console.log('QRious chargé avec succès');
            };
            
            script.onerror = () => {
                console.error('Erreur lors du chargement de QRious');
            };
        }
    }

    /**
     * Génère un code QR dans un élément canvas existant
     * @param {string} elementId - ID de l'élément canvas
     * @param {string} value - Valeur à encoder dans le QR code
     * @param {number} size - Taille du QR code en pixels
     * @return {QRious} Instance de QRious
     */
    generateQRCode(elementId, value, size = 150) {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`Élément avec l'ID ${elementId} non trouvé`);
            return null;
        }
        
        // S'assurer que la valeur est une chaîne
        const stringValue = String(value);
        console.log(`Génération de QR code pour: ${stringValue}`);
        
        return new QRious({
            element: element,
            value: stringValue,
            size: size,
            level: 'H' // Niveau de correction d'erreur élevé pour une meilleure lecture
        });
    }

    /**
     * Télécharge un QR code existant en tant qu'image PNG
     * @param {string} elementId - ID du canvas contenant le QR code
     * @param {string} fileName - Nom du fichier pour le téléchargement
     * @return {boolean} Succès de l'opération
     */
    downloadQRCode(elementId, fileName) {
        const canvas = document.getElementById(elementId);
        if (!canvas) {
            console.error(`Canvas avec l'ID ${elementId} non trouvé`);
            return false;
        }
        
        try {
            // Augmenter la taille du QR code pour le téléchargement
            const downloadCanvas = document.createElement('canvas');
            downloadCanvas.width = 500;
            downloadCanvas.height = 500;
            const ctx = downloadCanvas.getContext('2d');
            
            // Fond blanc
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);
            
            // Dessiner le QR code
            ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 50, 50, 400, 400);
            
            // Ajouter une bordure
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(48, 48, 404, 404);
            
            // Ajouter du texte
            ctx.fillStyle = 'black';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Billet JO Paris 2024', downloadCanvas.width / 2, 480);
            
            // Convertir en URL de données
            const dataUrl = downloadCanvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = fileName || 'qrcode.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return true;
        } catch (error) {
            console.error('Erreur lors du téléchargement du QR code:', error);
            return false;
        }
    }
    
    /**
     * Génère des QR codes pour une liste de billets
     * @param {Array} tickets - Tableau d'objets représentant les billets
     */
    generateQRCodesForTickets(tickets) {
        if (!tickets || !tickets.length) return;
        
        const checkQRious = () => {
            if (typeof QRious !== 'undefined') {
                tickets.forEach(ticket => {
                    const canvasId = `qrcode-${ticket.id}`;
                    const canvas = document.getElementById(canvasId);
                    if (canvas) {
                        // Utiliser l'UUID du ticket qui est compatible avec le scanner
                        const valueToEncode = ticket.ticket_uuid || ticket.id.toString();
                        console.log(`Encodage du billet ID: ${ticket.id}, Valeur: ${valueToEncode}`);
                        this.generateQRCode(canvasId, valueToEncode);
                    }
                });
                
                document.querySelectorAll('.download-btn').forEach(button => {
                    button.addEventListener('click', () => {
                        const ticketId = button.dataset.ticketId;
                        this.downloadQRCode(`qrcode-${ticketId}`, `ticket-${ticketId}.png`);
                    });
                });
            } else {
                setTimeout(checkQRious, 100);
            }
        };
        
        checkQRious();
    }
}

// Crée une instance globale du gestionnaire de QR codes
const qrCodeManager = new QRCodeManager();