from app import create_app
from dotenv import load_dotenv
import os

load_dotenv()

# Create the app instance
app = create_app(os.environ.get("FLASK_ENV", "production"))