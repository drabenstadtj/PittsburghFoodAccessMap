from backend.app import app

@app.route('/reports')
def admin_dashboard():
    return 'reports dashboard'