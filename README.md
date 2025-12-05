# Pittsburgh Food Access Map

A web application that helps Pittsburgh residents locate food resources including grocery stores, food pantries, farmers markets, and other food access points. The application features an interactive map, filtering capabilities, and an admin dashboard for managing resources and community feedback.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Database](#database)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)

## Overview

The Pittsburgh Food Access Map is a full-stack web application designed to improve food access awareness in Pittsburgh. It consists of:

- **Frontend**: React-based single-page application with interactive mapping
- **Backend**: Flask REST API with SQLAlchemy ORM
- **Database**: SQLite (development) with support for PostgreSQL (production)

## Features

### Public Features
- **Interactive Map**: Leaflet-based map displaying food resources across Pittsburgh
- **List View**: Alternative view showing resources in a searchable list format
- **Filtering**: Filter resources by type, distance, and availability
- **Search**: Search resources by name, address, or neighborhood
- **User Location**: Geolocation support to find nearby resources
- **Resource Details**: Detailed information including hours, contact info, and directions
- **Issue Reporting**: Users can report issues with resources (incorrect info, closed locations)
- **Resource Suggestions**: Community members can suggest new resources to add

### Admin Features
- **Admin Dashboard**: Overview of system statistics
- **Reports Management**: Review and respond to user-reported issues
- **Suggestions Management**: Approve or reject community-submitted resources
- **Resource Management**: CRUD operations for food resources
- **User Authentication**: Secure admin login with session management

### Responsive Design
- Mobile-optimized interface with bottom navigation
- Desktop layout with side panels
- Touch-friendly controls and gestures

## Project Structure

```
PittsburghFoodAccessMap/
├── frontend/                  # React frontend application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── contexts/         # React contexts (AuthContext)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components
│   │   │   └── admin/        # Admin dashboard pages
│   │   ├── services/         # API service layer
│   │   ├── styles/           # CSS modules
│   │   ├── utils/            # Utility functions
│   │   ├── constants/        # App constants and configurations
│   │   ├── App.js            # Main app router
│   │   ├── MainApp.jsx       # Primary public-facing application
│   │   └── index.js          # React entry point
│   └── package.json          # Frontend dependencies
│
├── backend/                  # Flask backend application
│   ├── app/
│   │   ├── database/         # Database utilities and intake scripts
│   │   │   ├── db.py         # SQLAlchemy initialization
│   │   │   ├── intake_*.py   # Data import scripts
│   │   │   └── seed.py       # Database seeding
│   │   ├── models/           # SQLAlchemy models
│   │   │   ├── food_resource.py
│   │   │   ├── user.py
│   │   │   ├── report.py
│   │   │   ├── suggestion.py
│   │   │   └── feedback.py
│   │   ├── routes/           # API route blueprints
│   │   │   ├── food_resource_routes.py
│   │   │   ├── user_routes.py
│   │   │   ├── reporting_routes.py
│   │   │   └── suggestion_routes.py
│   │   ├── utils/            # Utility functions
│   │   ├── __init__.py       # Flask app factory
│   │   └── config.py         # Application configuration
│   ├── tests/                # Backend tests
│   ├── data/                 # Data files for import
│   ├── run.py                # Application entry point
│   ├── requirements.txt      # Python dependencies
│   └── pytest.ini            # Pytest configuration
│
└── README.md                 # This file
```

## Technology Stack

### Frontend

#### Core Framework
- **React 19.2.0**: UI library with hooks and context
- **React Router DOM 7.9.5**: Client-side routing
- **React Scripts 5.0.1**: Build tooling (Create React App)

#### Mapping
- **Leaflet 1.9.4**: Interactive mapping library
- **React-Leaflet 5.0.0**: React bindings for Leaflet

#### UI Components
- **Lucide React 0.553.0**: Icon library

#### Testing (included from create-react-app, not utilized currently)
- **@testing-library/react 16.3.0**: React testing utilities
- **@testing-library/jest-dom 6.9.1**: Jest matchers
- **@testing-library/user-event 13.5.0**: User interaction simulation

### Backend

#### Framework
- **Flask 3.1.2**: Web framework
- **Flask-CORS 6.0.1**: Cross-origin resource sharing
- **Flask-SQLAlchemy 3.1.1**: ORM integration
- **Flask-Migrate 4.1.0**: Database migrations (Alembic)

#### Database
- **SQLAlchemy 2.0.44**: Python ORM
- **Alembic 1.17.1**: Database migration tool

#### Data Processing
- **Pandas 2.3.3**: Data manipulation and analysis
- **NumPy 2.3.4**: Numerical computing
- **OpenPyXL 3.1.5**: Excel file processing

#### Security
- **Werkzeug 3.1.3**: Password hashing and security utilities
- **python-dotenv 1.1.1**: Environment variable management

#### Testing
- **pytest 8.4.2**: Testing framework
- **pytest-cov 7.0.0**: Code coverage

#### Other Dependencies
- **Requests 2.32.5**: HTTP library
- **Click 8.3.0**: CLI utilities

## Database

### Schema

The application uses SQLite for development with the following tables:

#### `food_resources`
Primary table for storing food access points.

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| name | String(200) | Resource name |
| resource_type | String(50) | Type (grocery, pantry, farmers_market, etc.) |
| address | String(300) | Street address |
| neighborhood | String(100) | Pittsburgh neighborhood |
| latitude | Float | GPS latitude |
| longitude | Float | GPS longitude |
| hours | JSON | Operating hours by day |
| phone | String(20) | Contact phone number |
| website | String(200) | Resource website |
| description | Text | Additional details |
| is_active | Boolean | Active status |
| created_at | DateTime | Creation timestamp |

#### `users`
User accounts for admin access.

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| name | String(80) | User's full name |
| email | String(120) | Unique email address |
| password_hash | String(200) | Hashed password |
| is_admin | Boolean | Admin privileges |
| is_active | Boolean | Account status |
| created_at | DateTime | Registration date |
| last_login | DateTime | Last login timestamp |
| organization | String(200) | User's organization |
| phone | String(20) | Contact number |

#### `reports`
Issue reports submitted by users.

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| resource_id | Integer | Foreign key to food_resources |
| message | Text | Issue description |
| status | String(20) | pending, reviewed, or resolved |
| admin_notes | Text | Admin response notes |
| created_at | DateTime | Submission timestamp |
| updated_at | DateTime | Last update timestamp |

#### `suggestions`
New resource suggestions from the community.

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| name | String(255) | Suggested resource name |
| address | String(255) | Resource address |
| resource_type | String(100) | Resource category |
| neighborhood | String(100) | Pittsburgh neighborhood |
| phone | String(20) | Contact number |
| website | String(255) | Website URL |
| hours | Text | Operating hours |
| description | Text | Resource description |
| submitter_name | String(100) | Person who submitted |
| submitter_email | String(100) | Submitter contact |
| status | String(20) | pending, approved, or rejected |
| admin_notes | Text | Admin review notes |
| created_at | DateTime | Submission timestamp |
| updated_at | DateTime | Last update timestamp |

### Database Configuration

The database location is configured in [backend/app/config.py](backend/app/config.py):

- **Development**: `backend/app/database/dev.db`
- **Production**: Configured via `DATABASE_URL` environment variable

## Setup Instructions

### Prerequisites

- **Node.js** (v14 or higher)
- **Python** (3.8 or higher)
- **pip** (Python package manager)
- **npm** (Node package manager)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Create a `.env` file in the backend directory:
   ```env
   SECRET_KEY=your-secret-key-here
   DATABASE_URL=sqlite:///dev.db
   FLASK_ENV=development
   ```

6. Initialize the database:
   ```bash
   python -m flask db upgrade
   ```

7. (Optional) Load sample data:
   ```bash
   python -m app.database.seed
   ```

8. Run the development server:
   ```bash
   python run.py
   ```

   The API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The application will open at `http://localhost:3000`

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Public Endpoints

#### Get Food Resources
```
GET /api/food_resources
```
Returns all active food resources in GeoJSON format.

**Response:**
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
        "name": "Resource Name",
        "resource_type": "grocery",
        "address": "123 Main St",
        "neighborhood": "Downtown",
        "hours": {"monday": "9:00-17:00"},
        "phone": "(412) 555-1234",
        "website": "https://example.com",
        "description": "Description text"
      }
    }
  ]
}
```

#### Submit Report
```
POST /api/reports
```
Submit an issue report for a resource.

**Request Body:**
```json
{
  "resource_id": 1,
  "message": "This location has closed"
}
```

#### Submit Suggestion
```
POST /api/suggestions
```
Suggest a new resource to add.

**Request Body:**
```json
{
  "name": "New Food Bank",
  "address": "456 Oak St",
  "resource_type": "food_pantry",
  "description": "Serves the community"
}
```

### Admin Endpoints

All admin endpoints require authentication.

#### User Authentication
```
POST /api/users/login
POST /api/users/logout
GET /api/users/session
```

#### Resource Management
```
GET /api/food_resources
POST /api/food_resources
PUT /api/food_resources/<id>
DELETE /api/food_resources/<id>
```

#### Report Management
```
GET /api/reports
PUT /api/reports/<id>
DELETE /api/reports/<id>
```

#### Suggestion Management
```
GET /api/suggestions
PUT /api/suggestions/<id>
DELETE /api/suggestions/<id>
```

## Development

### Running Tests

#### Backend Tests
```bash
cd backend
pytest
# With coverage
pytest --cov=app --cov-report=html
```

#### Frontend Tests
```bash
cd frontend
npm test
```

### Data Import

To import data from spreadsheets:

```bash
cd backend
python -m app.database.intake_supermarkets path/to/file.xlsx
python -m app.database.intake_farms path/to/file.xlsx
python -m app.database.intake_foodgardens path/to/file.xlsx
```

Check each intake script for specific argument requirements.

### Code Organization

#### Frontend Architecture
- **App.js**: Main router defining all application routes
- **MainApp.jsx**: Primary public-facing application with map/list views
- **components/**: Reusable UI components
- **contexts/AuthContext.js**: Global authentication state management
- **services/api.js**: Centralized API communication layer
- **hooks/**: Custom React hooks for shared logic

#### Backend Architecture
- **Factory Pattern**: `create_app()` function for flexible configuration
- **Blueprint Organization**: Routes organized by feature area
- **Model Layer**: SQLAlchemy models with helper methods
- **Config Classes**: Environment-specific configurations

### Environment Variables

#### Backend (.env)
- `SECRET_KEY`: Flask secret key for sessions
- `DATABASE_URL`: Database connection string
- `FLASK_ENV`: development or production

#### Frontend
React environment variables can be added to `.env` in the frontend directory with the `REACT_APP_` prefix.

## Production Deployment

### Backend
1. Set production environment variables
2. Use a production WSGI server (gunicorn, uwsgi)
3. Configure PostgreSQL or other production database
4. Enable HTTPS and set `SESSION_COOKIE_SECURE=True`
5. Generate a strong `SECRET_KEY`:
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```

### Frontend
1. Build production bundle:
   ```bash
   npm run build
   ```
2. Serve the `build/` directory with a static file server (nginx, Apache)
3. Configure proper CORS origins in backend config
