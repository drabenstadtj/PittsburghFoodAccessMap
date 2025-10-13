from flask import Blueprint, jsonify, request
from app.models.food_resource import FoodResource
from app.database.db import db

food_resource_bp = Blueprint("food_resource_bp", __name__)

def resource_to_geojson(resource):
    # Convert FoodResource object to GeoJSON feature format.
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
    # Support filtering by type, neighborhood, etc.
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
    # Get single resource details.
    resource = FoodResource.query.get(id)
    
    if not resource or not resource.is_active:
        return jsonify({"error": "Resource not found"}), 404
    
    return jsonify(resource.to_dict())

@food_resource_bp.route("/api/food-resources", methods=["POST"])
def create_food_resource():
    # Admin only - create new resource.
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['name', 'resource_type', 'address', 'latitude', 'longitude']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # Create new resource
    try:
        resource = FoodResource(
            name=data['name'],
            resource_type=data['resource_type'],
            address=data['address'],
            neighborhood=data.get('neighborhood'),
            latitude=data['latitude'],
            longitude=data['longitude'],
            hours=data.get('hours'),
            phone=data.get('phone'),
            website=data.get('website'),
            description=data.get('description')
        )
        
        db.session.add(resource)
        db.session.commit()
        
        return jsonify(resource.to_dict()), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@food_resource_bp.route("/api/food-resources/<int:id>", methods=["PUT"])
def update_food_resource(id):
    # Admin only - update resource.
    resource = FoodResource.query.get(id)
    
    if not resource:
        return jsonify({"error": "Resource not found"}), 404
    
    data = request.get_json()
    
    try:
        # Update fields if provided
        if 'name' in data:
            resource.name = data['name']
        if 'resource_type' in data:
            resource.resource_type = data['resource_type']
        if 'address' in data:
            resource.address = data['address']
        if 'neighborhood' in data:
            resource.neighborhood = data['neighborhood']
        if 'latitude' in data:
            resource.latitude = data['latitude']
        if 'longitude' in data:
            resource.longitude = data['longitude']
        if 'hours' in data:
            resource.hours = data['hours']
        if 'phone' in data:
            resource.phone = data['phone']
        if 'website' in data:
            resource.website = data['website']
        if 'description' in data:
            resource.description = data['description']
        if 'is_active' in data:
            resource.is_active = data['is_active']
        
        db.session.commit()
        
        return jsonify(resource.to_dict())
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@food_resource_bp.route("/api/food-resources/<int:id>", methods=["DELETE"])
def delete_food_resource(id):
    # Admin only - soft delete a resource.
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