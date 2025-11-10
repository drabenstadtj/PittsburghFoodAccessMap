from flask import Blueprint, jsonify, request, session
from app.models.user import User
from app.database.db import db
from datetime import datetime
from app.utils.auth_utils import login_required, admin_required, get_current_user

user_bp = Blueprint("user_bp", __name__)

@user_bp.route("/api/auth/register", methods=["POST"])
def register():
    """Register a new user."""
    data = request.get_json()
    
    # Validate required fields
    if not data.get('name') or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Name, email, and password are required"}), 400
    
    # Validate email format
    email = data['email'].strip().lower()
    if '@' not in email:
        return jsonify({"error": "Invalid email format"}), 400
    
    # Validate password strength
    password = data['password']
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400
    
    # Check if email already exists
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400
    
    try:
        user = User(
            name=data['name'].strip(),
            email=email,
            organization=data.get('organization', '').strip() or None,
            phone=data.get('phone', '').strip() or None
        )
        user.set_password(password)
        
        # First user becomes admin
        if User.query.count() == 0:
            user.is_admin = True
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            "message": "User registered successfully",
            "user": user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Registration failed: {str(e)}"}), 500

@user_bp.route("/api/auth/login", methods=["POST"])
def login():
    """Login user and create session."""
    data = request.get_json()
    
    if not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email and password required"}), 400
    
    email = data['email'].strip().lower()
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({"error": "Invalid email or password"}), 401
    
    if not user.is_active:
        return jsonify({"error": "Account is deactivated"}), 403
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    # Create session
    session.permanent = True  # Use PERMANENT_SESSION_LIFETIME from config
    session['user_id'] = user.id
    session['is_admin'] = user.is_admin
    session['email'] = user.email
    
    return jsonify({
        "message": "Login successful",
        "user": user.to_dict(include_email=True)
    })

@user_bp.route("/api/auth/logout", methods=["POST"])
def logout():
    """Logout user and clear session."""
    session.clear()
    return jsonify({"message": "Logged out successfully"})

@user_bp.route("/api/auth/me", methods=["GET"])
@login_required
def get_current_user_info():
    """Get current logged-in user info."""
    user = get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify(user.to_dict(include_email=True))

@user_bp.route("/api/auth/check", methods=["GET"])
def check_auth():
    """Check if user is authenticated and return basic info."""
    user = get_current_user()
    
    if not user:
        return jsonify({
            "authenticated": False,
            "is_admin": False
        })
    
    return jsonify({
        "authenticated": True,
        "is_admin": user.is_admin,
        "user": user.to_dict()
    })

@user_bp.route("/api/users", methods=["GET"])
@admin_required
def get_users():
    """Get all users (admin only)."""
    users = User.query.all()
    return jsonify([u.to_dict(include_email=True) for u in users])

@user_bp.route("/api/users/<int:id>", methods=["GET"])
@login_required
def get_user(id):
    """Get specific user by ID."""
    user = User.query.get(id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    current_user = get_current_user()
    # Only admin or the user themselves can see email
    include_email = current_user.is_admin or current_user.id == id
    
    return jsonify(user.to_dict(include_email=include_email))

@user_bp.route("/api/users/<int:id>", methods=["PUT"])
@login_required
def update_user(id):
    """Update user profile."""
    current_user = get_current_user()
    
    # Users can only update their own profile unless admin
    if current_user.id != id and not current_user.is_admin:
        return jsonify({"error": "Unauthorized"}), 403
    
    user = User.query.get(id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()
    
    try:
        # Update allowed fields
        if 'name' in data:
            user.name = data['name'].strip()
        if 'organization' in data:
            user.organization = data['organization'].strip() or None
        if 'phone' in data:
            user.phone = data['phone'].strip() or None
        
        # Only allow email update if not taken
        if 'email' in data and data['email'] != user.email:
            new_email = data['email'].strip().lower()
            if User.query.filter_by(email=new_email).first():
                return jsonify({"error": "Email already in use"}), 400
            user.email = new_email
        
        # Only admin can change admin status
        if 'is_admin' in data and current_user.is_admin:
            # Prevent removing last admin
            if user.is_admin and not data['is_admin']:
                admin_count = User.query.filter_by(is_admin=True, is_active=True).count()
                if admin_count <= 1:
                    return jsonify({"error": "Cannot remove the last admin"}), 400
            user.is_admin = data['is_admin']
        
        # Only admin can deactivate accounts
        if 'is_active' in data and current_user.is_admin:
            user.is_active = data['is_active']
        
        # Update password if provided
        if 'password' in data:
            if len(data['password']) < 8:
                return jsonify({"error": "Password must be at least 8 characters"}), 400
            user.set_password(data['password'])
        
        db.session.commit()
        
        return jsonify({
            "message": "User updated successfully",
            "user": user.to_dict(include_email=True)
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@user_bp.route("/api/users/<int:id>", methods=["DELETE"])
@admin_required
def delete_user(id):
    """Soft delete user (admin only)."""
    user = User.query.get(id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Don't allow deleting the last admin
    if user.is_admin:
        admin_count = User.query.filter_by(is_admin=True, is_active=True).count()
        if admin_count <= 1:
            return jsonify({"error": "Cannot delete the last admin"}), 400
    
    try:
        user.is_active = False
        db.session.commit()
        
        return jsonify({"message": "User deactivated successfully"}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500