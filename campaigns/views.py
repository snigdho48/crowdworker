from decimal import Decimal

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
    CampaignMetricRowSerializer,
    CampaignSerializer,
    UploadResponseSerializer,
)


def _campaign_queryset_for_user(user: User):
    if user.role == User.Role.ADMIN:
        return Campaign.objects.all()
    return Campaign.objects.filter(assignments__user=user).distinct()


def _decimal_to_float(d: Decimal) -> float:
    return float(d)


def _paginate_items(request, items, page_param="table_page"):
    paginator = DefaultPagination()
    page_size = paginator.get_page_size(request)
    try:
        page_number = int(request.query_params.get(page_param, 1))
    except (TypeError, ValueError):
        page_number = 1
    if page_number < 1:
        page_number = 1

    total = len(items)
    start = (page_number - 1) * page_size
    end = start + page_size
    page_items = items[start:end]

    base = request.build_absolute_uri(request.path)
    q = request.query_params.copy()
    next_link = None
    previous_link = None
    if end < total:
        q[page_param] = str(page_number + 1)
        next_link = f"{base}?{q.urlencode()}"
    if start > 0:
        q[page_param] = str(page_number - 1)
        previous_link = f"{base}?{q.urlencode()}"

    return page_items, {
        "table_count": total,
        "table_next": next_link,
        "table_previous": previous_link,
    }


def _metric_row_to_table(d, campaign_label, dim_key="date"):
    if dim_key == "date":
        dim_val = d.get("date")
        if hasattr(dim_val, "isoformat"):
            dim_val = dim_val.isoformat()
        else:
            dim_val = str(dim_val or "")
    else:
        dim_val = str(d.get(dim_key) or d.get("publisher") or "—")

    impressions = int(d.get("impressions") or 0)
    clicks = int(d.get("clicks") or 0)
    spend = _decimal_to_float(d.get("spend") or Decimal("0"))
    ctr = (clicks / impressions * 100) if impressions else 0.0
    cpm = (spend / impressions * 1000) if impressions else 0.0
    cpc = (spend / clicks) if clicks else 0.0
    return {
        "dim": dim_val,
        "campaign": campaign_label,
        "impressions": impressions,
        "viewableImpressions": round(impressions * 0.78),
        "reach": round(impressions * 0.52),
        "clicks": clicks,
        "ctr": ctr,
        "cpm": cpm,
        "cpc": cpc,
        "cost": spend,
    }


def _build_table_rows(dimension, campaign_label, daily, by_publisher, by_dimension):
    dim = (dimension or "Date").strip()
    if dim == "Date":
        return [_metric_row_to_table(d, campaign_label, "date") for d in daily]
    if dim == "Domain":
        return [
            _metric_row_to_table(r, campaign_label, "publisher") for r in by_publisher
        ]
    key_map = {
        "App": "app",
        "Creative": "creative",
        "Device type": "device_type",
        "City": "city",
        "Age": "age",
        "Carrier": "carrier",
    }
    field = key_map.get(dim)
    if field and by_dimension:
        return [_metric_row_to_table(r, campaign_label, field) for r in by_dimension]
    return []


