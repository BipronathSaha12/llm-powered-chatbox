import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from asgiref.sync import async_to_sync

User = get_user_model()

@pytest.mark.django_db
def test_chat_stream_endpoint():
    user = User.objects.create_user(username='chatuser', email='chat@example.com', password='Password123!')
    client = APIClient()
    
    login_res = client.post('/api/auth/login/', {
        'username': 'chatuser',
        'password': 'Password123!'
    }, format='json')
    assert login_res.status_code == 200
    access_token = login_res.data['access']

    client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
    response = client.post('/api/chat/', {
        'message': 'Hello, who are you?'
    }, format='json')

    assert response.status_code == 200
    
    async def get_chunks():
        chunks = []
        async for chunk in response.streaming_content:
            chunks.append(chunk if isinstance(chunk, str) else chunk.decode('utf-8'))
        return "".join(chunks)

    content = async_to_sync(get_chunks)()
    assert 'event: meta' in content
    assert 'event: delta' in content
    assert 'event: done' in content
