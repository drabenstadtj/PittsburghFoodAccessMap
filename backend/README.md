# Pittsburgh Food Access Map - Backend

Flask backend for the food resource map. 

## Quick Start

```bash
# Setup
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run
python run.py

# Seed test data
python -m app.database.seed
```

Backend runs at `http://localhost:5000`

## What's Working Now

- Basic Flask app with SQLite database  
- User authentication (register/login with sessions)  
- Food resource CRUD operations  
- GeoJSON output for map compatibility  
- Admin vs regular user roles  
- Database seeding with Pittsburgh test data  

## API Endpoints

### Auth
- `POST /api/auth/register` - Register (first user becomes admin)
- `POST /api/auth/login` - Login 
- `GET /api/auth/me` - Check who's logged in

### Food Resources (Main Feature)
- `GET /api/food-resources` - Get all for the map
  - Returns GeoJSON format
  - Filter: `?type=grocery` or `?neighborhood=Oakland`
- `GET /api/food-resources/<id>` - Get single resource
- `POST /api/food-resources` - Add new (needs auth)
- `PUT /api/food-resources/<id>` - Update (needs auth)

### Users (Admin stuff)
- `GET /api/users` - List all users (admin only)
- `PUT /api/users/<id>` - Update profile

## Database Models

**User**: id, name, email, password_hash, is_admin, is_active, organization, phone

**FoodResource**: id, name, resource_type, address, neighborhood, lat/lng, hours (JSON), phone, website, description, is_active

## Current Issues / TODOs

### Immediate Needs
- [ ] No input validation on coordinates (accepts any float val)
- [ ] Hours format not standardized (just storing whatever JSON)
- [ ] Session auth won't work for mobile - need JWT tokens

### Next
- [ ] Feedback/reporting system
- [ ] Bulk import from CSV (or other) for real data
- [ ] Search endpoint (not just filters)
- [ ] Add tests (nothing tested yet)

### Nice to Have
- [ ] Rate limiting
- [ ] Logging system
- [ ] Email verification?

## File Structure

```
backend/
├── run.py                    # Entry point
├── requirements.txt          # Dependencies
└── app/
    ├── __init__.py          # App factory, blueprints registered here
    ├── config.py            # Dev/prod configs
    ├── database/
    │   ├── db.py           # Database setup
    │   └── seed.py         # Test data script
    ├── models/
    │   ├── user.py         # User model with auth
    │   └── food_resource.py # Food resource model
    └── routes/
        ├── user_routes.py   # User/auth endpoints  
        └── food_resource_routes.py # Food CRUD endpoints
```

## Notes for Team

- **Database**: Using SQLite for now. File is `app/database/dev.db` (gitignored)
- **Auth**: Currently using Flask sessions. Frontend needs to handle cookies
- **Passwords**: Hashed with Werkzeug. Never store plain text
- **Soft Deletes**: Resources aren't actually deleted, just marked `is_active=False`
- **First User**: Automatically becomes admin when registering
- **CORS**: Set up for localhost:3000 (React default)

## If You're Working On...

**Frontend Map**: 
- Use `/api/food-resources` endpoint - returns GeoJSON
- Coordinates are [longitude, latitude] per GeoJSON spec

**Admin Dashboard**:
- Check `is_admin` flag from `/api/auth/me`
- All create/update/delete endpoints need authentication

**Mobile App**:
- Session auth won't work - we need to add JWT tokens
- Same endpoints but need to handle auth differently

## Testing Manually

```bash
# Register first user (becomes admin)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Admin","email":"admin@test.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'

# Get food resources
curl http://localhost:5000/api/food-resources
```

## Team Members
- Jack Drabenstadt
- Lucy Guo  
- Gleb Ksianevich
- Cole Swierczek