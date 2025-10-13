from app.database.db import db
from datetime import datetime

class FoodResource(db.Model):
    __tablename__ = 'food_resources'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    resource_type = db.Column(db.String(50), nullable=False)  # grocery, pantry, farmers_market
    address = db.Column(db.String(300), nullable=False)
    neighborhood = db.Column(db.String(100))
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    
    # Simple JSON field for hours
    hours = db.Column(db.JSON)  # {"monday": "9:00-17:00", "tuesday": "9:00-17:00", etc}
    
    phone = db.Column(db.String(20))
    website = db.Column(db.String(200))
    description = db.Column(db.Text)
    
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'resource_type': self.resource_type,
            'address': self.address,
            'neighborhood': self.neighborhood,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'hours': self.hours,
            'phone': self.phone,
            'website': self.website,
            'description': self.description
        }
    
    def __repr__(self):
        return f"<FoodResource {self.name}>"