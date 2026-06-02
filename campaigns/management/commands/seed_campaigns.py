from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta
from decimal import Decimal
import random

from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import User
from campaigns.models import Campaign, CampaignAssignment, CampaignMetricRow, UploadBatch


@dataclass(frozen=True)
class SeedCampaign:
    name: str
    description: str
    type: str
    start_date: date
    end_date: date
    status: str
    brief: str
    screenshot: str


PUBLISHERS = [
    "prothomalo.com",
    "bdnews24.com",
    "thedailystar.net",
    "somoynews.tv",
    "cricbuzz.com",
    "youtube.com",
]

DEVICE_TYPES = ["Android", "iOS", "Desktop", "Tablet", "Smart TV"]
CITIES = ["Dhaka", "Chattogram", "Sylhet", "Khulna", "Rajshahi", "Barishal"]
CREATIVES = ["Banner A", "Banner B", "Banner C", "Video 6s", "Video 15s", "Video 30s"]
APPS = ["ABCD Shopping", "ABCD News", "ABCD Video", "ABCD Music", "ABCD Finance", "ABCD Sports"]
AGES = ["18–24", "25–34", "35–44", "45–54", "55+"]
CARRIERS = ["GP", "Robi", "Banglalink", "Teletalk", "WiFi/Other"]


def _d(iso: str) -> date:
    y, m, d = iso.split("-")
    return date(int(y), int(m), int(d))


def _make_seed() -> list[SeedCampaign]:
    return [
        SeedCampaign(
            name="Summer Sale Blast",
            description="Seasonal promo across premium inventory",
            type="DSP",
            start_date=_d("2026-05-01"),
            end_date=_d("2026-05-15"),
            status="live",
            brief="/files/brief-1.pdf",
            screenshot="/images/shot-1.png",
        ),
        SeedCampaign(
            name="Eid Mega Offers",
            description="Video reach for festive shopping season",
            type="YouTube",
            start_date=_d("2026-05-03"),
            end_date=_d("2026-05-25"),
            status="live",
            brief="/files/brief-2.pdf",
            screenshot="/images/shot-2.png",
        ),
        SeedCampaign(
            name="App Install Sprint",
            description="High-intent users with floating units",
            type="Floating",
            start_date=_d("2026-04-20"),
            end_date=_d("2026-05-10"),
            status="paused",
            brief="/files/brief-3.pdf",
            screenshot="/images/shot-3.png",
        ),
        SeedCampaign(
            name="Monsoon Takeover Push",
            description="Homepage takeover for big launch",
            type="Takeover",
            start_date=_d("2026-05-06"),
            end_date=_d("2026-05-20"),
            status="live",
            brief="/files/brief-4.pdf",
            screenshot="/images/shot-4.png",
        ),
        SeedCampaign(
            name="Weekend Flash Deals",
            description="Short burst performance campaign",
            type="DSP",
            start_date=_d("2026-05-08"),
            end_date=_d("2026-05-14"),
            status="live",
            brief="/files/brief-5.pdf",
            screenshot="/images/shot-5.png",
        ),
        SeedCampaign(
            name="Brand Lift: Awareness",
            description="Completed awareness flight",
            type="YouTube",
            start_date=_d("2026-04-01"),
            end_date=_d("2026-04-30"),
            status="ended",
            brief="/files/brief-6.pdf",
            screenshot="/images/shot-6.png",
        ),
        SeedCampaign(
            name="New Store Launch",
            description="Image takeover on top placements",
            type="Image Takeover",
            start_date=_d("2026-05-02"),
            end_date=_d("2026-05-09"),
            status="ended",
            brief="/files/brief-7.pdf",
            screenshot="/images/shot-7.png",
        ),
        SeedCampaign(
            name="Ramadan Recipe Series",
            description="Content-driven video series",
            type="YouTube",
            start_date=_d("2026-03-10"),
            end_date=_d("2026-04-05"),
            status="ended",
            brief="/files/brief-8.pdf",
            screenshot="/images/shot-8.png",
        ),
        SeedCampaign(
            name="Retargeting Always-on",
            description="Always-on retargeting for conversions",
            type="DSP",
            start_date=_d("2026-05-01"),
            end_date=_d("2026-06-01"),
            status="live",
            brief="/files/brief-9.pdf",
            screenshot="/images/shot-9.png",
        ),
        SeedCampaign(
            name="Sports Sponsorship Burst",
            description="Paused mid-flight for creative refresh",
            type="Takeover",
            start_date=_d("2026-04-18"),
            end_date=_d("2026-05-04"),
            status="paused",
            brief="/files/brief-10.pdf",
            screenshot="/images/shot-10.png",
        ),
        SeedCampaign(
            name="Festival Floating Units",
            description="High-viewability floating placements",
            type="Floating",
            start_date=_d("2026-05-04"),
            end_date=_d("2026-05-18"),
            status="live",
            brief="/files/brief-11.pdf",
            screenshot="/images/shot-11.png",
        ),
        SeedCampaign(
            name="YouTube Shorts Test",
            description="Short-form inventory test",
            type="YouTube",
            start_date=_d("2026-05-07"),
            end_date=_d("2026-05-21"),
            status="live",
            brief="/files/brief-12.pdf",
            screenshot="/images/shot-12.png",
        ),
        SeedCampaign(
            name="Cart Abandon Recovery",
            description="Lower funnel re-engagement",
            type="DSP",
            start_date=_d("2026-04-28"),
            end_date=_d("2026-05-12"),
            status="ended",
            brief="/files/brief-13.pdf",
            screenshot="/images/shot-13.png",
        ),
        SeedCampaign(
            name="Homepage Image Takeover",
            description="Premium homepage roadblock",
            type="Image Takeover",
            start_date=_d("2026-05-05"),
            end_date=_d("2026-05-11"),
            status="live",
            brief="/files/brief-14.pdf",
            screenshot="/images/shot-14.png",
        ),
    ]


