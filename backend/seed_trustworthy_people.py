#!/usr/bin/env python3
"""
Script to seed the database with trustworthy people testimonials from the landing page.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine
from models import TrustworthyPerson
import datetime

def seed_trustworthy_people():
    """Add the testimonials from the landing page to the database."""

    # Create database tables if they don't exist
    from models import Base
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Check if data already exists
        existing_count = db.query(TrustworthyPerson).count()
        if existing_count > 0:
            print(f"Database already has {existing_count} testimonials. Skipping seed.")
            return

        # Testimonials from landing page
        testimonials = [
            {
                "name": "Arjun Patel",
                "occupation": "Delivery Partner",
                "location": "Mumbai",
                "testimonial": "No bank would give me a loan because I don't have a salary slip. CreditBridge looked at my UPI transactions and approved ₹50,000 for my new delivery bike in 5 minutes.",
                "rating": 5,
                "is_featured": True
            },
            {
                "name": "Meena Devi",
                "occupation": "Street Vendor",
                "location": "Delhi",
                "testimonial": "The digital KYC was so easy. I just linked my bank account, and the AI calculated my score instantly. I got the working capital I needed to expand my street food stall.",
                "rating": 5,
                "is_featured": True
            }
        ]

        # Add testimonials to database
        for testimonial_data in testimonials:
            person = TrustworthyPerson(
                name=testimonial_data["name"],
                occupation=testimonial_data["occupation"],
                location=testimonial_data["location"],
                testimonial=testimonial_data["testimonial"],
                rating=testimonial_data["rating"],
                is_featured=testimonial_data["is_featured"]
            )
            db.add(person)

        db.commit()
        print(f"Successfully seeded {len(testimonials)} testimonials into the database.")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_trustworthy_people()