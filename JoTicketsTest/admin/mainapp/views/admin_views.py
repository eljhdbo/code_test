from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from ..models import Event, Team, Stadium

def is_admin(user):
    """Vérifie si l'utilisateur est administrateur"""
    return user.is_authenticated and user.is_staff

def admin_login(request):
    """Vue pour la page de connexion administrateur"""
    # Si déjà connecté, rediriger vers la liste des matchs
    if request.user.is_authenticated and request.user.is_staff:
        return redirect('admin_matches')
    
    # Traitement du formulaire de connexion
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(username=username, password=password)
        
        if user is not None and user.is_staff:
            login(request, user)
            messages.success(request, "Connexion réussie")
            return redirect('admin_matches')
        else:
            messages.error(request, "Identifiants invalides")
    
    # Affichage du formulaire
    return render(request, 'auth/login.html')

@user_passes_test(is_admin, login_url='admin_login')
def admin_matches(request):
    """Vue pour la gestion des matchs"""
    # Traitement du formulaire de mise à jour
    if request.method == 'POST':
        event_id = request.POST.get('event_id')
        if event_id:
            try:
                event = get_object_or_404(Event, id=event_id)
                event.time = request.POST.get('start')
                event.stadium_id = request.POST.get('stadium')
                event.team_home_id = request.POST.get('team_home')
                event.team_away_id = request.POST.get('team_away')
                event.score_home = request.POST.get('score_team_home') or 0
                event.score_away = request.POST.get('score_team_away') or 0
                event.save()
                messages.success(request, "Match mis à jour avec succès")
            except Exception as e:
                messages.error(request, f"Erreur lors de la mise à jour: {str(e)}")
        
        # Si requête AJAX, retourner une réponse JSON
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'success': True})
        return redirect('admin_matches')

    # Préparation des données pour le template
    context = {
        'events': Event.objects.all().order_by('time'),
        'teams': Team.objects.all(),
        'stadiums': Stadium.objects.all()
    }
    return render(request, 'admin/matches.html', context)

@user_passes_test(is_admin, login_url='admin_login')
def admin_match_edit(request, pk):
    """Vue pour l'édition d'un match spécifique"""
    event = get_object_or_404(Event, pk=pk)
    if request.method == 'POST':
        # La logique d'édition est gérée dans admin_matches
        return redirect('admin_matches')
    return JsonResponse({'error': 'Méthode non autorisée'}, status=405)

@user_passes_test(is_admin, login_url='admin_login')
def admin_match_delete(request, pk):
    """Vue pour supprimer un match"""
    if request.method == 'POST':
        event = get_object_or_404(Event, pk=pk)
        event.delete()
        messages.success(request, "Match supprimé avec succès")
        return redirect('admin_matches')
    return JsonResponse({'error': 'Méthode non autorisée'}, status=405)

def admin_logout(request):
    """Vue pour la déconnexion"""
    logout(request)
    messages.info(request, "Vous avez été déconnecté")
    return redirect('admin_login')