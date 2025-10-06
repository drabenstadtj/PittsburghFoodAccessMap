from backend.app import app

@app.route('/reports')
def reports():
    return 'reports dashboard'