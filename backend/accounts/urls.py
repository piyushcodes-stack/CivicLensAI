from django.urls import path

from .views import login, profile, register

urlpatterns = [
    path("register/", register, name="register"),
    path("login/", login, name="login"),
    path("profile/", profile, name="profile"),
]