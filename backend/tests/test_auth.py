"""
Pytest tests for authentication endpoints
Run with: pytest test_auth.py -v
"""

import pytest
import requests


class TestHealthCheck:
    """Test health check endpoint"""
    
    def test_health_endpoint(self, base_url, api_client):
        """Test that health endpoint returns 200 OK"""
        response = api_client.get(f"{base_url}/api/health")
        
        assert response.status_code == 200
        assert response.json()["status"] == "ok"


@pytest.mark.auth
class TestAuthCheck:
    """Test auth check endpoint"""
    
    def test_auth_check_not_logged_in(self, base_url, api_client):
        """Test auth check returns false when not logged in"""
        response = api_client.get(f"{base_url}/api/auth/check")
        
        assert response.status_code == 200
        data = response.json()
        assert data["authenticated"] is False
        assert data["is_admin"] is False
    
    def test_auth_check_logged_in(self, base_url, admin_session):
        """Test auth check returns true when logged in"""
        response = admin_session.get(f"{base_url}/api/auth/check")
        
        assert response.status_code == 200
        data = response.json()
        assert data["authenticated"] is True
        assert "user" in data


@pytest.mark.auth
class TestRegistration:
    """Test user registration"""
    
    def test_register_new_user(self, base_url, api_client):
        """Test registering a new user"""
        # Use a unique email to avoid conflicts
        import time
        user_data = {
            "name": "New User",
            "email": f"newuser{int(time.time())}@pytest.com",
            "password": "securepass123",
            "organization": "Test Org"
        }
        
        response = api_client.post(
            f"{base_url}/api/auth/register",
            json=user_data
        )
        
        assert response.status_code == 201
        data = response.json()
        assert "user" in data
        assert data["user"]["email"] == user_data["email"]
        assert data["user"]["name"] == user_data["name"]
    
    def test_register_duplicate_email(self, base_url, api_client, admin_credentials):
        """Test that registering with duplicate email fails"""
        user_data = {
            "name": "Duplicate User",
            "email": admin_credentials["email"],  # Use existing admin email
            "password": "password123"
        }
        
        response = api_client.post(
            f"{base_url}/api/auth/register",
            json=user_data
        )
        
        assert response.status_code == 400
        assert "already registered" in response.json()["error"].lower()
    
    def test_register_missing_fields(self, base_url, api_client):
        """Test that registration fails with missing required fields"""
        incomplete_data = {
            "name": "Test User"
            # Missing email and password
        }
        
        response = api_client.post(
            f"{base_url}/api/auth/register",
            json=incomplete_data
        )
        
        assert response.status_code == 400
        assert "required" in response.json()["error"].lower()
    
    def test_register_invalid_email(self, base_url, api_client):
        """Test that registration fails with invalid email"""
        user_data = {
            "name": "Test User",
            "email": "not-an-email",
            "password": "password123"
        }
        
        response = api_client.post(
            f"{base_url}/api/auth/register",
            json=user_data
        )
        
        assert response.status_code == 400
        assert "email" in response.json()["error"].lower()
    
    def test_register_short_password(self, base_url, api_client):
        """Test that registration fails with password < 8 characters"""
        user_data = {
            "name": "Test User",
            "email": "test@example.com",
            "password": "short"
        }
        
        response = api_client.post(
            f"{base_url}/api/auth/register",
            json=user_data
        )
        
        assert response.status_code == 400
        assert "8 characters" in response.json()["error"].lower()


