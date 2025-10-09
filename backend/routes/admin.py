from backend.app import app, connect_db
from flask import request

# default route for adming dashboard
@app.route('/admin')
def admin_dashboard():
    return 'admin dashboard'

# create a new point on the Food Access map
@app.route('/admin/create_location', methods=['POST'])
def create_location():
    if request.method == 'POST':
        # get location information from form user filled out
        # !!!!! for now, all fields are required from the user. after inital prototype is done, we can look into making this so lat and longitude are automatically pulled given address?
        name = request.form['name']
        loc_type = request.form['type']
        address = request.form['address']
        city = request.form['city']
        zip_code = request.form['zip_code']
        latitude = request.form['latitude']
        longitude = request.form['longitude']

        # connect to db and insert new location
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute('''INSERT INTO food_access_points (name, type, address, city, zip_code, latitude, longitude)' \
                       VALUES (?, ?, ?, ?, ?, ?, ?)''',
                        (name, loc_type, address, city, zip_code, latitude, longitude))
        conn.commit()
        conn.close()

        return 'Location was successfully added to the DB'
    else:
        return 'The received request method is not POST'

@app.route('/admin/update_location', methods=['PUT'])
def update_location():
    if request.method == 'PUT':
        # get updated location info
        loc_id = request.form['id']
        name = request.form['name']
        loc_type = request.form['type']
        address = request.form['address']
        city = request.form['city']
        zip_code = request.form['zip_code']
        latitude = request.form['latitude']
        longitude = request.form['longitude'] 

        # connect to db and update location
        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE food_access_points
            SET name = ?, type = ?, address = ?, city = ?, zip_code = ?, latitude = ?, longitude = ?
            WHERE id = ?''', 
            (name, loc_type, address, city, zip_code, latitude, longitude, loc_id))
        conn.commit()
        conn.close()

        return 'Location was successfully updated'
    else:
        return 'The received request method is not PUT'

@app.route('/admin/delete_location', methods=['DELETE'])
def delete_location():
    if request.method == 'DELETE':
        loc_id = request.form['id']

        conn = connect_db()
        cursor = conn.cursor()
        cursor.execute('''DELETE FROM food_access_points WHERE id = ?''',
                       (loc_id))
        conn.commit()
        conn.close()

        return 'location successfully deleted'
    else:
        return 'The received request method is not DELETE'

