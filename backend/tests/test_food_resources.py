"""
Pytest tests for food resource endpoints
Run with: pytest test_food_resources.py -v
"""

import pytest


@pytest.mark.public
class TestPublicFoodResources:
    """Test public food resource endpoints"""
    
    def test_get_all_resources(self, base_url, api_client):
        """Test getting all food resources (public endpoint)"""
        response = api_client.get(f"{base_url}/api/food-resources")
        
        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "FeatureCollection"
        assert "features" in data
        assert isinstance(data["features"], list)
    
    def test_get_single_resource(self, base_url, api_client, created_resource_id):
        """Test getting a single food resource"""
        response = api_client.get(
            f"{base_url}/api/food-resources/{created_resource_id}"
        )
        
        assert response.status_code == 200
        resource = response.json()
        assert resource["id"] == created_resource_id
        assert "name" in resource
        assert "address" in resource
    
    def test_get_nonexistent_resource(self, base_url, api_client):
        """Test getting a non-existent resource returns 404"""
        response = api_client.get(f"{base_url}/api/food-resources/99999")
        
        assert response.status_code == 404
    
    def test_filter_by_type(self, base_url, api_client):
        """Test filtering resources by type"""
        response = api_client.get(
            f"{base_url}/api/food-resources",
            params={"type": "food_bank"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # All returned resources should be food banks
        for feature in data["features"]:
            assert feature["properties"]["resource_type"] == "food_bank"
    
    def test_filter_by_neighborhood(self, base_url, api_client):
        """Test filtering resources by neighborhood"""
        response = api_client.get(
            f"{base_url}/api/food-resources",
            params={"neighborhood": "Oakland"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # All returned resources should be in Oakland
        for feature in data["features"]:
            assert feature["properties"]["neighborhood"] == "Oakland"


@pytest.mark.admin
class TestAdminFoodResources:
    """Test admin-only food resource operations"""
    
    def test_create_resource_as_admin(self, base_url, admin_session, sample_food_resource):
        """Test creating a food resource as admin"""
        response = admin_session.post(
            f"{base_url}/api/food-resources",
            json=sample_food_resource
        )
        
        assert response.status_code == 201
        resource = response.json()
        assert resource["name"] == sample_food_resource["name"]
        assert resource["latitude"] == sample_food_resource["latitude"]
        assert resource["longitude"] == sample_food_resource["longitude"]
        
        # Cleanup
        admin_session.delete(f"{base_url}/api/food-resources/{resource['id']}")
    
    def test_create_resource_unauthenticated(self, base_url, api_client, sample_food_resource):
        """Test that creating a resource without auth fails"""
        response = api_client.post(
            f"{base_url}/api/food-resources",
            json=sample_food_resource
        )
        
        assert response.status_code == 401
    
    def test_create_resource_missing_fields(self, base_url, admin_session):
        """Test that creating a resource with missing fields fails"""
        incomplete_resource = {
            "name": "Incomplete Resource"
            # Missing required fields
        }
        
        response = admin_session.post(
            f"{base_url}/api/food-resources",
            json=incomplete_resource
        )
        
        assert response.status_code == 400
        assert "required" in response.json()["error"].lower()
    
    def test_create_resource_invalid_coordinates(self, base_url, admin_session):
        """Test that creating a resource with invalid coordinates fails"""
        invalid_resource = {
            "name": "Invalid Resource",
            "resource_type": "food_bank",
            "address": "123 Test St",
            "latitude": 200,  # Invalid latitude
            "longitude": -79.9959
        }
        
        response = admin_session.post(
            f"{base_url}/api/food-resources",
            json=invalid_resource
        )
        
        assert response.status_code == 400
    
    def test_update_resource_as_admin(self, base_url, admin_session, created_resource_id):
        """Test updating a food resource as admin"""
        update_data = {
            "name": "Updated Food Bank Name",
            "hours": "Mon-Sat 8AM-6PM"
        }
        
        response = admin_session.put(
            f"{base_url}/api/food-resources/{created_resource_id}",
            json=update_data
        )
        
        assert response.status_code == 200
        resource = response.json()
        assert resource["name"] == update_data["name"]
        assert resource["hours"] == update_data["hours"]
    
    def test_update_resource_unauthenticated(self, base_url, api_client, created_resource_id):
        """Test that updating a resource without auth fails"""
        response = api_client.put(
            f"{base_url}/api/food-resources/{created_resource_id}",
            json={"name": "Hacked Name"}
        )
        
        assert response.status_code == 401
    
    def test_update_nonexistent_resource(self, base_url, admin_session):
        """Test updating a non-existent resource"""
        response = admin_session.put(
            f"{base_url}/api/food-resources/99999",
            json={"name": "Updated Name"}
        )
        
        assert response.status_code == 404
    
    def test_delete_resource_as_admin(self, base_url, admin_session, sample_food_resource):
        """Test deleting (soft delete) a food resource as admin"""
        # First create a resource
        create_response = admin_session.post(
            f"{base_url}/api/food-resources",
            json=sample_food_resource
        )
        resource_id = create_response.json()["id"]
        
        # Then delete it
        delete_response = admin_session.delete(
            f"{base_url}/api/food-resources/{resource_id}"
        )
        
        assert delete_response.status_code == 200
        
        # Verify it's not in public list (soft deleted)
        get_response = admin_session.get(
            f"{base_url}/api/food-resources/{resource_id}"
        )
        assert get_response.status_code == 404
    
    def test_delete_resource_unauthenticated(self, base_url, api_client, created_resource_id):
        """Test that deleting a resource without auth fails"""
        response = api_client.delete(
            f"{base_url}/api/food-resources/{created_resource_id}"
        )
        
        assert response.status_code == 401
    
    def test_delete_nonexistent_resource(self, base_url, admin_session):
        """Test deleting a non-existent resource"""
        response = admin_session.delete(
            f"{base_url}/api/food-resources/99999"
        )
        
        assert response.status_code == 404


@pytest.mark.public
class TestGeoJSONFormat:
    """Test GeoJSON format compliance"""
    
    def test_geojson_structure(self, base_url, api_client):
        """Test that resources are returned in valid GeoJSON format"""
        response = api_client.get(f"{base_url}/api/food-resources")
        
        assert response.status_code == 200
        data = response.json()
        
        # Check top-level structure
        assert data["type"] == "FeatureCollection"
        assert "features" in data
        
        # Check each feature
        if len(data["features"]) > 0:
            feature = data["features"][0]
            assert feature["type"] == "Feature"
            assert "geometry" in feature
            assert "properties" in feature
            
            # Check geometry
            assert feature["geometry"]["type"] == "Point"
            assert "coordinates" in feature["geometry"]
            coords = feature["geometry"]["coordinates"]
            assert len(coords) == 2  # [lng, lat]
            
            # Check properties
            props = feature["properties"]
            assert "id" in props
            assert "name" in props
            assert "resource_type" in props