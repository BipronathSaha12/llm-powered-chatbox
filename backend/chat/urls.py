from django.urls import path
from .views import ChatStreamView

urlpatterns = [
    path('', ChatStreamView.as_view(), name='chat_stream'),
]
