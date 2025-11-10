from flask import Blueprint, jsonify, request
from app.models.food_resource import FoodResource
from app.database.db import db
from app.utils.auth_utils import admin_required

food_resource_bp = Blueprint("food_resource_bp", __name__)

def resource_to_geojson(resource):
    """Convert FoodResource object to GeoJSON feature format."""
    return {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [resource.longitude, resource.latitude]  # [lng, lat] for GeoJSON
        },
        "properties": {
            "id": resource.id,
            "name": resource.name,
            "resource_type": resource.resource_type,
            "address": resource.address,
            "neighborhood": resource.neighborhood,
            "hours": resource.hours,
            "phone": resource.phone,
            "website": resource.website,
            "description": resource.description
        }
    }

@food_resource_bp.route("/api/food-resources", methods=["GET"])
def get_food_resources():
    """
    Get all active food resources with optional filtering.
    Public endpoint - no authentication required.
    """
    resource_type = request.args.get('type')
    neighborhood = request.args.get('neighborhood')
    
    query = FoodResource.query.filter_by(is_active=True)
    
    if resource_type:
        query = query.filter_by(resource_type=resource_type)
    if neighborhood:
        query = query.filter_by(neighborhood=neighborhood)
    
    resources = query.all()
    
    # Return GeoJSON format for map compatibility
    return jsonify({
        "type": "FeatureCollection",
        "features": [resource_to_geojson(r) for r in resources]
    })

@food_resource_bp.route("/api/food-resources/<int:id>", methods=["GET"])
def get_food_resource(id):
    """
    Get single resource details.
    Public endpoint - no authentication required.
    """
    resource = FoodResource.query.get(id)
    
    if not resource or not resource.is_active:
        return jsonify({"error": "Resource not found"}), 404
    
    return jsonify(resource.to_dict())

@food_resource_bp.route("/api/food-resources", methods=["POST"])
@admin_required
def create_food_resource():
    """
    Create new food resource.
    Admin only endpoint.
    """
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['name', 'resource_type', 'address', 'latitude', 'longitude']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # Validate coordinates
    try:
        lat = float(data['latitude'])
        lng = float(data['longitude'])
        if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
            return jsonify({"error": "Invalid coordinates"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "Latitude and longitude must be valid numbers"}), 400
    
    # Create new resource
    try:
        resource = FoodResource(
            name=data['name'].strip(),
            resource_type=data['resource_type'].strip(),
            address=data['address'].strip(),
            neighborhood=data.get('neighborhood', '').strip() or None,
            latitude=lat,
            longitude=lng,
            hours=data.get('hours', '').strip() or None,
            phone=data.get('phone', '').strip() or None,
            website=data.get('website', '').strip() or None,
            description=data.get('description', '').strip() or None
        )
        
        db.session.add(resource)
        db.session.commit()
        
        return jsonify(resource.to_dict()), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@food_resource_bp.route("/api/food-resources/<int:id>", methods=["PUT"])
@admin_required
def update_food_resource(id):
    """
    Update existing food resource.
    Admin only endpoint.
    """
    resource = FoodResource.query.get(id)
    
    if not resource:
        return jsonify({"error": "Resource not found"}), 404
    
    data = request.get_json()
    
    try:
        # Update fields if provided
        if 'name' in data:
            resource.name = data['name'].strip()
        if 'resource_type' in data:
            resource.resource_type = data['resource_type'].strip()
        if 'address' in data:
            resource.address = data['address'].strip()
        if 'neighborhood' in data:
            resource.neighborhood = data['neighborhood'].strip() or None
        
        # Validate coordinates if provided
        if 'latitude' in data:
            lat = float(data['latitude'])
            if not (-90 <= lat <= 90):
                return jsonify({"error": "Invalid latitude"}), 400
            resource.latitude = lat
        
        if 'longitude' in data:
            lng = float(data['longitude'])
            if not (-180 <= lng <= 180):
                return jsonify({"error": "Invalid longitude"}), 400
            resource.longitude = lng
        
        if 'hours' in data:
            resource.hours = data['hours'].strip() or None
        if 'phone' in data:
            resource.phone = data['phone'].strip() or None
        if 'website' in data:
            resource.website = data['website'].strip() or None
        if 'description' in data:
            resource.description = data['description'].strip() or None
        if 'is_active' in data:
            resource.is_active = bool(data['is_active'])
        
        db.session.commit()
        
        return jsonify(resource.to_dict())
    
    except ValueError as e:
        return jsonify({"error": "Invalid coordinate values"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@food_resource_bp.route("/api/food-resources/<int:id>", methods=["DELETE"])
@admin_required
def delete_food_resource(id):
    """
    Soft delete a food resource.
    Admin only endpoint.
    """
    resource = FoodResource.query.get(id)
    
    if not resource:
        return jsonify({"error": "Resource not found"}), 404
    
    try:
        # Soft delete: just mark as inactive
        resource.is_active = False
        db.session.commit()
        
        return jsonify({"message": "Resource deleted successfully"}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500