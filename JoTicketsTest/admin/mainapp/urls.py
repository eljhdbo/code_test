from django.contrib import admin
from django.urls import path, include
from django.urls import path
from django.views.generic import RedirectView
from .views.api import register, login_view, logout_view, stadiums_list, teams_list, events_list, buy_ticket, user_tickets, get_ticket_info, validate_ticket, get_csrf_token
from . import views

urlpatterns = [
    # URL d'administration Django
    path('admin/', admin.site.urls),
    
    # API Endpoints
    path('api/csrf-token/', views.get_csrf_token, name='csrf_token'),
    path('api/stadiums/', views.stadiums_list, name='stadiums_list'),
    path('api/teams/', views.teams_list, name='teams_list'),
    path('api/events/', views.events_list, name='events_list'),
    path('api/register/', views.register, name='register'),
    path('api/register/', register, name='register'),
    path('api/login/', views.login_view, name='login'),
    path('api/logout/', views.logout_view, name='logout'),
    path('api/buyTicket/', views.buy_ticket, name='buy_ticket'),
    path('api/buyTicket/', buy_ticket, name='buy_ticket'),
    path('api/tickets/', views.user_tickets, name='user_tickets'),
    path('api/getInfo/<uuid:ticket_id>/', views.get_ticket_info, name='get_ticket_info'),
    path('api/validateTicket/<uuid:ticket_id>/', views.validate_ticket, name='validate_ticket'),
    
    # Redirection de la racine vers l'admin
    path('', RedirectView.as_view(url='/admin/', permanent=True)),
]