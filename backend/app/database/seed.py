from app import create_app
from app.database.db import db
from app.models.food_resource import FoodResource
from app.models.user import User

# Sample food resources (data is not verified)
FOOD_RESOURCES = [
    {
        "name": "Giant Eagle Market District",
        "resource_type": "grocery",
        "address": "5550 Centre Ave, Pittsburgh, PA 15232",
        "neighborhood": "Shadyside",
        "latitude": 40.4556,
        "longitude": -79.9349,
        "phone": "(412) 661-4000",
        "website": "https://www.gianteagle.com",
        "description": "Full-service grocery store",
        "hours": {
            "monday": "7:00-22:00",
            "tuesday": "7:00-22:00",
            "wednesday": "7:00-22:00",
            "thursday": "7:00-22:00",
            "friday": "7:00-22:00",
            "saturday": "7:00-22:00",
            "sunday": "7:00-22:00"
        }
    },
    {
        "name": "Greater Pittsburgh Community Food Bank",
        "resource_type": "pantry",
        "address": "1 N Linden St, Duquesne, PA 15110",
        "neighborhood": "Duquesne",
        "latitude": 40.3728,
        "longitude": -79.8494,
        "phone": "(412) 460-3663",
        "website": "https://www.pittsburghfoodbank.org",
        "description": "Regional food bank providing food assistance",
        "hours": {
            "monday": "9:00-16:00",
            "tuesday": "9:00-16:00",
            "wednesday": "9:00-16:00",
            "thursday": "9:00-16:00",
            "friday": "9:00-16:00",
            "saturday": "closed",
            "sunday": "closed"
        }
    },
    {
        "name": "Strip District Farmers Market",
        "resource_type": "farmers_market",
        "address": "2300 Smallman St, Pittsburgh, PA 15222",
        "neighborhood": "Strip District",
        "latitude": 40.4537,
        "longitude": -79.9864,
        "phone": "(412) 281-4505",
        "description": "Historic market with fresh produce and specialty foods",
        "hours": {
            "monday": "closed",
            "tuesday": "closed",
            "wednesday": "closed",
            "thursday": "closed",
            "friday": "6:00-18:00",
            "saturday": "6:00-18:00",
            "sunday": "9:00-17:00"
        }
    },
    {
        "name": "East End Cooperative Ministry",
        "resource_type": "pantry",
        "address": "6140 Station St, Pittsburgh, PA 15206",
        "neighborhood": "East Liberty",
        "latitude": 40.4650,
        "longitude": -79.9151,
        "phone": "(412) 361-5549",
        "website": "https://www.eecm.org",
        "description": "Food pantry and community services",
        "hours": {
            "monday": "10:00-14:00",
            "tuesday": "10:00-14:00",
            "wednesday": "10:00-14:00",
            "thursday": "10:00-14:00",
            "friday": "10:00-14:00",
            "saturday": "closed",
            "sunday": "closed"
        }
    },
    {
        "name": "Aldi",
        "resource_type": "grocery",
        "address": "909 S Millvale Ave, Pittsburgh, PA 15209",
        "neighborhood": "Millvale",
        "latitude": 40.4786,
        "longitude": -79.9775,
        "phone": "(855) 955-2534",
        "website": "https://www.aldi.us",
        "description": "Discount grocery store",
        "hours": {
            "monday": "9:00-20:00",
            "tuesday": "9:00-20:00",
            "wednesday": "9:00-20:00",
            "thursday": "9:00-20:00",
            "friday": "9:00-20:00",
            "saturday": "9:00-20:00",
            "sunday": "9:00-19:00"
        }
    }
]

def seed_database():
    # Seed the database with sample data.
    app = create_app("development")
    
    with app.app_context():
        # Clear existing food resources
        print("Clearing existing food resources...")
        FoodResource.query.delete()
        
        # Add sample users if none exist
        if User.query.count() == 0:
            print("Adding sample users...")
            admin = User(name="Admin User", email="admin@example.com")
            test = User(name="Test User", email="test@example.com")
            db.session.add(admin)
            db.session.add(test)
        
        # Add food resources
        print("Adding food resources...")
        for resource_data in FOOD_RESOURCES:
            resource = FoodResource(**resource_data)
            db.session.add(resource)
        
        # Commit all changes
        db.session.commit()
        
        # Print summary
        print(f"\nDatabase seeded successfully!")
        print(f"   - {User.query.count()} users")
        print(f"   - {FoodResource.query.count()} food resources")

if __name__ == "__main__":
    seed_database()