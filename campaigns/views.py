from decimal import Decimal

from django.core.paginator import EmptyPage, Paginator
from django.db.models import Sum
from django.db.models.functions import Coalesce
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from config.pagination import DefaultPagination

from .excel_import import parse_campaign_excel
from .models import Campaign, CampaignAssignment, CampaignMetricRow, UploadBatch
from .permissions import IsAdmin
from .serializers import (
    CampaignSerializer,
    UploadResponseSerializer,
)


def _campaign_queryset_for_user(user: User):
    if user.role == User.Role.ADMIN:
        return Campaign.objects.all()
    return Campaign.objects.filter(assignments__user=user).distinct()


def _decimal_to_float(d: Decimal) -> float:
    return float(d)


def _paginate_list(items, page_number: int, page_size: int = 10):
    paginator = Paginator(items, page_size)
    if paginator.count == 0:
        return {"count": 0, "next": None, "previous": None, "results": []}

    try:
        page_obj = paginator.page(max(1, page_number))
    except EmptyPage:
        page_obj = paginator.page(paginator.num_pages)

    return {
        "count": paginator.count,
        "next": page_obj.next_page_number() if page_obj.has_next() else None,
        "previous": page_obj.previous_page_number() if page_obj.has_previous() else None,
        "results": list(page_obj.object_list),
    }