class CampaignViewSet(viewsets.ModelViewSet):
    serializer_class = CampaignSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ("list", "retrieve", "metrics", "report"):
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdmin()]

    def get_queryset(self):
        qs = _campaign_queryset_for_user(self.request.user)
        if self.action == "list":
            params = self.request.query_params
            type_ = params.get("type")
            if type_ and type_ != "All":
                qs = qs.filter(type=type_)
            status_ = params.get("status")
            if status_ and status_ != "All":
                qs = qs.filter(status__iexact=status_)
            ids = params.get("ids")
            if ids:
                id_list = [x.strip() for x in ids.split(",") if x.strip()]
                if id_list:
                    qs = qs.filter(id__in=id_list)
            date_from = params.get("date_from")
            date_to = params.get("date_to")
            if date_from:
                qs = qs.filter(end_date__gte=date_from)
            if date_to:
                qs = qs.filter(start_date__lte=date_to)
        return qs.annotate(
            impressions=Coalesce(Sum("metric_rows__impressions"), 0),
            clicks=Coalesce(Sum("metric_rows__clicks"), 0),
            spend=Coalesce(Sum("metric_rows__spend"), Decimal("0")),
        )

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
                domain=r.get("domain", ""),
                app=r.get("app", ""),
                creative=r.get("creative", ""),
                device_type=r.get("device_type", ""),
                city=r.get("city", ""),
                age=r.get("age", ""),
                carrier=r.get("carrier", ""),
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
        if d_from:
            qs = qs.filter(date__gte=d_from)
        if d_to:
            qs = qs.filter(date__lte=d_to)

        row_qs = qs.order_by("date", "id")
        paginator = DefaultPagination()
        page_qs = paginator.paginate_queryset(row_qs, self.request)
        rows = list(page_qs) if page_qs is not None else list(row_qs)
        serializer = CampaignMetricRowSerializer(rows, many=True)

        agg = qs.aggregate(
            impressions=Coalesce(Sum("impressions"), 0),
            clicks=Coalesce(Sum("clicks"), 0),
            spend=Coalesce(Sum("spend"), Decimal("0")),
        )
        imp = int(agg["impressions"] or 0)
        clk = int(agg["clicks"] or 0)
        spend = agg["spend"] or Decimal("0")
        ctr = (clk / imp) if imp else 0.0
        by_pub = list(
            qs.values("publisher")
            .annotate(
                impressions=Coalesce(Sum("impressions"), 0),
                clicks=Coalesce(Sum("clicks"), 0),
                spend=Coalesce(Sum("spend"), Decimal("0")),
            )
            .order_by("-impressions")
        )

        dim = (request.query_params.get("dimension") or "").strip().lower()
        dim_map = {
            "domain": "publisher",
            "publisher": "publisher",
            "app": "app",
            "creative": "creative",
            "device": "device_type",
            "device type": "device_type",
            "device_type": "device_type",
            "city": "city",
            "age": "age",
            "carrier": "carrier",
            "publisher": "publisher",
        }
        by_dimension = []
        if dim:
            field = dim_map.get(dim)
            if field:
                by_dimension = list(
                    qs.values(field)
                    .annotate(
                        impressions=Coalesce(Sum("impressions"), 0),
                        clicks=Coalesce(Sum("clicks"), 0),
                        spend=Coalesce(Sum("spend"), Decimal("0")),
                    )
                    .order_by("-impressions")
                )

        daily = [
            {
                "date": row["date"].isoformat()
                if hasattr(row["date"], "isoformat")
                else str(row["date"]),
                "impressions": int(row["impressions"] or 0),
                "clicks": int(row["clicks"] or 0),
                "spend": _decimal_to_float(row["spend"] or Decimal("0")),
            }
            for row in qs.values("date")
            .annotate(
                impressions=Coalesce(Sum("impressions"), 0),
                clicks=Coalesce(Sum("clicks"), 0),
                spend=Coalesce(Sum("spend"), Decimal("0")),
            )
            .order_by("date")
        ]

        dimension_label = (request.query_params.get("dimension") or "Date").strip()
        if dimension_label.lower() == "domain":
            dimension_label = "Domain"
        campaign_label = campaign.name or f"Campaign #{campaign.id}"
        all_table_rows = _build_table_rows(
            dimension_label,
            campaign_label,
            daily,
            by_pub,
            by_dimension,
        )
        table_rows, table_meta = _paginate_items(request, all_table_rows)

        payload = {
            "summary": {
                "impressions": imp,
                "clicks": clk,
                "spend": _decimal_to_float(spend),
                "ctr": ctr,
            },
            "rows": serializer.data,
            "by_publisher": by_pub,
            "by_dimension": by_dimension,
            "daily": daily,
            "dimension": dim,
            "table_rows": table_rows,
            **table_meta,
        }
        if page_qs is not None:
            payload["rows_count"] = paginator.page.paginator.count
            payload["rows_next"] = paginator.get_next_link()
            payload["rows_previous"] = paginator.get_previous_link()
        return Response(payload)

    @action(detail=True, methods=["get"], url_path="report")
    def report(self, request, pk=None):
        return self.metrics(request, pk=pk)


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = _campaign_queryset_for_user(request.user)
        status_filter = request.query_params.get("status")
        qs_for_list = qs
        if status_filter and status_filter != "All":
            qs_for_list = qs.filter(status__iexact=status_filter)
        campaign_ids = list(qs.values_list("id", flat=True))

        metric_qs = CampaignMetricRow.objects.filter(campaign_id__in=campaign_ids)
        d_from = request.query_params.get("date_from")
        d_to = request.query_params.get("date_to")
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

        campaign_paginator = DefaultPagination()
        campaign_page = campaign_paginator.paginate_queryset(
            qs_for_list.order_by("name", "id"), request
        )

        per_campaign = []
        campaign_rows = (
            campaign_page
            if campaign_page is not None
            else qs.order_by("name", "id")
        )
        for campaign in campaign_rows:
            row = {
                "id": campaign.id,
                "name": campaign.name,
                "type": campaign.type or "",
                "start_date": campaign.start_date.isoformat()
                if campaign.start_date
                else None,
                "end_date": campaign.end_date.isoformat()
                if campaign.end_date
                else None,
                "status": campaign.status or "live",
                "brief": campaign.brief or "",
                "screenshot": campaign.screenshot or "",
            }
            cid = row["id"]
            sub = metric_qs.filter(campaign_id=cid).aggregate(
                impressions=Coalesce(Sum("impressions"), 0),
                clicks=Coalesce(Sum("clicks"), 0),
                spend=Coalesce(Sum("spend"), Decimal("0")),
            )
            per_campaign.append(
                {
                    **row,
                    "impressions": int(sub["impressions"] or 0),
                    "clicks": int(sub["clicks"] or 0),
                    "spend": _decimal_to_float(sub["spend"] or Decimal("0")),
                }
            )

        daily = [
            {
                "date": row["date"].isoformat(),
                "impressions": int(row["impressions"] or 0),
                "clicks": int(row["clicks"] or 0),
                "spend": _decimal_to_float(row["spend"] or Decimal("0")),
            }
            for row in metric_qs.values("date")
            .annotate(
                impressions=Coalesce(Sum("impressions"), 0),
                clicks=Coalesce(Sum("clicks"), 0),
                spend=Coalesce(Sum("spend"), Decimal("0")),
            )
            .order_by("date")
        ]

        dimension_label = (request.query_params.get("dimension") or "Date").strip()
        all_table_rows = _build_table_rows(
            dimension_label,
            "All campaigns",
            daily,
            [],
            [],
        )
        table_rows, table_meta = _paginate_items(request, all_table_rows)

        clicks_by_type = {
            "DSP": 0,
            "YouTube": 0,
            "Floating": 0,
            "Takeover": 0,
        }
        for row in qs.values("type").annotate(
            clicks=Coalesce(Sum("metric_rows__clicks"), 0)
        ):
            key = row.get("type") or "DSP"
            if key == "Image Takeover":
                key = "Takeover"
            if key not in clicks_by_type:
                clicks_by_type[key] = 0
            clicks_by_type[key] += int(row["clicks"] or 0)

        payload = {
            "totals": {
                "impressions": imp,
                "clicks": clk,
                "spend": _decimal_to_float(spend),
                "ctr": (clk / imp) if imp else 0.0,
            },
            "stats": {
                "campaigns_total": qs.count(),
                "active": qs.filter(status="live").count(),
                "ended": qs.filter(status="ended").count(),
                "clicks_by_type": clicks_by_type,
            },
            "campaigns": per_campaign,
            "daily": daily,
            "table_rows": table_rows,
            **table_meta,
        }
        if campaign_page is not None:
            payload["campaigns_count"] = campaign_paginator.page.paginator.count
            payload["campaigns_next"] = campaign_paginator.get_next_link()
            payload["campaigns_previous"] = campaign_paginator.get_previous_link()
        return Response(payload)
