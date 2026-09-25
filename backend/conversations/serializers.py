from rest_framework import serializers
from .models import Conversation, Message, UsageRecord

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ('id', 'conversation', 'role', 'content', 'input_tokens', 'output_tokens', 'thinking_tokens', 'created_at')
        read_only_fields = ('id', 'created_at')

class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = ('id', 'title', 'created_at', 'updated_at', 'messages')
        read_only_fields = ('id', 'created_at', 'updated_at')

class ConversationListSerializer(serializers.ModelSerializer):
    message_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ('id', 'title', 'created_at', 'updated_at', 'message_count')
        read_only_fields = ('id', 'created_at', 'updated_at', 'message_count')

    def get_message_count(self, obj):
        return obj.messages.count()
