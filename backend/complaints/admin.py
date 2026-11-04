from django.contrib import admin
from .models import Complaint


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "status",
        "reported_by",
        "created_at",
    )

    list_filter = (
        "category",
        "status",
        "created_at",
    )

    search_fields = (
        "title",
        "description",
        "address",
        "reported_by__username",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )