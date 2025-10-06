from flask import Flask
app = Flask(__name__)

# import routes
from backend.routes import admin, public_map, reporting