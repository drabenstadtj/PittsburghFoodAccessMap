# Pittsburgh Food Access Map

Interactive map of food assistance resources in Pittsburgh, built in partnership with the Pittsburgh Policy Initiative. Public users can search and filter ~800 locations; admins manage resources and review community-submitted suggestions via a dashboard.

**Live:** https://map.jackdrab.dev

## Stack

- **Frontend:** React 19, React Router 7, Leaflet
- **Backend:** Flask 3, SQLAlchemy 2, Gunicorn
- **Infra:** Docker, Nginx

## Local Development

**Backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # fill in values
python run.py
```

**Frontend**
```bash
cd frontend
npm install
npm start
```

Frontend runs on `localhost:3000`, proxied to the backend at `localhost:5000`.

## Deployment

Requires Docker and an external `reverse-proxy-network` on the host.

```bash
cp backend/.env.example backend/.env  # fill in SECRET_KEY and CORS_ORIGINS
docker compose up --build -d
```

See `backend/.env.example` for required environment variables.

## Project Structure

```
frontend/
  src/
    components/     # Map, list, filter, modals
    pages/admin/    # Dashboard, resources, reports, suggestions
    services/       # API client
    utils/          # Map helpers, open/closed logic, geolocation
backend/
  app/
    models/         # SQLAlchemy models
    routes/         # API blueprints
    utils/          # Auth decorators
  database/         # SQLite DB (volume-mounted in prod)
```
