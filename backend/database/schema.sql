CREATE TABLE IF NOT EXISTS food_access_points (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('grocery', 'pantry', 'farmers'' market')),
    address TEXT,
    city TEXT,
    zip_code TEXT,
    latitude REAL,
    longitude REAL
);