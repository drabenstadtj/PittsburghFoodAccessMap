from backend.app import app, connect_db
from flask import render_template

# home page
@app.route('/')
def landing():
    # for now, just retrieve all entries from access_points and display them on page
    conn = connect_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM food_access_points')
    data = cursor.fetchall()

    return render_template('index.html', data=data)