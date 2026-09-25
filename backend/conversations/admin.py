from django.contrib import admin
from .models import Conversation, Message, UsageRecord

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'title', 'created_at', 'updated_at', 'deleted_at')
    list_filter = ('created_at', 'deleted_at')
    search_fields = ('title', 'user__username', 'id')

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation', 'role', 'short_content', 'input_tokens', 'output_tokens', 'created_at')
    list_filter = ('role', 'created_at')
    search_fields = ('content', 'conversation__id')

    def short_content(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    short_content.short_description = 'Content'

@admin.register(UsageRecord)
class UsageRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'model', 'outcome', 'input_tokens', 'output_tokens', 'latency_ms', 'created_at')
    list_filter = ('model', 'outcome', 'created_at')
    search_fields = ('user__username', 'model', 'outcome')
