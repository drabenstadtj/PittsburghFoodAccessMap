from flask import Blueprint, jsonify, request
from app.models.suggestion import Suggestion
from app.models.food_resource import FoodResource
from app.database.db import db
from app.utils.auth_utils import admin_required

suggestion_bp = Blueprint("suggestion_bp", __name__)

@suggestion_bp.route("/api/suggestions", methods=["POST"])
def create_suggestion():
    """
    Submit a new location suggestion.
    Public endpoint - no authentication required.
    """
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['name', 'address', 'resource_type']
    for field in required_fields:
        if not data.get(field) or not data[field].strip():
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    try:
        suggestion = Suggestion(
            name=data['name'].strip(),
            address=data['address'].strip(),
            resource_type=data['resource_type'].strip(),
            neighborhood=data.get('neighborhood', '').strip() or None,
            phone=data.get('phone', '').strip() or None,
            website=data.get('website', '').strip() or None,
            hours=data.get('hours', '').strip() or None,
            description=data.get('description', '').strip() or None,
            submitter_name=data.get('submitter_name', '').strip() or None,
            submitter_email=data.get('submitter_email', '').strip() or None,
            status='pending'
        )
        
        db.session.add(suggestion)
        db.session.commit()
        
        return jsonify({
            "message": "Suggestion submitted successfully",
            "suggestion_id": suggestion.id
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@suggestion_bp.route("/api/suggestions", methods=["GET"])
@admin_required
def get_all_suggestions():
    """
    Get all location suggestions with optional filtering.
    Admin only endpoint.
    """
    status = request.args.get('status')  # pending, approved, rejected
    resource_type = request.args.get('resource_type')
    
    query = Suggestion.query
    
    if status:
        query = query.filter_by(status=status)
    if resource_type:
        query = query.filter_by(resource_type=resource_type)
    
    # Order by most recent first
    suggestions = query.order_by(Suggestion.created_at.desc()).all()
    
    return jsonify({
        "suggestions": [suggestion.to_dict() for suggestion in suggestions],
        "total": len(suggestions)
    })


@suggestion_bp.route("/api/suggestions/<int:id>", methods=["GET"])
@admin_required
def get_suggestion(id):
    """
    Get single suggestion details.
    Admin only endpoint.
    """
    suggestion = Suggestion.query.get(id)
    
    if not suggestion:
        return jsonify({"error": "Suggestion not found"}), 404
    
    return jsonify(suggestion.to_dict())


@suggestion_bp.route("/api/suggestions/<int:id>", methods=["PUT"])
@admin_required
def update_suggestion_status(id):
    """
    Update suggestion status (e.g., mark as approved or rejected).
    Admin only endpoint.
    """
    suggestion = Suggestion.query.get(id)
    
    if not suggestion:
        return jsonify({"error": "Suggestion not found"}), 404
    
    data = request.get_json()
    
    if 'status' not in data:
        return jsonify({"error": "Missing required field: status"}), 400
    
    # Validate status
    valid_statuses = ['pending', 'approved', 'rejected']
    if data['status'] not in valid_statuses:
        return jsonify({"error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"}), 400
    
    try:
        suggestion.status = data['status']
        
        # Optional: add admin notes
        if 'admin_notes' in data:
            suggestion.admin_notes = data['admin_notes'].strip() or None
        
        db.session.commit()
        
        return jsonify(suggestion.to_dict())
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@suggestion_bp.route("/api/suggestions/<int:id>", methods=["DELETE"])
@admin_required
def delete_suggestion(id):
    """
    Delete a suggestion permanently.
    Admin only endpoint.
    """
    suggestion = Suggestion.query.get(id)
    
    if not suggestion:
        return jsonify({"error": "Suggestion not found"}), 404
    
    try:
        db.session.delete(suggestion)
        db.session.commit()
        
        return jsonify({"message": "Suggestion deleted successfully"}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@suggestion_bp.route("/api/suggestions/stats", methods=["GET"])
@admin_required
def get_suggestion_stats():
    """
    Get statistics about suggestions.
    Admin only endpoint.
    """
    try:
        total_suggestions = Suggestion.query.count()
        pending_suggestions = Suggestion.query.filter_by(status='pending').count()
        approved_suggestions = Suggestion.query.filter_by(status='approved').count()
        rejected_suggestions = Suggestion.query.filter_by(status='rejected').count()

        return jsonify({
            "total": total_suggestions,
            "pending": pending_suggestions,
            "approved": approved_suggestions,
            "rejected": rejected_suggestions
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@suggestion_bp.route("/api/suggestions/<int:id>/create-resource", methods=["POST"])
@admin_required
def create_resource_from_suggestion(id):
    """
    Create a food resource from an approved suggestion.
    Admin only endpoint.
    """
    suggestion = Suggestion.query.get(id)

    if not suggestion:
        return jsonify({"error": "Suggestion not found"}), 404

    # Check if resource was already created from this suggestion
    if suggestion.created_resource_id:
        return jsonify({
            "error": f"A resource (ID: {suggestion.created_resource_id}) has already been created from this suggestion"
        }), 400

    # Get additional data from request (latitude, longitude, and any overrides)
    data = request.get_json() or {}

    # Validate required coordinates
    if 'latitude' not in data or 'longitude' not in data:
        return jsonify({"error": "Latitude and longitude are required to create a resource"}), 400

    try:
        # Validate coordinates
        latitude = float(data['latitude'])
        longitude = float(data['longitude'])

        if not (-90 <= latitude <= 90):
            return jsonify({"error": "Latitude must be between -90 and 90"}), 400
        if not (-180 <= longitude <= 180):
            return jsonify({"error": "Longitude must be between -180 and 180"}), 400

        # Create new food resource from suggestion data
        resource = FoodResource(
            name=data.get('name', suggestion.name).strip(),
            resource_type=data.get('resource_type', suggestion.resource_type).strip(),
            address=data.get('address', suggestion.address).strip(),
            latitude=latitude,
            longitude=longitude,
            neighborhood=data.get('neighborhood', suggestion.neighborhood or '').strip() or None,
            phone=data.get('phone', suggestion.phone or '').strip() or None,
            website=data.get('website', suggestion.website or '').strip() or None,
            hours=data.get('hours', suggestion.hours or '').strip() or None,
            description=data.get('description', suggestion.description or '').strip() or None,
            is_active=True
        )

        db.session.add(resource)

        # Flush to get the resource ID without committing
        db.session.flush()

        # Mark suggestion as approved and link to created resource
        suggestion.status = 'approved'
        suggestion.created_resource_id = resource.id
        suggestion.admin_notes = (suggestion.admin_notes or '') + f'\nConverted to resource #{resource.id}'

        db.session.commit()

        return jsonify({
            "message": "Resource created successfully from suggestion",
            "resource": resource.to_dict(),
            "suggestion": suggestion.to_dict()
        }), 201

    except ValueError as e:
        return jsonify({"error": "Invalid latitude or longitude values"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500