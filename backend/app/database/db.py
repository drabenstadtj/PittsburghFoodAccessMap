from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Initialize db
def init_db(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()

# Get db session
def get_db_session():
    return db.session

# Close db
def close_db():
    db.session.remove()
