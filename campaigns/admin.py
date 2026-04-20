from django.contrib import admin

from .models import Campaign, CampaignAssignment, CampaignMetricRow, UploadBatch


class CampaignAssignmentInline(admin.TabularInline):
    model = CampaignAssignment
    extra = 0


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at")
    search_fields = ("name",)
    inlines = [CampaignAssignmentInline]


@admin.register(CampaignMetricRow)
class CampaignMetricRowAdmin(admin.ModelAdmin):
    list_display = ("campaign", "date", "impressions", "clicks", "spend", "publisher")
    list_filter = ("campaign",)


@admin.register(UploadBatch)
class UploadBatchAdmin(admin.ModelAdmin):
    list_display = ("campaign", "filename", "row_count", "created_at")
