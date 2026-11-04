from rest_framework import serializers
from .models import Complaint


class ComplaintSerializer(serializers.ModelSerializer):
    reported_by_username = serializers.CharField(
        source="reported_by.username",
        read_only=True
    )

    class Meta:
        model = Complaint

        fields = [
            "id",
            "title",
            "description",
            "category",
            "status",
            "address",
            "latitude",
            "longitude",
            "image",
            "reported_by",
            "reported_by_username",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "status",
            "reported_by",
            "reported_by_username",
            "created_at",
            "updated_at",
        ]