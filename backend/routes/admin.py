from backend.app import app

@app.route('/admin')
def admin_dashboard():
    return 'admin dashboard'