from backend.app import app

@app.route('/')
def landing():
    return 'PFAM'