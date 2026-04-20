from django.urls import path

from .views import AdvertiserListView, MeView

urlpatterns = [
    path("me/", MeView.as_view(), name="me"),
    path("advertisers/", AdvertiserListView.as_view(), name="advertisers"),
]
