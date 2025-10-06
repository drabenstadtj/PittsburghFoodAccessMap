from flask import Flask
import sqlite3
import os

DB_PATH = 'database/food_access_points.db'
SCHEMA_PATH = 'database/schema.sql'
TEMPLATE_PATH = '../frontend/public'

app = Flask(__name__, template_folder=TEMPLATE_PATH)

# will create database according to schema.sql if it does not already exist
def init_db():
    if not os.path.exists(DB_PATH):
        conn = sqlite3.connect(DB_PATH)
        with open(SCHEMA_PATH, 'r') as f:
            conn.executescript(f.read())
        conn.commit()
        conn.close()
# starts database when app starts
init_db()

# returns connection to database
def connect_db():
    return sqlite3.connect(DB_PATH)

# import routes
from backend.routes import admin, public_map, reporting