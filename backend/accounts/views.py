from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import (
    api_view,
    permission_classes,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .serializers import RegisterSerializer, UserSerializer


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                "message": "Registration successful.",
                "token": token.key,
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get("username", "").strip()
    password = request.data.get("password", "")

    if not username or not password:
        return Response(
            {"error": "Username and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(
        request,
        username=username,
        password=password,
    )

    if user is None:
        return Response(
            {"error": "Invalid username or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    token, _ = Token.objects.get_or_create(user=user)

    return Response(
        {
            "message": "Login successful.",
            "token": token.key,
            "user": UserSerializer(user).data,
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile(request):
    return Response(UserSerializer(request.user).data)