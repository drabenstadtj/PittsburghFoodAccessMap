# Pittsburgh Food Access Map

A web application for mapping and managing food access resources in Pittsburgh, PA.

## Overview

This application provides an interactive map interface for discovering food pantries, food banks, and other food assistance resources across Pittsburgh. It includes public-facing search and filtering capabilities, along with an admin dashboard for managing resource data.

## Tech Stack

### Frontend
- **React** 19.2.0
- **React Router** 7.9.5
- **Leaflet** / React Leaflet for mapping
- **Lucide React** for icons
- **CSS Modules** for styling

### Backend
- **Flask** 3.1.2
- **SQLAlchemy** 2.0.44 with Flask-SQLAlchemy
- **Flask-Migrate** for database migrations
- **Flask-CORS** for cross-origin requests
- **Pandas** for data processing
- **Gunicorn** for production deployment

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm start
```

The frontend will run at `http://localhost:3000`

### Backend

```bash
cd backend
pip install -r requirements.txt
python run.py
```

The backend API will run at `http://localhost:5000`

## Project Structure

```
PittsburghFoodAccessMap/
├── frontend/               # React application
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # Reusable components
│       ├── pages/         # Page components
│       ├── styles/        # Global styles
│       └── constants/     # Constants and config
│
└── backend/               # Flask API
    ├── app/              # Application code
    ├── data/             # Data files
    ├── tests/            # Test suite
    └── requirements.txt  # Python dependencies
```

## Features

- Interactive map with resource markers
- Advanced filtering by resource type, hours, and services
- List and map view modes
- Detailed resource information
- Issue reporting system
- Admin authentication and dashboard
- Resource CRUD operations
- Hours of operation management

## Development

### Frontend Scripts

- `npm start` - Run development server
- `npm build` - Build for production
- `npm test` - Run test suite

### Backend Setup

See [backend/README.md](backend/README.md) for detailed backend configuration, Docker deployment, and production setup instructions.

## Configuration

### Frontend
Configure the API endpoint in your environment variables or config files.

### Backend
The backend uses environment-based configuration. Copy `.env.dev` to `.env` for local development:

```bash
cd backend
cp .env.dev .env
```

## Production Deployment

### Frontend
```bash
npm run build
```
Deploy the `build/` directory to your static hosting service.

### Backend
See [backend/README.md](backend/README.md) for Docker-based production deployment with Gunicorn.
