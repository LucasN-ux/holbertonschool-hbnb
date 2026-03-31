#!/usr/bin/python3
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from app import create_app, db
from app.models.user import User
from app.models.place import Place
from app.models.review import Review
from app.models.amenity import Amenity

app = create_app()

with app.app_context():

    print("\n========== USERS ==========")
    users = User.query.all()
    for u in users:
        print(f"\n[USER] {u.id} - {u.first_name} {u.last_name}")
        print(f"Email: {u.email} | Admin: {u.is_admin}")

        if hasattr(u, "places"):
            print("  Places:")
            for p in u.places:
                print(f"    -> {p.id}: {p.title} (${p.price})")

        if hasattr(u, "reviews"):
            print("  Reviews:")
            for r in u.reviews:
                print(f"    -> {r.id}: Rating={r.rating} | Place={r.place_id}")


    print("\n========== PLACES ==========")
    places = Place.query.all()
    for p in places:
        print(f"\n[PLACE] {p.id} - {p.title}")
        print(f"Price: {p.price} | Owner: {p.owner_id}")

        if hasattr(p, "owner"):
            print(f"  Owner: {p.owner.first_name} {p.owner.last_name}")

        if hasattr(p, "reviews"):
            print("  Reviews:")
            for r in p.reviews:
                print(f"    -> {r.id}: Rating={r.rating} | User={r.user_id}")

        if hasattr(p, "amenities"):
            print("  Amenities:")
            for a in p.amenities:
                print(f"    -> {a.id}: {a.name}")


    print("\n========== REVIEWS ==========")
    reviews = Review.query.all()
    for r in reviews:
        print(f"\n[REVIEW] {r.id}")
        print(f"Text: {r.text}")
        print(f"Rating: {r.rating}")
        print(f"User: {r.user_id} | Place: {r.place_id}")

        print("  Relations:")
        if hasattr(r, "user"):
            print(f"  User Name: {r.user.first_name}")
        if hasattr(r, "place"):
            print(f"  Place Title: {r.place.title}")


    print("\n========== AMENITIES ==========")
    amenities = Amenity.query.all()
    for a in amenities:
        print(f"\n[AMENITY] {a.id} - {a.name}")

        # Many-to-Many with Places
        if hasattr(a, "places"):
            print("  Used in Places:")
            for p in a.places:
                print(f"    -> {p.id}: {p.title}")
