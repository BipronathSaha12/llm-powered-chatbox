import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

@pytest.mark.django_db
def test_user_registration():
    client = APIClient()
    response = client.post('/api/auth/register/', {
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'StrongPassword123!',
        'password_confirm': 'StrongPassword123!'
    }, format='json')
    
    assert response.status_code == 201
    assert 'access' in response.data
    assert 'refresh' in response.data
    assert response.data['user']['username'] == 'testuser'

@pytest.mark.django_db
def test_user_login():
    user = User.objects.create_user(username='loginuser', email='login@example.com', password='Password123!')
    client = APIClient()
    response = client.post('/api/auth/login/', {
        'username': 'loginuser',
        'password': 'Password123!'
    }, format='json')

    assert response.status_code == 200
    assert 'access' in response.data
    assert 'refresh' in response.data

@pytest.mark.django_db
def test_me_endpoint():
    user = User.objects.create_user(username='meuser', email='me@example.com', password='Password123!')
    client = APIClient()
    client.force_authenticate(user=user)
    response = client.get('/api/auth/me/')

    assert response.status_code == 200
    assert response.data['username'] == 'meuser'
    assert response.data['email'] == 'me@example.com'
