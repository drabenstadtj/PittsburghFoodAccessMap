import os
from datetime import timedelta

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    # Security
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev_secret_key_change_in_production")
    
    # Session configuration
    SESSION_COOKIE_SECURE = False  # Set to True in production with HTTPS
    SESSION_COOKIE_HTTPONLY = True  # Prevents JavaScript access to session cookie
    SESSION_COOKIE_SAMESITE = 'Lax'  # CSRF protection
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)  # Session expires after 24 hours
    
    # Database
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # CORS
    CORS_ORIGINS = ["http://localhost:3000"]
    CORS_SUPPORTS_CREDENTIALS = True  # Required for session cookies with CORS

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = (
        os.environ.get("DATABASE_URL")
        or f"sqlite:///{os.path.join(BASE_DIR, './database/dev.db')}"
    )
    SESSION_COOKIE_SECURE = False  # HTTP is fine for development

class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///prod.db")
    SESSION_COOKIE_SECURE = True  # Require HTTPS in production
    
    # IMPORTANT: Set a strong SECRET_KEY environment variable in production!
    # Generate one with: python -c "import secrets; print(secrets.token_hex(32))"
    SECRET_KEY = os.environ.get("SECRET_KEY", Config.SECRET_KEY)

config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig
}