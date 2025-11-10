from app.database.db import db
from datetime import datetime

class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    resource_id = db.Column(db.Integer, db.ForeignKey('food_resource.id'))
    feedback_type = db.Column(db.String(50))  # missing, incorrect, new
    description = db.Column(db.Text, nullable=False)
    reporter_email = db.Column(db.String(120))
    status = db.Column(db.String(20), default='pending')  # pending, reviewed, resolved
    created_at = db.Column(db.DateTime, default=datetime.utcnow)