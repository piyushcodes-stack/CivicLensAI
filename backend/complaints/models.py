from django.conf import settings
from django.db import models


class Complaint(models.Model):

    class Category(models.TextChoices):
        ROADS = "ROADS", "Roads and Potholes"
        GARBAGE = "GARBAGE", "Garbage and Waste"
        WATER = "WATER", "Water Supply"
        ELECTRICITY = "ELECTRICITY", "Electricity and Streetlights"
        DRAINAGE = "DRAINAGE", "Drainage and Sewage"
        PUBLIC_SAFETY = "PUBLIC_SAFETY", "Public Safety"
        OTHER = "OTHER", "Other"

    class Status(models.TextChoices):
        SUBMITTED = "SUBMITTED", "Submitted"
        ACKNOWLEDGED = "ACKNOWLEDGED", "Acknowledged"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        RESOLVED = "RESOLVED", "Resolved"
        REJECTED = "REJECTED", "Rejected"

    title = models.CharField(max_length=200)
    description = models.TextField()

    category = models.CharField(
        max_length=20,
        choices=Category.choices
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SUBMITTED
    )

    address = models.CharField(
        max_length=300,
        default="Unknown"
    )

    latitude = models.DecimalField(
        max_digits=30,
        decimal_places=25,
        null=True,
        blank=True
    )

    longitude = models.DecimalField(

        max_digits=30,
        decimal_places=25,
        null=True,
        blank=True
    )

    image = models.ImageField(
        upload_to="complaints/",
        null=True,
        blank=True
    )

    reported_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="complaints"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - {self.status}"