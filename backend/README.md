# Backend API Documentation

## Overview

Flask-based REST API for the Pittsburgh Food Access Map application. Provides endpoints for managing food resources, user authentication, issue reporting, and location suggestions.

**Tech Stack:**
- Flask 3.1.2
- SQLAlchemy 2.0.44 (ORM)
- Flask-Migrate 4.1.0 (Database migrations)
- Flask-CORS 6.0.1 (Cross-origin requests)
- Werkzeug 3.1.3 (Password hashing)
- Gunicorn (Production WSGI server)

## Table of Contents
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Authentication & Authorization](#authentication--authorization)
- [Setup Instructions](#setup-instructions)
- [Configuration](#configuration-variables)
- [Production Deployment](#production-deployment-checklist)

## File Structure

```
backend/
├── app/
│   ├── models/            # Database models
│   │   ├── food_resource.py
│   │   ├── user.py
│   │   ├── report.py
│   │   └── suggestion.py
│   ├── routes/            # API endpoints
│   │   ├── food_resource_routes.py
│   │   ├── user_routes.py
│   │   ├── reporting_routes.py
│   │   └── suggestion_routes.py
│   ├── utils/             # Helper functions
│   │   └── auth_utils.py
│   ├── database/          # DB utilities & seed data
│   │   └── db.py
│   ├── config.py          # Configuration classes
│   └── __init__.py        # App factory
├── tests/                 # Test suite
├── .env                   # Active configuration (gitignored)
├── .env.dev              # Development template
├── .env.prod             # Production template
├── run.py                # Development entry point
├── wsgi.py               # Production entry point
├── Dockerfile            # Container configuration
└── requirements.txt      # Python dependencies
```

## Database Schema

### Tables

#### `food_resources`
Stores information about food access locations (pantries, groceries, farmers markets).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Integer | Primary Key | Unique identifier |
| `name` | String(200) | NOT NULL | Resource name |
| `resource_type` | String(50) | NOT NULL | Type: grocery, pantry, farmers_market |
| `address` | String(300) | NOT NULL | Street address |
| `neighborhood` | String(100) | | Pittsburgh neighborhood |
| `latitude` | Float | NOT NULL | Latitude coordinate |
| `longitude` | Float | NOT NULL | Longitude coordinate |
| `hours` | JSON | | Operating hours by day |
| `phone` | String(20) | | Contact phone number |
| `website` | String(200) | | Website URL |
| `description` | Text | | Additional details |
| `is_active` | Boolean | Default: True | Soft delete flag |
| `created_at` | DateTime | Default: now | Creation timestamp |

**Relationships:**
- One-to-many with `reports`

#### `users`
Stores user accounts for admin authentication.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Integer | Primary Key | Unique identifier |
| `name` | String(80) | NOT NULL | User's full name |
| `email` | String(120) | UNIQUE, NOT NULL | Login email |
| `password_hash` | String(200) | | Hashed password (Werkzeug) |
| `is_admin` | Boolean | Default: False | Admin privileges flag |
| `is_active` | Boolean | Default: True | Account active status |
| `created_at` | DateTime | Default: now | Account creation date |
| `last_login` | DateTime | | Last login timestamp |
| `organization` | String(200) | | User's organization |
| `phone` | String(20) | | Contact number |

**Notes:**
- First registered user automatically becomes admin
- Passwords hashed using Werkzeug's `generate_password_hash`
- Email stored in lowercase

#### `reports`
Issue reports submitted by public users about resources.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Integer | Primary Key | Unique identifier |
| `resource_id` | Integer | Foreign Key | Reference to food_resources (nullable) |
| `message` | Text | NOT NULL | Report description |
| `status` | String(20) | Default: pending | pending, reviewed, resolved |
| `admin_notes` | Text | | Admin response notes |
| `created_at` | DateTime | Default: now | Submission timestamp |
| `updated_at` | DateTime | Auto-update | Last modification time |

**Relationships:**
- Many-to-one with `food_resources`

#### `suggestions`
New location suggestions submitted by the public.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Integer | Primary Key | Unique identifier |
| `name` | String(255) | NOT NULL | Suggested location name |
| `address` | String(255) | NOT NULL | Location address |
| `resource_type` | String(100) | NOT NULL | Type of resource |
| `neighborhood` | String(100) | | Pittsburgh neighborhood |
| `phone` | String(20) | | Contact number |
| `website` | String(255) | | Website URL |
| `hours` | Text | | Operating hours |
| `description` | Text | | Additional information |
| `submitter_name` | String(100) | | Submitter's name (optional) |
| `submitter_email` | String(100) | | Submitter's email (optional) |
| `status` | String(20) | Default: pending | pending, approved, rejected |
| `admin_notes` | Text | | Admin review notes |
| `created_at` | DateTime | Default: now | Submission timestamp |
| `updated_at` | DateTime | Auto-update | Last modification time |

## API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "organization": "Food Bank",  // optional
  "phone": "412-555-0100"       // optional
}
```
**Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "is_admin": true
  }
}
```
**Notes:** First user automatically becomes admin

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response:** `200 OK` + Session cookie
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "is_admin": true
  }
}
```

#### Logout
```http
POST /api/auth/logout
```
**Response:** `200 OK`
**Authentication:** Required

#### Check Authentication Status
```http
GET /api/auth/check
```
**Response:** `200 OK`
```json
{
  "authenticated": true,
  "is_admin": true,
  "user": { "id": 1, "name": "John Doe", "is_admin": true }
}
```

#### Get Current User
```http
GET /api/auth/me
```
**Response:** `200 OK`
**Authentication:** Required

### User Management Endpoints

#### List All Users
```http
GET /api/users
```
**Response:** `200 OK`
**Authentication:** Admin only

#### Get User by ID
```http
GET /api/users/{id}
```
**Response:** `200 OK`
**Authentication:** Required (own profile or admin)

#### Update User
```http
PUT /api/users/{id}
Content-Type: application/json

{
  "name": "Jane Doe",
  "organization": "New Org",
  "email": "jane@example.com",
  "password": "newpassword",  // optional
  "is_admin": true            // admin only
}
```
**Response:** `200 OK`
**Authentication:** Required (own profile or admin)

#### Deactivate User
```http
DELETE /api/users/{id}
```
**Response:** `200 OK`
**Authentication:** Admin only
**Note:** Soft delete - sets `is_active` to False

### Food Resource Endpoints

#### Get All Resources
```http
GET /api/food-resources?type=pantry&neighborhood=Shadyside
```
**Response:** `200 OK` (GeoJSON FeatureCollection)
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-79.9959, 40.4406]
      },
      "properties": {
        "id": 1,
        "name": "Community Food Pantry",
        "resource_type": "pantry",
        "address": "123 Main St",
        "neighborhood": "Shadyside",
        "hours": { "monday": "9:00-17:00" },
        "phone": "412-555-0100",
        "website": "https://example.com",
        "description": "Serves local community"
      }
    }
  ]
}
```
**Query Parameters:**
- `type` - Filter by resource_type
- `neighborhood` - Filter by neighborhood

**Authentication:** Public

#### Get Single Resource
```http
GET /api/food-resources/{id}
```
**Response:** `200 OK`
**Authentication:** Public

#### Create Resource
```http
POST /api/food-resources
Content-Type: application/json

{
  "name": "New Food Pantry",
  "resource_type": "pantry",
  "address": "456 Oak St",
  "latitude": 40.4406,
  "longitude": -79.9959,
  "neighborhood": "Oakland",
  "hours": { "monday": "9:00-17:00" },
  "phone": "412-555-0200",
  "website": "https://example.org",
  "description": "Community pantry"
}
```
**Response:** `201 Created`
**Authentication:** Admin only

#### Update Resource
```http
PUT /api/food-resources/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "hours": { "monday": "10:00-18:00" },
  "is_active": true
}
```
**Response:** `200 OK`
**Authentication:** Admin only

#### Delete Resource
```http
DELETE /api/food-resources/{id}
```
**Response:** `200 OK`
**Authentication:** Admin only
**Note:** Soft delete - sets `is_active` to False

### Report Endpoints

#### Submit Report
```http
POST /api/reports
Content-Type: application/json

{
  "resource_id": 1,  // optional
  "message": "Hours are incorrect"
}
```
**Response:** `201 Created`
**Authentication:** Public

#### Get All Reports
```http
GET /api/reports?status=pending&resource_id=1
```
**Response:** `200 OK`
```json
{
  "reports": [
    {
      "id": 1,
      "resource_id": 1,
      "resource_name": "Community Food Pantry",
      "message": "Hours are incorrect",
      "status": "pending",
      "admin_notes": null,
      "created_at": "2025-01-15T10:30:00",
      "updated_at": "2025-01-15T10:30:00"
    }
  ],
  "total": 1
}
```
**Query Parameters:**
- `status` - Filter by status (pending, reviewed, resolved)
- `resource_id` - Filter by resource

**Authentication:** Admin only

#### Update Report Status
```http
PUT /api/reports/{id}
Content-Type: application/json

{
  "status": "resolved",
  "admin_notes": "Hours have been updated"
}
```
**Response:** `200 OK`
**Authentication:** Admin only

#### Delete Report
```http
DELETE /api/reports/{id}
```
**Response:** `200 OK`
**Authentication:** Admin only
**Note:** Hard delete

#### Get Report Statistics
```http
GET /api/reports/stats
```
**Response:** `200 OK`
```json
{
  "total": 15,
  "pending": 5,
  "reviewed": 3,
  "resolved": 7
}
```
**Authentication:** Admin only

### Suggestion Endpoints

#### Submit Suggestion
```http
POST /api/suggestions
Content-Type: application/json

{
  "name": "New Community Garden",
  "address": "789 Elm St",
  "resource_type": "community_garden",
  "neighborhood": "Lawrenceville",
  "phone": "412-555-0300",
  "website": "https://garden.org",
  "hours": "Dawn to dusk",
  "description": "Open to all residents",
  "submitter_name": "Jane Smith",    // optional
  "submitter_email": "jane@email.com" // optional
}
```
**Response:** `201 Created`
**Authentication:** Public

#### Get All Suggestions
```http
GET /api/suggestions?status=pending&resource_type=pantry
```
**Response:** `200 OK`
**Query Parameters:**
- `status` - Filter by status (pending, approved, rejected)
- `resource_type` - Filter by resource type

**Authentication:** Admin only

#### Update Suggestion Status
```http
PUT /api/suggestions/{id}
Content-Type: application/json

{
  "status": "approved",
  "admin_notes": "Added to main database"
}
```
**Response:** `200 OK`
**Authentication:** Admin only

#### Delete Suggestion
```http
DELETE /api/suggestions/{id}
```
**Response:** `200 OK`
**Authentication:** Admin only
**Note:** Hard delete

#### Get Suggestion Statistics
```http
GET /api/suggestions/stats
```
**Response:** `200 OK`
```json
{
  "total": 20,
  "pending": 8,
  "approved": 10,
  "rejected": 2
}
```
**Authentication:** Admin only

## Authentication & Authorization

### Session-Based Authentication
The API uses Flask sessions with HTTP-only cookies for authentication.

**Session Configuration:**
- Lifetime: 24 hours (configurable via `PERMANENT_SESSION_LIFETIME`)
- Cookie attributes: `HttpOnly`, `SameSite=Lax`
- Secure flag: Enabled in production (HTTPS only)

**Client Requirements:**
```javascript
fetch('/api/auth/login', {
  method: 'POST',
  credentials: 'include',  // Required for cookies
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
```

### Authorization Decorators
- `@login_required` - Requires authenticated user
- `@admin_required` - Requires authenticated admin user

### Endpoint Access Levels
| Endpoint Category | Public | Authenticated | Admin Only |
|-------------------|--------|---------------|------------|
| Food Resources (GET) | ✓ | | |
| Food Resources (POST/PUT/DELETE) | | | ✓ |
| Reports (POST) | ✓ | | |
| Reports (GET/PUT/DELETE) | | | ✓ |
| Suggestions (POST) | ✓ | | |
| Suggestions (GET/PUT/DELETE) | | | ✓ |
| Auth (register/login/logout) | ✓ | | |
| Auth (check/me) | | ✓ | |
| Users | | | ✓ |

## Environment Files

### .env (Active Configuration)
This file contains your actual configuration and should never be committed to git. Copy from either .env.dev or .env.prod and modify as needed.

### .env.dev (Development Template)
Template for local development. Contains safe defaults for running the app locally.

### .env.prod (Production Template)
Template for production deployment. Requires secure values before use.

## Configuration Variables

### SECRET_KEY
Flask secret key for session management and security features.
- Development: Can use a simple string
- Production: Must be a cryptographically secure random string

### DATABASE_URL
SQLAlchemy database connection string.
- Development: sqlite:///dev.db
- Production: sqlite:///prod.db

### FLASK_ENV
Determines which configuration class to load.
- Options: development, production
- Default: development

### CORS_ORIGINS
Comma-separated list of allowed origins for CORS.
- Development: http://localhost:3000
- Production: https://yourdomain.com,https://www.yourdomain.com

## Setup Instructions

### Development Setup

1. Copy the development template:
   ```bash
   cp .env.dev .env
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the development server:
   ```bash
   python run.py
   ```

The application will be available at http://localhost:5000

### Production Setup (Docker)

1. Copy the production template:
   ```bash
   cp .env.prod .env
   ```

2. Generate a secure SECRET_KEY:
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```

3. Edit .env and update the following:
   - Replace SECRET_KEY with the generated value
   - Update CORS_ORIGINS with your actual domain(s)

4. Build the Docker container:
   ```bash
   docker build -t backend:latest .
   ```

5. Run the container:
   ```bash
   docker run -d -p 5000:5000 --env-file .env backend:latest
   ```

The application will be available at http://localhost:5000

## Docker Configuration

### Dockerfile Details

The Dockerfile uses a multi-stage approach:
- Base image: Python 3.11 slim
- Working directory: /app
- Exposed port: 5000
- WSGI server: Gunicorn with 4 workers
- Timeout: 120 seconds

### Gunicorn Settings

The production container runs with the following Gunicorn configuration:
- Workers: 4
- Bind address: 0.0.0.0:5000
- Timeout: 120 seconds
- Entry point: wsgi:app

## Running Different Environments

### Development Mode
Uses Flask's built-in development server:
```bash
python run.py
```

### Production Mode
Uses Gunicorn WSGI server (via Docker):
```bash
docker-compose up
```

## Database Management

### Location
- Development: backend/database/dev.db
- Production: backend/database/prod.db (mounted as Docker volume)

### Initialization
The database is automatically initialized on first run. The database directory is created with proper permissions in the Docker container.

### Persistence
In production, mount the database directory as a volume to persist data:
```bash
docker run -v $(pwd)/database:/app/database backend:latest
```

## Security Considerations

### Required for Production
1. Generate a strong SECRET_KEY (minimum 32 characters)
2. Use HTTPS in production (SESSION_COOKIE_SECURE is enabled)
3. Update CORS_ORIGINS to match your frontend domain
4. Never commit .env file to version control
5. Regularly update dependencies for security patches

## Troubleshooting

### Port Already in Use
If port 5000 is already in use, change the port mapping:
```bash
docker run -p 8000:5000 backend:latest
```

### Database Permission Errors
Ensure the database directory has proper permissions:
```bash
chmod 755 backend/database
```

### CORS Errors
Verify CORS_ORIGINS includes your frontend URL and has no trailing slashes:
```bash
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Import Errors
Ensure all dependencies are installed:
```bash
pip install -r requirements.txt
```

## Testing

The backend includes a test suite using pytest.

### Running Tests
```bash
# Install test dependencies (included in requirements.txt)
pip install -r requirements.txt

# Run all tests
pytest

# Run with coverage report
pytest --cov=app --cov-report=html
```

### Test Structure
Tests are located in the `tests/` directory and organized by feature area.

## Monitoring

### View Logs
Development:
```bash
tail -f logs/app.log
```

Docker:
```bash
docker logs -f container_name
```

### Health Checks
The Dockerfile includes a health check that pings /api/health every 30 seconds.

## Upgrading

### Update Dependencies
1. Update requirements.txt
2. Rebuild the container:
   ```bash
   docker-compose up --build
   ```

## Production Deployment Checklist

Before deploying to production:
- Copy .env.prod to .env
- Generate and set strong SECRET_KEY
- Update CORS_ORIGINS with production domain
- Set FLASK_ENV=production
- Verify DATABASE_URL points to prod.db
- Test all endpoints locally
- Set up HTTPS/TLS certificates
- Configure reverse proxy (Nginx/Caddy)
- Set up database backups
- Configure monitoring and logging
- Review security headers
- Test session management and authentication
