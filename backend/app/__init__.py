from flask import Flask, jsonify
from flask_cors import CORS
from .config import config
from .database.db import db, init_db
from app.routes.user_routes import user_bp
from app.routes.food_resource_routes import food_resource_bp
from app.routes.reporting_routes import reporting_bp
from app.models.report import Report  
from app.models.food_resource import FoodResource
from app.routes.suggestion_routes import suggestion_bp

def create_app(config_name="default"):
    app = Flask(__name__)

    # Load config 
    app.config.from_object(config[config_name])

    # Initialize CORS with credentials support for session cookies
    CORS(app, 
         resources={r"/api/*": {
             "origins": app.config["CORS_ORIGINS"],
             "supports_credentials": True,
             "allow_headers": ["Content-Type", "Authorization"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
         }})
    
    # Initialize database
    init_db(app)
    
    # Register blueprints
    app.register_blueprint(user_bp)
    app.register_blueprint(food_resource_bp)
    app.register_blueprint(reporting_bp)
    app.register_blueprint(suggestion_bp)
    
    # Health check endpoint
    @app.route("/api/health")
    def health_check():
        return jsonify({
            "status": "ok", 
            "message": "Backend running"
        })

    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Endpoint not found"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "Internal server error"}), 500

    return app