class Command(BaseCommand):
    help = "Delete all campaign data and seed fresh demo campaigns + metric rows."

    def add_arguments(self, parser):
        parser.add_argument(
            "--days",
            type=int,
            default=21,
            help="How many days of metric rows to seed (default: 21).",
        )
        parser.add_argument(
            "--rows-per-day",
            type=int,
            default=6,
            help="Rows per day per campaign (default: 6).",
        )

    @transaction.atomic
    def handle(self, *args, **opts):
        days: int = int(opts["days"])
        rows_per_day: int = int(opts["rows_per_day"])

        self.stdout.write("Wiping existing campaign data…")
        CampaignMetricRow.objects.all().delete()
        UploadBatch.objects.all().delete()
        CampaignAssignment.objects.all().delete()
        Campaign.objects.all().delete()

        advertiser = User.objects.filter(username="advertiser1").first()

        seed = _make_seed()
        self.stdout.write(f"Creating {len(seed)} campaigns…")

        created: list[Campaign] = []
        for i, s in enumerate(seed, start=1):
            c = Campaign.objects.create(
                name=s.name,
                description=s.description,
                type=s.type,
                start_date=s.start_date,
                end_date=s.end_date,
                status=s.status,
                brief=s.brief,
                screenshot=s.screenshot,
            )
            created.append(c)
            if advertiser and (i % 2 == 0):
                CampaignAssignment.objects.create(campaign=c, user=advertiser)

        self.stdout.write("Seeding metric rows…")
        rng = random.Random(20260508)
        today = date.today()
        start = today - timedelta(days=days - 1)

        bulk: list[CampaignMetricRow] = []
        for c in created:
            for di in range(days):
                d = start + timedelta(days=di)
                base = rng.randint(30_000, 140_000)
                for _ in range(rows_per_day):
                    pub = rng.choice(PUBLISHERS)
                    impressions = int(base * rng.uniform(0.5, 1.2))
                    clicks = int(impressions * rng.uniform(0.002, 0.02))
                    spend = Decimal(str(round(rng.uniform(60, 420), 2)))
                    bulk.append(
                        CampaignMetricRow(
                            campaign=c,
                            date=d,
                            impressions=impressions,
                            clicks=clicks,
                            spend=spend,
                            publisher=pub,
                            domain=pub,
                            app=rng.choice(APPS),
                            creative=rng.choice(CREATIVES),
                            device_type=rng.choice(DEVICE_TYPES),
                            city=rng.choice(CITIES),
                            age=rng.choice(AGES),
                            carrier=rng.choice(CARRIERS),
                        )
                    )

        CampaignMetricRow.objects.bulk_create(bulk, batch_size=10_000)

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. Seeded {len(created)} campaigns and {len(bulk)} metric rows."
            )
        )

