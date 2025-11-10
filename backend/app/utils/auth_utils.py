"""
Authentication utilities for the food resource application.
Provides decorators and helper functions for user authentication and authorization.
"""

from flask import session, jsonify
from functools import wraps
from app.models.user import User


def login_required(f):
    """
    Decorator to require user authentication.
    Returns 401 if user is not logged in.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({
                "error": "Authentication required",
                "message": "Please log in to access this resource"
            }), 401
        
        # Verify user still exists and is active
        user = User.query.get(session['user_id'])
        if not user or not user.is_active:
            session.clear()
            return jsonify({
                "error": "Invalid session",
                "message": "Please log in again"
            }), 401
        
        return f(*args, **kwargs)
    return decorated_function


def admin_required(f):
    """
    Decorator to require admin authentication.
    Returns 401 if not logged in, 403 if not admin.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({
                "error": "Authentication required",
                "message": "Please log in to access this resource"
            }), 401
        
        user = User.query.get(session['user_id'])
        if not user or not user.is_active:
            session.clear()
            return jsonify({
                "error": "Invalid session",
                "message": "Please log in again"
            }), 401
        
        if not user.is_admin:
            return jsonify({
                "error": "Forbidden",
                "message": "Admin privileges required to access this resource"
            }), 403
        
        return f(*args, **kwargs)
    return decorated_function


def get_current_user():
    """
    Get the currently logged-in user object.
    Returns None if no user is logged in or user is invalid.
    """
    if 'user_id' not in session:
        return None
    
    user = User.query.get(session['user_id'])
    if not user or not user.is_active:
        return None
    
    return user


def is_current_user_admin():
    """
    Check if the current user is an admin.
    Returns False if not logged in or not admin.
    """
    user = get_current_user()
    return user is not None and user.is_admin