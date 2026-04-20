from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        ADVERTISER = "advertiser", "Advertiser"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.ADVERTISER)

    def __str__(self) -> str:
        return f"{self.username} ({self.role})"
