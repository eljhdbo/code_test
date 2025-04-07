from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from ..models import Stadium, Team, Event, Ticket
import json
import uuid

# Fonction utilitaire pour sérialiser un objet Stadium
def serialize_stadium(stadium):
    return {
        'id': stadium.id,
        'name': stadium.name,
        'location': stadium.location,
    }

# Fonction utilitaire pour sérialiser un objet Team
def serialize_team(team):
    return {
        'id': team.id,
        'name': team.name,
        'code': team.code,
        'nickname': team.nickname,
    }

# Fonction utilitaire pour sérialiser un objet Event
def serialize_event(event):
    return {
        'id': event.id,
        'start': event.start.isoformat(),
        'stadium': serialize_stadium(event.stadium),
        'team_home': serialize_team(event.team_home) if event.team_home else None,
        'team_away': serialize_team(event.team_away) if event.team_away else None,
    }

# Fonction utilitaire pour sérialiser un objet User
def serialize_user(user):
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
    }

# Fonction utilitaire pour sérialiser un objet Ticket
def serialize_ticket(ticket):
    return {
        'id': str(ticket.id),
        'user': serialize_user(ticket.user),
        'event': serialize_event(ticket.event),
        'category': ticket.category,
        'price': float(ticket.price),
        'purchase_date': ticket.purchase_date.isoformat(),
        'is_used': ticket.is_used,
    }

# Générer un token CSRF
@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'detail': 'CSRF cookie set'})

# API: Stades
@api_view(['GET'])
@permission_classes([AllowAny])
def stadiums_list(request):
    stadiums = Stadium.objects.all()
    data = [serialize_stadium(stadium) for stadium in stadiums]
    return Response(data)

# API: Équipes
@api_view(['GET'])
@permission_classes([AllowAny])
def teams_list(request):
    teams = Team.objects.all()
    data = [serialize_team(team) for team in teams]
    return Response(data)  # Assurez-vous d'utiliser Response de rest_framework.response

# API: Événements
@api_view(['GET'])
@permission_classes([AllowAny])
def events_list(request):
    events = Event.objects.all().order_by('start')
    data = [serialize_event(event) for event in events]
    return Response(data)

# API: Inscription utilisateur
@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt  # Ajouter cette ligne pour ignorer temporairement CSRF
def register(request):
    if request.method != 'POST':
        return JsonResponse({'message': 'Méthode non autorisée'}, status=405)
    
    try:
        data = json.loads(request.body)
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        # Validation de base
        if not username or not email or not password:
            return JsonResponse({'message': 'Veuillez fournir tous les champs requis'}, status=400)
        
        # Vérifier si l'utilisateur existe déjà
        if User.objects.filter(username=username).exists() or User.objects.filter(email=email).exists():
            return JsonResponse({'message': 'Cet utilisateur existe déjà'}, status=400)
        
        # Créer l'utilisateur
        user = User.objects.create_user(username=username, email=email, password=password)
        
        # Connecter l'utilisateur
        login(request, user)
        
        return JsonResponse({
            'message': 'Inscription réussie',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        })
    except Exception as e:
        import traceback
        print(f"Erreur: {str(e)}")
        print(traceback.format_exc())
        return JsonResponse({'message': f'Erreur serveur: {str(e)}'}, status=500)

# API: Connexion utilisateur
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return Response({'message': 'Veuillez fournir l\'email et le mot de passe'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'message': 'Email ou mot de passe incorrect'}, status=status.HTTP_401_UNAUTHORIZED)
        
        user = authenticate(username=user.username, password=password)
        
        if user is not None:
            login(request, user)
            return Response({
                'message': 'Connexion réussie',
                'user': serialize_user(user)
            })
        else:
            return Response({'message': 'Email ou mot de passe incorrect'}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# API: Déconnexion utilisateur
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({'message': 'Déconnexion réussie'})

# API: Achat de billet
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def buy_ticket(request):
    try:
        data = json.loads(request.body)
        event_id = data.get('event_id')
        category = data.get('category', '').upper()
        quantity = int(data.get('quantity', 1))
        
        if not event_id or not category:
            return Response({'message': 'Veuillez fournir l\'ID de l\'événement et la catégorie'}, status=status.HTTP_400_BAD_REQUEST)
        
        if category not in ['SILVER', 'GOLD', 'PLATINUM']:
            return Response({'message': 'Catégorie invalide'}, status=status.HTTP_400_BAD_REQUEST)
        
        if quantity < 1 or quantity > 10:
            return Response({'message': 'La quantité doit être comprise entre 1 et 10'}, status=status.HTTP_400_BAD_REQUEST)
        
        event = get_object_or_404(Event, id=event_id)
        
        # Prix selon la catégorie
        price = {
            'SILVER': 100,
            'GOLD': 200,
            'PLATINUM': 300
        }[category]
        
        tickets = []
        
        for _ in range(quantity):
            ticket = Ticket.objects.create(
                user=request.user,
                event=event,
                category=category,
                price=price
            )
            tickets.append(serialize_ticket(ticket))
        
        return Response({
            'message': f"{quantity} billet(s) acheté(s) avec succès",
            'tickets': tickets
        })
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# API: Liste des billets de l'utilisateur connecté
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_tickets(request):
    tickets = Ticket.objects.filter(user=request.user).order_by('-purchase_date')
    data = [serialize_ticket(ticket) for ticket in tickets]
    return Response(data)

# API: Informations sur un billet spécifique
@api_view(['GET'])
@permission_classes([AllowAny])
def get_ticket_info(request, ticket_id):
    try:
        ticket = get_object_or_404(Ticket, id=ticket_id)
        return Response(serialize_ticket(ticket))
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# API: Valider un billet (marquer comme utilisé)
@api_view(['POST'])
@permission_classes([AllowAny])
def validate_ticket(request, ticket_id):
    try:
        ticket = get_object_or_404(Ticket, id=ticket_id)
        
        if ticket.is_used:
            return Response({'message': 'Ce billet a déjà été utilisé'}, status=status.HTTP_400_BAD_REQUEST)
        
        ticket.is_used = True
        ticket.save()
        
        return Response({
            'message': 'Billet validé avec succès',
            'ticket': serialize_ticket(ticket)
        })
    except Exception as e:
        return Response({'message': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)