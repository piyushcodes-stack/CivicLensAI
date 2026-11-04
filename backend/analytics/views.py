from django.db.models import Count
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from complaints.models import Complaint


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    user = request.user

    # Staff can see overall statistics.
    if (
        user.is_staff
        or user.is_superuser
        or getattr(user, "role", None) in ["STAFF", "ADMIN"]
    ):
        complaints = Complaint.objects.all()
    else:
        # Citizens can see statistics for their own complaints only.
        complaints = Complaint.objects.filter(reported_by=user)

    total = complaints.count()

    submitted = complaints.filter(
        status=Complaint.Status.SUBMITTED
    ).count()

    acknowledged = complaints.filter(
        status=Complaint.Status.ACKNOWLEDGED
    ).count()

    in_progress = complaints.filter(
        status=Complaint.Status.IN_PROGRESS
    ).count()

    resolved = complaints.filter(
        status=Complaint.Status.RESOLVED
    ).count()

    rejected = complaints.filter(
        status=Complaint.Status.REJECTED
    ).count()

    category_stats = list(
        complaints.values("category")
        .annotate(count=Count("id"))
        .order_by("category")
    )

    resolution_rate = (
        round((resolved / total) * 100, 2)
        if total > 0
        else 0
    )

    return Response({
        "total_complaints": total,
        "submitted": submitted,
        "acknowledged": acknowledged,
        "in_progress": in_progress,
        "resolved": resolved,
        "rejected": rejected,
        "resolution_rate": resolution_rate,
        "category_breakdown": category_stats,
    })