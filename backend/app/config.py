import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    # Security
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev_secret_key_change_in_production")
    
    # Session configuration
    SESSION_PERMANENT = True  # Sessions persist across browser restarts
    SESSION_COOKIE_SECURE = False  # Set to True in production with HTTPS
    SESSION_COOKIE_HTTPONLY = True  # Prevents JavaScript access to session cookie
    SESSION_COOKIE_SAMESITE = None  # None for better cross-origin compatibility in development
    SESSION_REFRESH_EACH_REQUEST = True  # Refresh session on each request
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)  # Session expires after 24 hours
    
    # Database
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # CORS - Default to localhost for development
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")
    CORS_SUPPORTS_CREDENTIALS = True  # Required for session cookies with CORS

class DevelopmentConfig(Config):
    DEBUG = True

    # Use absolute path for database location
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'database', 'dev.db')}"

    SESSION_COOKIE_SECURE = False  # HTTP is fine for development
    SESSION_COOKIE_DOMAIN = None  # Don't set domain for localhost
    SESSION_COOKIE_PATH = '/'  # Cookie valid for all paths

class ProductionConfig(Config):
    DEBUG = False
    
    # Use absolute path for production database too
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", 
        f"sqlite:///{os.path.join(BASE_DIR, 'database', 'prod.db')}"
    )
    
    SESSION_COOKIE_SECURE = True  # Require HTTPS in production
    
    # Ensure SECRET_KEY is set in production
    SECRET_KEY = os.environ.get("SECRET_KEY")
    
    # Production should ALWAYS have CORS_ORIGINS set via environment
    if not os.environ.get("CORS_ORIGINS"):
        raise ValueError("CORS_ORIGINS must be set in production!")

config = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig
}