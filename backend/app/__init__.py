from flask import Flask, jsonify
from flask_cors import CORS
from .config import config
from .database.db import db, init_db
from app.routes.user_routes import user_bp
from app.routes.food_resource_routes import food_resource_bp

def create_app(config_name="default"):
    app = Flask(__name__)

    # load config 
    app.config.from_object(config[config_name])

    # initialize cors and db
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})
    init_db(app)
    
    # route reg
    app.register_blueprint(user_bp)
    app.register_blueprint(food_resource_bp)
    
    @app.route("/api/health")
    def health_check():
        return jsonify({"status": "ok", "message": "Backend running"})

    return app
