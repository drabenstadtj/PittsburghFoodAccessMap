from app.database.db import db
from datetime import datetime

class Suggestion(db.Model):
    __tablename__ = 'suggestions'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    resource_type = db.Column(db.String(100), nullable=False)
    
    # Optional fields
    neighborhood = db.Column(db.String(100), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    website = db.Column(db.String(255), nullable=True)
    hours = db.Column(db.Text, nullable=True)
    description = db.Column(db.Text, nullable=True)
    
    # Submitter info (optional)
    submitter_name = db.Column(db.String(100), nullable=True)
    submitter_email = db.Column(db.String(100), nullable=True)
    
    # Admin fields
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    admin_notes = db.Column(db.Text, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'resource_type': self.resource_type,
            'neighborhood': self.neighborhood,
            'phone': self.phone,
            'website': self.website,
            'hours': self.hours,
            'description': self.description,
            'submitter_name': self.submitter_name,
            'submitter_email': self.submitter_email,
            'status': self.status,
            'admin_notes': self.admin_notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<Suggestion {self.id} - {self.name}>'