@pytest.mark.auth
class TestLogin:
    """Test user login"""
    
    def test_login_success(self, base_url, api_client, admin_credentials):
        """Test successful login"""
        response = api_client.post(
            f"{base_url}/api/auth/login",
            json=admin_credentials
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "user" in data
        assert data["user"]["email"] == admin_credentials["email"]
        assert "message" in data
    
    def test_login_invalid_credentials(self, base_url, api_client):
        """Test login with invalid credentials"""
        credentials = {
            "email": "wrong@example.com",
            "password": "wrongpassword"
        }
        
        response = api_client.post(
            f"{base_url}/api/auth/login",
            json=credentials
        )
        
        assert response.status_code == 401
        assert "invalid" in response.json()["error"].lower()
    
    def test_login_missing_fields(self, base_url, api_client):
        """Test login with missing fields"""
        response = api_client.post(
            f"{base_url}/api/auth/login",
            json={"email": "test@example.com"}  # Missing password
        )
        
        assert response.status_code == 400
        assert "required" in response.json()["error"].lower()
    
    def test_login_sets_session_cookie(self, base_url, admin_credentials):
        """Test that login sets a session cookie"""
        session = requests.Session()
        response = session.post(
            f"{base_url}/api/auth/login",
            json=admin_credentials
        )
        
        assert response.status_code == 200
        assert len(session.cookies) > 0  # Session cookie is set


@pytest.mark.auth
class TestLogout:
    """Test user logout"""
    
    def test_logout(self, base_url, admin_session):
        """Test logging out"""
        response = admin_session.post(f"{base_url}/api/auth/logout")
        
        assert response.status_code == 200
        assert "message" in response.json()
    
    def test_auth_after_logout(self, base_url, admin_session):
        """Test that user is not authenticated after logout"""
        # Logout
        admin_session.post(f"{base_url}/api/auth/logout")
        
        # Try to access protected endpoint
        response = admin_session.get(f"{base_url}/api/auth/me")
        
        assert response.status_code == 401


@pytest.mark.auth
class TestProtectedEndpoints:
    """Test protected endpoints require authentication"""
    
    def test_get_current_user_authenticated(self, base_url, admin_session):
        """Test getting current user info when authenticated"""
        response = admin_session.get(f"{base_url}/api/auth/me")
        
        assert response.status_code == 200
        data = response.json()
        assert "email" in data
        assert "name" in data
    
    def test_get_current_user_unauthenticated(self, base_url, api_client):
        """Test getting current user info when not authenticated"""
        response = api_client.get(f"{base_url}/api/auth/me")
        
        assert response.status_code == 401
        assert "required" in response.json()["error"].lower()


@pytest.mark.admin
class TestAdminEndpoints:
    """Test admin-only endpoints"""
    
    def test_get_all_users_as_admin(self, base_url, admin_session):
        """Test that admin can get all users"""
        response = admin_session.get(f"{base_url}/api/users")
        
        assert response.status_code == 200
        users = response.json()
        assert isinstance(users, list)
        assert len(users) > 0
    
    def test_get_all_users_unauthenticated(self, base_url, api_client):
        """Test that unauthenticated users cannot get all users"""
        response = api_client.get(f"{base_url}/api/users")
        
        assert response.status_code == 401
    
    def test_admin_user_has_admin_flag(self, base_url, admin_session):
        """Test that admin user has is_admin=True"""
        response = admin_session.get(f"{base_url}/api/auth/me")
        
        assert response.status_code == 200
        user = response.json()
        assert user["is_admin"] is True


@pytest.mark.auth
class TestSessionValidation:
    """Test session validation"""
    
    def test_session_persists_across_requests(self, base_url, admin_session):
        """Test that session persists across multiple requests"""
        # First request
        response1 = admin_session.get(f"{base_url}/api/auth/me")
        assert response1.status_code == 200
        
        # Second request with same session
        response2 = admin_session.get(f"{base_url}/api/auth/me")
        assert response2.status_code == 200
        
        # Should return same user
        assert response1.json()["id"] == response2.json()["id"]
    
    def test_invalid_session_returns_401(self, base_url):
        """Test that requests with invalid session return 401"""
        session = requests.Session()
        # Add fake session cookie
        session.cookies.set("session", "invalid_session_token")
        
        response = session.get(f"{base_url}/api/auth/me")
        assert response.status_code == 401