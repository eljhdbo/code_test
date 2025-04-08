from django.db import models
from django.contrib.auth.models import User
import uuid
from .event import Event

class Ticket(models.Model):
    CATEGORY_CHOICES = [
        ('SILVER', 'Silver'),
        ('GOLD', 'Gold'),
        ('PLATINUM', 'Platinum'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICES)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    purchase_date = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Ticket {self.id} - {self.user.username} - {self.event}"
    
    def save(self, *args, **kwargs):
        if not self.price:
            if self.category == 'SILVER':
                self.price = 100
            elif self.category == 'GOLD':
                self.price = 200
            elif self.category == 'PLATINUM':
                self.price = 300
        
        super().save(*args, **kwargs)