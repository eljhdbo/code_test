from django.contrib import admin
from django.urls import path
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static
from django.views.decorators.csrf import csrf_exempt

# Import des vues d'administration
from .views.admin_views import (
    admin_login,
    admin_matches,
    admin_match_edit,
    admin_match_delete,
    admin_logout
)

# Si vous avez un fichier api_views.py dans votre dossier views
from .views.api_views import (
    get_csrf_token,
    stadiums_list,
    teams_list,
    events_list,
    register,
    login_view,
    logout_view,
    buy_ticket,
    user_tickets,
    get_ticket_info,
    validate_ticket
)

# Import de l'API de vérification des tickets
from .views.ticket_verification_api import VerifyTicketAPIView

urlpatterns = [
    # URLs d'administration Django standard
    path('admin/', admin.site.urls),
    
    # URLs de l'interface d'administration personnalisée
    path('gestion/login/', admin_login, name='admin_login'),
    path('gestion/matches/', admin_matches, name='admin_matches'),
    path('gestion/matches/<int:pk>/edit/', admin_match_edit, name='admin_match_edit'),
    path('gestion/matches/<int:pk>/delete/', admin_match_delete, name='admin_match_delete'),
    path('gestion/logout/', admin_logout, name='admin_logout'),
    
    # API endpoints pour les données
    path('api/csrf-token/', get_csrf_token, name='csrf_token'),
    path('api/stadiums/', stadiums_list, name='stadiums_list'),
    path('api/teams/', teams_list, name='teams_list'),
    path('api/events/', events_list, name='events_list'),
    
    # API endpoints pour l'authentification
    path('api/register/', register, name='register'),
    path('api/login/', login_view, name='login'),
    path('api/logout/', logout_view, name='logout'),
    
    # API endpoints pour les tickets
    path('api/buyTicket/', csrf_exempt(buy_ticket), name='buy_ticket'),
    path('api/tickets/', user_tickets, name='user_tickets'),
    path('api/getInfo/<uuid:ticket_id>/', get_ticket_info, name='get_ticket_info'),
    path('api/validateTicket/<uuid:ticket_id>/', validate_ticket, name='validate_ticket'),
    
    # API endpoint pour la vérification des tickets (scanner)
    path('api/tickets/verify/<str:uuid>/', VerifyTicketAPIView.as_view(), name='verify_ticket'),
    
    # Redirection de la racine
    path('', RedirectView.as_view(url='/gestion/login/', permanent=False)),
]

# En mode développement, ajouter les URLs pour servir les fichiers média
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)