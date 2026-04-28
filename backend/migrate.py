from database import engine
from sqlalchemy import text

print("Running database migration...")

with engine.connect() as conn:
    conn.execute(text("""
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS place VARCHAR,
        ADD COLUMN IF NOT EXISTS aadhaar_hash VARCHAR,
        ADD COLUMN IF NOT EXISTS pan_number VARCHAR,
        ADD COLUMN IF NOT EXISTS kyc_verified BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS two_fa_enabled BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS preferred_channel VARCHAR DEFAULT 'email',
        ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS worker_type VARCHAR DEFAULT 'salaried',
        ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'active',
        ADD COLUMN IF NOT EXISTS photo_url TEXT
    """))
    
    # Also ensure loan_applications has the JSON fields if needed
    conn.execute(text("""
        ALTER TABLE loan_applications
        ADD COLUMN IF NOT EXISTS factors_json VARCHAR,
        ADD COLUMN IF NOT EXISTS tips_json VARCHAR
    """))
    conn.commit()
    print("Migration complete! All missing columns added to users table.")
