from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.db import connection

def healthz(request):
    return JsonResponse({'status': 'ok'})

def readyz(request):
    status_data = {'database': 'ok'}
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
    except Exception as e:
        status_data['database'] = 'error'
        return JsonResponse(status_data, status=53)
    return JsonResponse(status_data)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('healthz/', healthz, name='healthz'),
    path('readyz/', readyz, name='readyz'),
    path('api/auth/', include('users.urls')),
    path('api/conversations/', include('conversations.urls')),
    path('api/chat/', include('chat.urls')),
]
