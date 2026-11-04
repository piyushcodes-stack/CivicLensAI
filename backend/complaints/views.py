
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Complaint
from .serializers import ComplaintSerializer

from ai_engine.classifier import classify_complaint
from ai_engine.priority_predictor import predict_priority
from ai_engine.duplicate_detector import detect_duplicate

class ComplaintViewSet(viewsets.ModelViewSet):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Staff and administrators can view all complaints.
        if (
            user.is_staff
            or user.is_superuser
            or getattr(user, "role", None) in ["STAFF", "ADMIN"]
        ):
            return Complaint.objects.all()

        # Citizens can view only their own complaints.
        return Complaint.objects.filter(reported_by=user)

    def perform_create(self, serializer):
        # Automatically assign the complaint to the logged-in user.
        serializer.save(reported_by=self.request.user)

    @action(detail=False, methods=["post"], url_path="classify")
    def classify(self, request):
        """
        Suggest a complaint category using the baseline classifier.
        This endpoint does not create a complaint.
        """
        title = request.data.get("title", "")
        description = request.data.get("description", "")

        if not isinstance(title, str) or not isinstance(description, str):
            return Response(
                {"error": "Title and description must be text."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not title.strip() and not description.strip():
            return Response(
                {"error": "Provide a complaint title or description."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        result = classify_complaint(title, description)

        valid_categories = Complaint.Category.values

        if result.get("category") not in valid_categories:
            return Response(
                {"error": "The classifier returned an unsupported category."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(result, status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=["post"],
        url_path="predict-priority",
    )
    def predict_priority_api(self, request):
        """
        Estimate complaint priority using the baseline predictor.
        This endpoint does not create a complaint.
        """
        title = request.data.get("title", "")
        description = request.data.get("description", "")

        if not isinstance(title, str) or not isinstance(description, str):
            return Response(
                {"error": "Title and description must be text."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not title.strip() and not description.strip():
            return Response(
                {"error": "Provide a complaint title or description."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        result = predict_priority(title, description)

        return Response(result, status=status.HTTP_200_OK)
    @action(
        detail=False,
        methods=["post"],
        url_path="check-duplicate",
    )
    def check_duplicate(self, request):
        """
        Check whether a similar complaint already exists.
        Does not create, modify, or reject any complaint.
        """
        title = request.data.get("title", "")
        description = request.data.get("description", "")

        if not isinstance(title, str) or not isinstance(description, str):
            return Response(
                {"error": "Title and description must be text."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not title.strip() and not description.strip():
            return Response(
                {"error": "Provide a complaint title or description."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        existing_complaints = list(
            Complaint.objects.all().values(
                "id",
                "title",
                "description",
            )
        )

        result = detect_duplicate(
            title,
            description,
            existing_complaints,
        )

        # Do not expose another citizen's complaint description.
        match = result.get("match")

        safe_match = None
        if match:
            safe_match = {
                "id": match.get("id"),
                "similarity": match.get("similarity"),
            }

        return Response(
            {
                "duplicate_found": result["duplicate_found"],
                "similarity": result.get("similarity", 0.0),
                "message": result["message"],
                "match": safe_match,
            },
            status=status.HTTP_200_OK,
        )
    @action(detail=True, methods=["patch"], url_path="update-status")
    def update_status(self, request, pk=None):
        """
        Allow authorized staff to update a complaint's status.
        """
        user = request.user

        if not (
            user.is_staff
            or user.is_superuser
            or getattr(user, "role", None) in ["STAFF", "ADMIN"]
        ):
            return Response(
                {
                    "error": "Only authorized staff can update complaint status."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        complaint = self.get_object()
        new_status = request.data.get("status")

        valid_statuses = Complaint.Status.values

        if new_status not in valid_statuses:
            return Response(
                {
                    "error": "Invalid status.",
                    "valid_statuses": valid_statuses,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        complaint.status = new_status
        complaint.save(update_fields=["status", "updated_at"])

        return Response(
            {
                "message": "Complaint status updated successfully.",
                "complaint_id": complaint.id,
                "status": complaint.status,
            },
            status=status.HTTP_200_OK,
        )
    @action(detail=False, methods=["get"], url_path="analytics")
    def analytics(self, request):
        complaints = self.get_queryset()

        total = complaints.count()

        resolved = complaints.filter(
            status=Complaint.Status.RESOLVED
        ).count()

        pending = complaints.filter(
            status__in=[
                Complaint.Status.SUBMITTED,
                Complaint.Status.ACKNOWLEDGED,
            ]
        ).count()

        in_progress = complaints.filter(
            status=Complaint.Status.IN_PROGRESS
        ).count()

        rejected = complaints.filter(
            status=Complaint.Status.REJECTED
        ).count()

        category_stats = []

        for value, label in Complaint.Category.choices:
            count = complaints.filter(category=value).count()

            category_stats.append({
                "category": value,
                "label": label,
                "count": count,
            })

        return Response({
            "total": total,
            "resolved": resolved,
            "pending": pending,
            "in_progress": in_progress,
            "rejected": rejected,
            "categories": category_stats,
        })