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

## File Structure

```
backend/
├── app/                    # Application code
├── .env                    # Active configuration (gitignored)
├── .env.dev               # Development template
├── .env.prod              # Production template
├── run.py                 # Development entry point
├── wsgi.py                # Production entry point
├── Dockerfile             # Container configuration
└── requirements.txt       # Python dependencies
```

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
Uses Flask's built-in development server with hot-reload:
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

### .gitignore Requirements
Ensure the following are in .gitignore:
```
.env
*.db
__pycache__/
*.pyc
```

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

## API Endpoints

### Health Check
```
GET /api/health
```
Returns application status. Use for container health checks.

### Authentication
All authenticated endpoints require session cookies with credentials: include.

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

### Database Migrations
If using a migration tool like Alembic:
1. Generate migration
2. Apply migration before deploying new container
3. Test thoroughly in development first

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
