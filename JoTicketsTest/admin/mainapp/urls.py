from django.urls import path
from . import views

urlpatterns = [
    # Génération du token CSRF
    path('api/csrf-token/', views.get_csrf_token, name='csrf_token'),
    
    # API pour les stades, équipes et événements
    path('api/stadiums/', views.stadiums_list, name='stadiums_list'),
    path('api/teams/', views.teams_list, name='teams_list'),
    path('api/events/', views.events_list, name='events_list'),
    
    # API pour l'authentification
    path('api/register/', views.register, name='register'),
    path('api/login/', views.login_view, name='login'),
    path('api/logout/', views.logout_view, name='logout'),
    
    # API pour les billets
    path('api/buyTicket/', views.buy_ticket, name='buy_ticket'),
    path('api/tickets/', views.user_tickets, name='user_tickets'),
    path('api/getInfo/<uuid:ticket_id>/', views.get_ticket_info, name='get_ticket_info'),
    path('api/validateTicket/<uuid:ticket_id>/', views.validate_ticket, name='validate_ticket'),
]