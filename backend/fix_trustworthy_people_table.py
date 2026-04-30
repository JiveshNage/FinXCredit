"""
Database migration to add missing columns to trustworthy_people table
"""
from sqlalchemy import text
from database import SessionLocal

def add_missing_columns():
    db = SessionLocal()
    try:
        # Check and add 'role' column if it doesn't exist
        try:
            with db.begin():
                db.execute(text("ALTER TABLE trustworthy_people ADD COLUMN role VARCHAR(255)"))
            print("✓ Added 'role' column to trustworthy_people table")
        except Exception as e:
            if "already exists" in str(e).lower() or "column" in str(e).lower():
                print("✓ Column 'role' already exists in trustworthy_people table")
            else:
                raise

        # Check and add other missing columns
        try:
            with db.begin():
                db.execute(text("ALTER TABLE trustworthy_people ADD COLUMN location VARCHAR(255)"))
            print("✓ Added 'location' column to trustworthy_people table")
        except:
            print("✓ Column 'location' already exists")

        try:
            with db.begin():
                db.execute(text("ALTER TABLE trustworthy_people ADD COLUMN badge VARCHAR(100)"))
            print("✓ Added 'badge' column to trustworthy_people table")
        except:
            print("✓ Column 'badge' already exists")

        print("\n✓ Database migration completed successfully!")
        
    except Exception as e:
        print(f"Migration error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    add_missing_columns()
