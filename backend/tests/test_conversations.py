import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from conversations.models import Conversation

User = get_user_model()

@pytest.mark.django_db
def test_conversation_crud_and_isolation():
    user1 = User.objects.create_user(username='user1', email='u1@example.com', password='Password123!')
    user2 = User.objects.create_user(username='user2', email='u2@example.com', password='Password123!')

    client1 = APIClient()
    client1.force_authenticate(user=user1)

    # 1. Create conversation for User 1
    create_res = client1.post('/api/conversations/', {'title': 'Python Django Chat'}, format='json')
    assert create_res.status_code == 201
    conv_id = create_res.data['id']

    # 2. List conversations for User 1
    list_res = client1.get('/api/conversations/')
    assert list_res.status_code == 200
    assert len(list_res.data) == 1

    # 3. User 2 attempting to access User 1 conversation should yield 404 (Isolation per ADR)
    client2 = APIClient()
    client2.force_authenticate(user=user2)
    get_res_u2 = client2.get(f'/api/conversations/{conv_id}/')
    assert get_res_u2.status_code == 404

    # 4. User 1 soft deletes conversation
    delete_res = client1.delete(f'/api/conversations/{conv_id}/')
    assert delete_res.status_code == 204

    # 5. List after soft delete should be empty
    list_after_delete = client1.get('/api/conversations/')
    assert len(list_after_delete.data) == 0