class CampaignViewSet(viewsets.ModelViewSet):
    serializer_class = CampaignSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ("list", "retrieve", "metrics", "report"):
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdmin()]

    def get_queryset(self):
        qs = _campaign_queryset_for_user(self.request.user)
        params = self.request.query_params

        name = (params.get("name") or "").strip()
        if name:
            qs = qs.filter(name__icontains=name)

        date_from = (params.get("date_from") or "").strip()
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)

        date_to = (params.get("date_to") or "").strip()
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        advertiser_id = (params.get("advertiser_id") or "").strip()
        if advertiser_id:
            try:
                qs = qs.filter(assignments__user_id=int(advertiser_id)).distinct()
            except ValueError:
                pass

        return qs

    @action(detail=True, methods=["post"], url_path="upload")
    def upload(self, request, pk=None):
        campaign = self.get_object()
        file_obj = request.FILES.get("file")
        if not file_obj:
            return Response(
                {"detail": "Missing file field."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            rows = parse_campaign_excel(file_obj)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        batch = UploadBatch.objects.create(
            campaign=campaign,
            uploaded_by=request.user,
            filename=file_obj.name,
            row_count=len(rows),
        )
        bulk = [
            CampaignMetricRow(
                campaign=campaign,
                batch=batch,
                date=r["date"],
                impressions=r["impressions"],
                clicks=r["clicks"],
                spend=r["spend"],
                publisher=r["publisher"],
            )
            for r in rows
        ]
        CampaignMetricRow.objects.bulk_create(bulk)
        return Response(
            UploadResponseSerializer(batch).data, status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=["post"], url_path="assignments")
    def set_assignments(self, request, pk=None):
        campaign = self.get_object()
        ids = request.data.get("user_ids")
        if not isinstance(ids, list):
            return Response(
                {"detail": "user_ids must be a list of user ids."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        valid = (
            User.objects.filter(id__in=ids, role=User.Role.ADVERTISER)
            .values_list("id", flat=True)
            .distinct()
        )
        valid_set = set(valid)
        if valid_set != set(ids):
            return Response(
                {"detail": "All user_ids must exist and be advertisers."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        CampaignAssignment.objects.filter(campaign=campaign).delete()
        CampaignAssignment.objects.bulk_create(
            [
                CampaignAssignment(campaign=campaign, user_id=uid)
                for uid in valid_set
            ]
        )
        return Response(CampaignSerializer(campaign).data)

    @action(detail=True, methods=["get"], url_path="metrics")
    def metrics(self, request, pk=None):
        campaign = self.get_object()
        qs = CampaignMetricRow.objects.filter(campaign=campaign)
        d_from = request.query_params.get("date_from")
        d_to = request.query_params.get("date_to")
        table_view = request.query_params.get("table_view", "date")
        if d_from:
            qs = qs.filter(date__gte=d_from)
        if d_to:
            qs = qs.filter(date__lte=d_to)

        agg = qs.aggregate(
            impressions=Coalesce(Sum("impressions"), 0),
            clicks=Coalesce(Sum("clicks"), 0),
            spend=Coalesce(Sum("spend"), Decimal("0")),
        )
        imp = int(agg["impressions"] or 0)
        clk = int(agg["clicks"] or 0)
        spend = agg["spend"] or Decimal("0")
        ctr = (clk / imp) if imp else 0.0

        if table_view == "publisher":
            table_qs = (
                qs.values("publisher")
                .annotate(
                    impressions=Coalesce(Sum("impressions"), 0),
                    clicks=Coalesce(Sum("clicks"), 0),
                    spend=Coalesce(Sum("spend"), Decimal("0")),
                )
                .order_by("-impressions", "publisher")
            )
        else:
            table_qs = (
                qs.values("date")
                .annotate(
                    impressions=Coalesce(Sum("impressions"), 0),
                    clicks=Coalesce(Sum("clicks"), 0),
                    spend=Coalesce(Sum("spend"), Decimal("0")),
                )
                .order_by("date")
            )

        paginator = DefaultPagination()
        page = paginator.paginate_queryset(table_qs, request, view=self)
        table_rows = []
        for row in page:
            row_impressions = int(row["impressions"] or 0)
            row_clicks = int(row["clicks"] or 0)
            row_spend = row["spend"] or Decimal("0")
            table_rows.append(
                {
                    "label": (
                        (row.get("publisher") or "—")
                        if table_view == "publisher"
                        else row["date"].isoformat()
                    ),
                    "impressions": row_impressions,
                    "clicks": row_clicks,
                    "ctr": (row_clicks / row_impressions) if row_impressions else 0.0,
                    "spend": _decimal_to_float(row_spend),
                }
            )

        table_payload = paginator.get_paginated_response(table_rows).data

        return Response(
            {
                "summary": {
                    "impressions": imp,
                    "clicks": clk,
                    "spend": _decimal_to_float(spend),
                    "ctr": ctr,
                },
                "table_view": "publisher" if table_view == "publisher" else "date",
                "table": table_payload,
            }
        )

    @action(detail=True, methods=["get"], url_path="report")
    def report(self, request, pk=None):
        return self.metrics(request, pk=pk)


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = _campaign_queryset_for_user(request.user)
        campaign_ids = list(qs.values_list("id", flat=True))

        metric_qs = CampaignMetricRow.objects.filter(campaign_id__in=campaign_ids)
        d_from = request.query_params.get("date_from")
        d_to = request.query_params.get("date_to")
        try:
            campaign_page = max(
                1, int(request.query_params.get("campaign_page", "1") or "1")
            )
        except (TypeError, ValueError):
            campaign_page = 1
        try:
            daily_page = max(1, int(request.query_params.get("daily_page", "1") or "1"))
        except (TypeError, ValueError):
            daily_page = 1
        if d_from:
            metric_qs = metric_qs.filter(date__gte=d_from)
        if d_to:
            metric_qs = metric_qs.filter(date__lte=d_to)

        totals = metric_qs.aggregate(
            impressions=Coalesce(Sum("impressions"), 0),
            clicks=Coalesce(Sum("clicks"), 0),
            spend=Coalesce(Sum("spend"), Decimal("0")),
        )
        imp = int(totals["impressions"] or 0)
        clk = int(totals["clicks"] or 0)
        spend = totals["spend"] or Decimal("0")

        per_campaign = []
        for cid, name in qs.values_list("id", "name"):
            sub = metric_qs.filter(campaign_id=cid).aggregate(
                impressions=Coalesce(Sum("impressions"), 0),
                clicks=Coalesce(Sum("clicks"), 0),
                spend=Coalesce(Sum("spend"), Decimal("0")),
            )
            per_campaign.append(
                {
                    "id": cid,
                    "name": name,
                    "impressions": int(sub["impressions"] or 0),
                    "clicks": int(sub["clicks"] or 0),
                    "spend": _decimal_to_float(sub["spend"] or Decimal("0")),
                }
            )

        daily = (
            metric_qs.values("date")
            .annotate(
                impressions=Coalesce(Sum("impressions"), 0),
                clicks=Coalesce(Sum("clicks"), 0),
                spend=Coalesce(Sum("spend"), Decimal("0")),
            )
            .order_by("date")
        )
        daily_rows = [
            {
                "date": row["date"].isoformat(),
                "impressions": int(row["impressions"] or 0),
                "clicks": int(row["clicks"] or 0),
                "spend": _decimal_to_float(row["spend"] or Decimal("0")),
            }
            for row in daily
        ]
        paginated_campaigns = _paginate_list(per_campaign, campaign_page, page_size=10)
        paginated_daily = _paginate_list(daily_rows, daily_page, page_size=10)

        return Response(
            {
                "totals": {
                    "impressions": imp,
                    "clicks": clk,
                    "spend": _decimal_to_float(spend),
                    "ctr": (clk / imp) if imp else 0.0,
                },
                "campaigns": paginated_campaigns,
                "daily": paginated_daily,
                "daily_trend": daily_rows,
            }
        )
