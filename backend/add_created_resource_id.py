"""
Migration script to add created_resource_id column to suggestions table.
Run this once to update your database schema.
"""
import sqlite3
import os

# Path to your database
DB_PATH = os.path.join(os.path.dirname(__file__), 'app', 'database', 'dev.db')

def add_created_resource_id_column():
    """Add created_resource_id column to suggestions table if it doesn't exist."""

    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # Check if column already exists
        cursor.execute("PRAGMA table_info(suggestions)")
        columns = [column[1] for column in cursor.fetchall()]

        if 'created_resource_id' in columns:
            print("Column 'created_resource_id' already exists. No migration needed.")
            return

        # Add the column
        print("Adding 'created_resource_id' column to suggestions table...")
        cursor.execute("""
            ALTER TABLE suggestions
            ADD COLUMN created_resource_id INTEGER
        """)

        conn.commit()
        print("Successfully added 'created_resource_id' column!")

    except Exception as e:
        conn.rollback()
        print(f"Error during migration: {e}")
        raise

    finally:
        conn.close()

if __name__ == "__main__":
    add_created_resource_id_column()
