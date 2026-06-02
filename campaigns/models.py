from django.conf import settings
from django.db import models


class Campaign(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    type = models.CharField(max_length=50, blank=True, default="")
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, blank=True, default="live")
    brief = models.CharField(max_length=512, blank=True, default="")
    screenshot = models.CharField(max_length=512, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.name


class CampaignAssignment(models.Model):
    campaign = models.ForeignKey(
        Campaign, on_delete=models.CASCADE, related_name="assignments"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="campaign_assignments",
    )
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("campaign", "user")


class UploadBatch(models.Model):
    campaign = models.ForeignKey(
        Campaign, on_delete=models.CASCADE, related_name="upload_batches"
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="upload_batches",
    )
    filename = models.CharField(max_length=512, blank=True)
    row_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)


class CampaignMetricRow(models.Model):
    campaign = models.ForeignKey(
        Campaign, on_delete=models.CASCADE, related_name="metric_rows"
    )
    batch = models.ForeignKey(
        UploadBatch,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="metric_rows",
    )
    date = models.DateField()
    impressions = models.PositiveBigIntegerField(default=0)
    clicks = models.PositiveBigIntegerField(default=0)
    spend = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    publisher = models.CharField(max_length=255, blank=True)
    domain = models.CharField(max_length=255, blank=True, default="")
    app = models.CharField(max_length=255, blank=True, default="")
    creative = models.CharField(max_length=255, blank=True, default="")
    device_type = models.CharField(max_length=80, blank=True, default="")
    city = models.CharField(max_length=120, blank=True, default="")
    age = models.CharField(max_length=40, blank=True, default="")
    carrier = models.CharField(max_length=80, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["campaign", "date"]),
        ]
