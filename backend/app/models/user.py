from app.database.db import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200))
    
    # User roles for admin functionality
    is_admin = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    
    # Track user activity
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Optional profile fields
    organization = db.Column(db.String(200))
    phone = db.Column(db.String(20))
    
    def set_password(self, password):
        #Hash and set the user's password.
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        # Check if provided password matches the hash.
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self, include_email=False):
        # Convert user to dictionary for JSON response.
        data = {
            'id': self.id,
            'name': self.name,
            'is_admin': self.is_admin,
            'organization': self.organization,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
        # Only include email if specifically requested (for privacy)
        if include_email:
            data['email'] = self.email
            data['phone'] = self.phone
        
        return data
    
    def __repr__(self):
        return f"<User {self.name}>"