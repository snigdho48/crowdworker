from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from campaigns.models import Campaign, CampaignAssignment, CampaignMetricRow

User = get_user_model()


class Command(BaseCommand):
    help = "Create default users and dummy campaign metrics data."

    def add_arguments(self, parser):
        parser.add_argument(
            "--days",
            type=int,
            default=14,
            help="Number of days of metrics to generate per campaign (default: 14).",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        days = max(1, int(options["days"]))

        admin_user, admin_created = User.objects.get_or_create(
            username="admin",
            defaults={
                "role": User.Role.ADMIN,
                "is_staff": True,
                "is_superuser": True,
                "email": "admin@example.com",
            },
        )
        admin_user.role = User.Role.ADMIN
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.is_active = True
        admin_user.email = admin_user.email or "admin@example.com"
        admin_user.set_password("admin123")
        admin_user.save()

        advertiser_user, advertiser_created = User.objects.get_or_create(
            username="advertiser1",
            defaults={
                "role": User.Role.ADVERTISER,
                "email": "advertiser1@example.com",
                "is_active": True,
            },
        )
        advertiser_user.role = User.Role.ADVERTISER
        advertiser_user.is_staff = False
        advertiser_user.is_superuser = False
        advertiser_user.is_active = True
        advertiser_user.email = advertiser_user.email or "advertiser1@example.com"
        advertiser_user.set_password("ad123")
        advertiser_user.save()

        campaign_names = ("Spring Launch", "Retention Boost")
        campaigns = []
        for campaign_name in campaign_names:
            campaign, _ = Campaign.objects.get_or_create(
                name=campaign_name,
                defaults={"description": f"Seeded campaign: {campaign_name}"},
            )
            campaigns.append(campaign)
            CampaignAssignment.objects.get_or_create(
                campaign=campaign, user=advertiser_user
            )

        seeded_rows = 0
        start_date = date.today() - timedelta(days=days - 1)
        publishers = ("Google", "Meta", "TikTok")

        for campaign_index, campaign in enumerate(campaigns):
            for day_offset in range(days):
                row_date = start_date + timedelta(days=day_offset)
                for pub_index, publisher in enumerate(publishers):
                    impressions = (
                        9000
                        + (campaign_index * 1200)
                        + (day_offset * 250)
                        + (pub_index * 180)
                    )
                    clicks = max(10, int(impressions * (0.015 + pub_index * 0.0012)))
                    spend = (
                        Decimal(clicks) * Decimal("0.65")
                        + Decimal(day_offset) * Decimal("0.8")
                        + Decimal(campaign_index + 1) * Decimal("6.5")
                    ).quantize(Decimal("0.01"))

                    _, created = CampaignMetricRow.objects.get_or_create(
                        campaign=campaign,
                        date=row_date,
                        publisher=publisher,
                        defaults={
                            "impressions": impressions,
                            "clicks": clicks,
                            "spend": spend,
                        },
                    )
                    if created:
                        seeded_rows += 1

        self.stdout.write(
            self.style.SUCCESS(
                "Seed complete. "
                f"admin={'created' if admin_created else 'updated'}, "
                f"advertiser1={'created' if advertiser_created else 'updated'}, "
                f"campaigns={len(campaigns)}, new_metric_rows={seeded_rows}."
            )
        )
