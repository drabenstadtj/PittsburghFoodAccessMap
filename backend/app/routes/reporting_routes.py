from flask import Blueprint, jsonify, request
from app.models.report import Report
from app.database.db import db
from app.utils.auth_utils import admin_required
from datetime import datetime

reporting_bp = Blueprint("reporting_bp", __name__)

@reporting_bp.route("/api/reports", methods=["POST"])
def create_report():
    """
    Submit a new report for a food resource.
    Public endpoint - no authentication required.
    """
    data = request.get_json()
    
    # Only message is required
    if not data.get('message') or not data['message'].strip():
        return jsonify({"error": "Missing required field: message"}), 400
    
    try:
        # resource_id is optional - can be None for general reports
        resource_id = data.get('resource_id')
        if resource_id is not None:
            resource_id = int(resource_id)
        
        report = Report(
            resource_id=resource_id,
            message=data['message'].strip(),
            status='pending'
        )
        
        db.session.add(report)
        db.session.commit()
        
        return jsonify({
            "message": "Report submitted successfully",
            "report_id": report.id
        }), 201
    
    except ValueError:
        return jsonify({"error": "Invalid resource_id"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@reporting_bp.route("/api/reports", methods=["GET"])
@admin_required
def get_all_reports():
    """
    Get all reports with optional filtering.
    Admin only endpoint.
    """
    status = request.args.get('status')  # pending, reviewed, resolved
    resource_id = request.args.get('resource_id')
    
    query = Report.query
    
    if status:
        query = query.filter_by(status=status)
    if resource_id:
        try:
            query = query.filter_by(resource_id=int(resource_id))
        except ValueError:
            return jsonify({"error": "Invalid resource_id"}), 400
    
    # Order by most recent first
    reports = query.order_by(Report.created_at.desc()).all()
    
    return jsonify({
        "reports": [report.to_dict() for report in reports],
        "total": len(reports)
    })


@reporting_bp.route("/api/reports/<int:id>", methods=["GET"])
@admin_required
def get_report(id):
    """
    Get single report details.
    Admin only endpoint.
    """
    report = Report.query.get(id)
    
    if not report:
        return jsonify({"error": "Report not found"}), 404
    
    return jsonify(report.to_dict())


@reporting_bp.route("/api/reports/<int:id>", methods=["PUT"])
@admin_required
def update_report_status(id):
    """
    Update report status (e.g., mark as reviewed or resolved).
    Admin only endpoint.
    """
    report = Report.query.get(id)
    
    if not report:
        return jsonify({"error": "Report not found"}), 404
    
    data = request.get_json()
    
    if 'status' not in data:
        return jsonify({"error": "Missing required field: status"}), 400
    
    # Validate status
    valid_statuses = ['pending', 'reviewed', 'resolved']
    if data['status'] not in valid_statuses:
        return jsonify({"error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"}), 400
    
    try:
        report.status = data['status']
        
        # Optional: add admin notes
        if 'admin_notes' in data:
            report.admin_notes = data['admin_notes'].strip() or None
        
        db.session.commit()
        
        return jsonify(report.to_dict())
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@reporting_bp.route("/api/reports/<int:id>", methods=["DELETE"])
@admin_required
def delete_report(id):
    """
    Delete a report permanently.
    Admin only endpoint.
    """
    report = Report.query.get(id)
    
    if not report:
        return jsonify({"error": "Report not found"}), 404
    
    try:
        db.session.delete(report)
        db.session.commit()
        
        return jsonify({"message": "Report deleted successfully"}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@reporting_bp.route("/api/reports/stats", methods=["GET"])
@admin_required
def get_report_stats():
    """
    Get statistics about reports.
    Admin only endpoint.
    """
    try:
        total_reports = Report.query.count()
        pending_reports = Report.query.filter_by(status='pending').count()
        reviewed_reports = Report.query.filter_by(status='reviewed').count()
        resolved_reports = Report.query.filter_by(status='resolved').count()
        
        return jsonify({
            "total": total_reports,
            "pending": pending_reports,
            "reviewed": reviewed_reports,
            "resolved": resolved_reports
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500