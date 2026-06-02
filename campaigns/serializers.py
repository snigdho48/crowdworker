from rest_framework import serializers

from accounts.models import User
from accounts.serializers import UserSerializer

from .models import Campaign, CampaignAssignment, CampaignMetricRow, UploadBatch


class CampaignMetricRowSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignMetricRow
        fields = (
            "id",
            "date",
            "impressions",
            "clicks",
            "spend",
            "publisher",
            "domain",
            "app",
            "creative",
            "device_type",
            "city",
            "age",
            "carrier",
            "batch_id",
            "created_at",
        )
        read_only_fields = fields


class CampaignSerializer(serializers.ModelSerializer):
    assigned_users = serializers.SerializerMethodField()
    impressions = serializers.IntegerField(read_only=True)
    clicks = serializers.IntegerField(read_only=True)
    spend = serializers.FloatField(read_only=True)

    class Meta:
        model = Campaign
        fields = (
            "id",
            "name",
            "description",
            "type",
            "start_date",
            "end_date",
            "status",
            "brief",
            "screenshot",
            "impressions",
            "clicks",
            "spend",
            "created_at",
            "updated_at",
            "assigned_users",
        )
        read_only_fields = ("id", "created_at", "updated_at", "assigned_users")

    def get_assigned_users(self, obj: Campaign):
        qs = User.objects.filter(
            campaign_assignments__campaign=obj,
        ).distinct()
        return UserSerializer(qs, many=True).data


class UploadResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadBatch
        fields = ("id", "filename", "row_count", "created_at")
