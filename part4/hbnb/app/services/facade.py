#!/usr/bin/python3
"""
Module handling communication between the Presentation, Business Logic,
and Persistence layers
"""


from app.services.repositories.user_repository import UserRepository
from app.services.repositories.place_repository import PlaceRepository
from app.services.repositories.review_repository import ReviewRepository
from app.services.repositories.amenity_repository import AmenityRepository
from app.services.repositories.reservation_repository import (
    ReservationRepository
)
from app.models.user import User
from app.models.place import Place
from app.models.review import Review
from app.models.amenity import Amenity
from app.models.reservation import Reservation
from app import db
from datetime import date


class HBnBFacade:
    def __init__(self):
        self.user_repo = UserRepository()
        self.place_repo = PlaceRepository()
        self.review_repo = ReviewRepository()
        self.amenity_repo = AmenityRepository()
        self.reservation_repo = ReservationRepository()

    def create_user(self, user_data, password):
        if not User.validate_email_format(user_data['email']):
            raise ValueError("Invalid email format")

        user = User(**user_data)
        user.hash_password(password)
        self.user_repo.add(user)
        return user

    def get_user(self, user_id):
        return self.user_repo.get(user_id)

    def get_user_by_email(self, email):
        return self.user_repo.get_user_by_email(email)

    def get_all_users(self):
        return self.user_repo.get_all()

    def update_user(self, user_id, new_data, is_admin=False):
        user = self.get_user(user_id)
        if not user:
            return None

        allowed_fields = ['first_name', 'last_name']

        if is_admin:
            allowed_fields.extend(['email', 'is_admin'])

        clean_data = {}

        for key in allowed_fields:
            if key in new_data:
                setattr(user, key, new_data[key])
                clean_data[key] = new_data[key]

        if is_admin and 'password' in new_data:
            user.hash_password(new_data['password'])
            clean_data['password'] = user.password

        self.user_repo.update(user_id, clean_data)
        return user

    def create_amenity(self, amenity_data):
        amenity = Amenity(**amenity_data)
        self.amenity_repo.add(amenity)
        return amenity

    def get_amenity(self, amenity_id):
        return self.amenity_repo.get(amenity_id)

    def get_all_amenities(self):
        return self.amenity_repo.get_all()

    def update_amenity(self, amenity_id, amenity_data):
        amenity = self.amenity_repo.get(amenity_id)
        if not amenity:
            return None

        clean_data = {}
        if 'name' in amenity_data:
            amenity.name = amenity_data['name']
            clean_data['name'] = amenity.name

        self.amenity_repo.update(amenity_id, clean_data)
        return amenity

    def add_amenities_to_place(self, place_id, amenity_ids):
        place = self.get_place(place_id)
        if not place:
            raise ValueError("Place not found")

        amenities = []
        for aid in amenity_ids:
            amenity = self.get_amenity(aid)
            if not amenity:
                raise ValueError(f"Amenity {aid} not found")
            amenities.append(amenity)

        place.amenities = amenities
        db.session.commit()
        return place

    def create_place(self, place_data):
        owner = self.user_repo.get(place_data["owner_id"])
        if not owner:
            raise ValueError("Owner not found")

        place = Place(
            title=place_data["title"],
            description=place_data.get("description"),
            price=place_data["price"],
            latitude=place_data["latitude"],
            longitude=place_data["longitude"],
            owner=owner,
            photos=place_data.get("photos")
        )

        amenities_ids = place_data.get("amenities", [])
        for amenity_id in amenities_ids:
            amenity = self.amenity_repo.get(amenity_id)
            if not amenity:
                raise ValueError(f"Amenity {amenity_id} not found")
            place.add_amenity(amenity)

        self.place_repo.add(place)
        return place

    def get_place(self, place_id):
        return self.place_repo.get(place_id)

    def get_all_places(self):
        return self.place_repo.get_all()

    def update_place(self, place_id, place_data):
        place = self.place_repo.get(place_id)
        if not place:
            return None

        if "amenities" in place_data:
            place.clear_amenities()

            for amenity_id in place_data["amenities"]:
                amenity = self.amenity_repo.get(amenity_id)
                if not amenity:
                    raise ValueError(f"Amenity {amenity_id} not found")
                place.add_amenity(amenity)

        clean_data = {}
        updatable = [
            "title", "description", "price",
            "latitude", "longitude", "photos"
        ]
        for key in updatable:
            if key in place_data:
                clean_data[key] = place_data[key]
                setattr(place, key, place_data[key])

        self.place_repo.update(place_id, clean_data)
        return place

    def create_review(self, review_data):
        user = self.user_repo.get(review_data["user_id"])
        if not user:
            raise ValueError("User not found")

        place = self.place_repo.get(review_data["place_id"])
        if not place:
            raise ValueError("Place not found")

        text = review_data.get("text")
        if not isinstance(text, str) or not text.strip():
            raise ValueError("Invalid input data")

        rating = review_data.get("rating")
        if not isinstance(rating, int) or not (1 <= rating <= 5):
            raise ValueError("Invalid input data")

        review = Review(
            text=review_data["text"],
            rating=review_data["rating"],
            place=place,
            user=user
        )

        self.review_repo.add(review)
        return review

    def get_review(self, review_id):
        return self.review_repo.get(review_id)

    def get_all_reviews(self):
        return self.review_repo.get_all()

    def get_reviews_by_place(self, place_id):
        place = self.place_repo.get(place_id)
        if not place:
            return None

        reviews = self.review_repo.get_all()
        return [
            review for review in reviews
            if getattr(review, 'place', None)
            and review.place.id == place_id
        ]

    def update_review(self, review_id, review_data):
        review = self.review_repo.get(review_id)
        if not review:
            return None

        clean_data = {}
        for key in ["text", "rating"]:
            if key in review_data:
                setattr(review, key, review_data[key])
                clean_data[key] = review_data[key]

        self.review_repo.update(review_id, clean_data)
        return review

    def delete_review(self, review_id):
        review = self.review_repo.get(review_id)
        if not review:
            return False
        self.review_repo.delete(review_id)
        return True

    def delete_user(self, user_id):
        user = self.user_repo.get(user_id)
        if not user:
            return False
        self.user_repo.delete(user_id)
        return True

    def delete_place(self, place_id):
        place = self.place_repo.get(place_id)
        if not place:
            return False
        self.place_repo.delete(place_id)
        return True

    def delete_amenity(self, amenity_id):
        amenity = self.amenity_repo.get(amenity_id)
        if not amenity:
            return False
        self.amenity_repo.delete(amenity_id)
        return True

    # ── Reservations ──────────────────────────────────────────────

    def create_reservation(self, guest_id, place_id, check_in_str, check_out_str):
        from datetime import datetime
        guest = self.user_repo.get(guest_id)
        if not guest:
            raise ValueError("User not found")

        place = self.place_repo.get(place_id)
        if not place:
            raise ValueError("Place not found")

        if place.owner_id == guest_id:
            raise ValueError("You cannot reserve your own habitat")

        try:
            check_in  = datetime.strptime(check_in_str,  '%Y-%m-%d').date()
            check_out = datetime.strptime(check_out_str, '%Y-%m-%d').date()
        except ValueError:
            raise ValueError("Dates must be in YYYY-MM-DD format")

        today = date.today()
        if check_in < today:
            raise ValueError("Check-in date must be today or in the future")
        if check_out <= check_in:
            raise ValueError("Check-out must be after check-in")

        nights = (check_out - check_in).days
        total_price = round(nights * float(place.price), 2)

        # Conflict check — only confirmed reservations block new ones
        confirmed = self.reservation_repo.get_confirmed_for_place(place_id)
        for r in confirmed:
            if not (check_out <= r.check_in or check_in >= r.check_out):
                raise ValueError(
                    "These dates overlap with an existing confirmed reservation"
                )

        reservation = Reservation(
            guest_id=guest_id,
            place_id=place_id,
            check_in=check_in,
            check_out=check_out,
            total_price=total_price,
            status='pending',
        )
        self.reservation_repo.add(reservation)
        return reservation

    def get_reservation(self, reservation_id):
        return self.reservation_repo.get(reservation_id)

    def get_all_reservations(self):
        return self.reservation_repo.get_all()

    def get_reservations_by_guest(self, guest_id):
        return self.reservation_repo.get_by_guest(guest_id)

    def get_incoming_reservations(self, owner_id):
        """Return all reservations for places owned by owner_id."""
        places = self.place_repo.get_all()
        owner_place_ids = {p.id for p in places if p.owner_id == owner_id}
        all_res = self.reservation_repo.get_all()
        return [r for r in all_res if r.place_id in owner_place_ids]

    def confirm_reservation(self, reservation_id):
        reservation = self.reservation_repo.get(reservation_id)
        if not reservation:
            return None
        reservation.status = 'confirmed'
        db.session.commit()
        return reservation

    def cancel_reservation(self, reservation_id):
        reservation = self.reservation_repo.get(reservation_id)
        if not reservation:
            return None
        reservation.status = 'cancelled'
        db.session.commit()
        return reservation
