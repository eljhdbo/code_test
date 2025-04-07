from django.contrib import admin
from .models import Stadium, Team, Event, Ticket

@admin.register(Stadium)
class StadiumAdmin(admin.ModelAdmin):
    list_display = ('name', 'location')
    search_fields = ('name', 'location')

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'nickname')
    search_fields = ('name', 'code', 'nickname')
    list_filter = ('code',)

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_teams', 'start', 'stadium')
    list_filter = ('stadium', 'start')
    search_fields = ('team_home__name', 'team_away__name', 'stadium__name')
    date_hierarchy = 'start'
    
    def get_teams(self, obj):
        return f"{obj.team_home.name} vs {obj.team_away.name}"
    get_teams.short_description = 'Match'

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'event', 'category', 'price', 'purchase_date', 'is_used')
    list_filter = ('category', 'is_used', 'purchase_date')
    search_fields = ('user__username', 'event__team_home__name', 'event__team_away__name')
    date_hierarchy = 'purchase_date'
    readonly_fields = ('id', 'purchase_date')