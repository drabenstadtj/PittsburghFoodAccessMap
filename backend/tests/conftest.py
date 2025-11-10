"""
Pytest configuration and fixtures for authentication tests
"""

import pytest
import requests
from typing import Dict, Optional

BASE_URL = "http://localhost:5000"

@pytest.fixture(scope="session")
def base_url():
    """Base URL for API endpoints"""
    return BASE_URL

@pytest.fixture(scope="session")
def api_client():
    """Reusable requests session"""
    session = requests.Session()
    yield session
    session.close()

@pytest.fixture(scope="function")
def auth_headers():
    """Standard headers for authenticated requests"""
    return {
        "Content-Type": "application/json"
    }

@pytest.fixture(scope="function")
def sample_user_data():
    """Sample user data for registration tests"""
    return {
        "name": "Test User",
        "email": "testuser@pytest.com",
        "password": "pytest123",
        "organization": "PyTest Org",
        "phone": "412-555-0100"
    }

@pytest.fixture(scope="function")
def admin_credentials():
    """Admin user credentials"""
    return {
        "email": "admin@test.com",
        "password": "password123"
    }

@pytest.fixture(scope="function")
def admin_session(base_url, admin_credentials):
    """
    Authenticated session with admin user
    Creates a new session and logs in as admin
    """
    session = requests.Session()
    
    # Login
    response = session.post(
        f"{base_url}/api/auth/login",
        json=admin_credentials
    )
    
    if response.status_code != 200:
        pytest.skip("Could not login as admin - check if admin user exists")
    
    yield session
    
    # Logout after test
    session.post(f"{base_url}/api/auth/logout")
    session.close()

@pytest.fixture(scope="function")
def sample_food_resource():
    """Sample food resource data for testing"""
    return {
        "name": "PyTest Food Bank",
        "resource_type": "food_bank",
        "address": "123 Test St, Pittsburgh, PA 15213",
        "latitude": 40.4406,
        "longitude": -79.9959,
        "neighborhood": "Oakland",
        "hours": "Mon-Fri 9AM-5PM",
        "phone": "412-555-0199",
        "website": "https://testfoodbank.org",
        "description": "Test food bank for pytest"
    }

@pytest.fixture(scope="function")
def created_resource_id(base_url, admin_session, sample_food_resource):
    """
    Creates a food resource and returns its ID
    Cleans up by deleting it after the test
    """
    response = admin_session.post(
        f"{base_url}/api/food-resources",
        json=sample_food_resource
    )
    
    if response.status_code != 201:
        pytest.skip("Could not create test resource")
    
    resource_id = response.json()["id"]
    
    yield resource_id
    
    # Cleanup: delete the resource
    admin_session.delete(f"{base_url}/api/food-resources/{resource_id}")

@pytest.fixture(autouse=True, scope="session")
def check_server(base_url):
    """
    Check if the Flask server is running before any tests
    This runs automatically before the test session
    """
    try:
        response = requests.get(f"{base_url}/api/health", timeout=2)
        if response.status_code != 200:
            pytest.exit("Server is not responding correctly", returncode=1)
    except requests.exceptions.ConnectionError:
        pytest.exit(
            f"Cannot connect to server at {base_url}. "
            "Make sure Flask is running with: python run.py",
            returncode=1
        )
    except Exception as e:
        pytest.exit(f"Error checking server: {e}", returncode=1)