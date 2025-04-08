function openModal(matchId) {
    const modal = document.getElementById('editModal');
    const form = modal.querySelector('form');
    
    fetch(`/api/events/${matchId}/`)
        .then(response => response.json())
        .then(data => {
            form.querySelector('[name="match_id"]').value = matchId;
            form.querySelector('[name="start"]').value = formatDateTime(data.time);
            form.querySelector('[name="stadium"]').value = data.stadium.id;
            form.querySelector('[name="team_home"]').value = data.team_home.id;
            form.querySelector('[name="team_away"]').value = data.team_away.id;
            
            modal.style.display = 'block';
        });
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
}

window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        closeModal();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const editForm = document.querySelector('#editModal form');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            const teamHome = this.querySelector('[name="team_home"]').value;
            const teamAway = this.querySelector('[name="team_away"]').value;
            
            if (teamHome === teamAway) {
                e.preventDefault();
                alert("Les équipes domicile et extérieure doivent être différentes");
                return;
            }
        });
    }
});