#!/usr/bin/python3

from app import db
from app.models.base import BaseModel


class Review(BaseModel):
    __tablename__ = 'reviews'

    text = db.Column(db.String(255), nullable=False)
    rating = db.Column(db.Integer, nullable=False)

    place_id = db.Column(db.String(36), db.ForeignKey('places.id'), nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)

    def __init__(self, text: str, rating: int, place=None, user=None):

        if not text or not text.strip():
            raise ValueError("Review text is required")
        if not (1 <= rating <= 5):
            raise ValueError("Rating must be between 1 and 5")

        self.text = text
        self.rating = rating

        # Temporary Python-side links until SQLAlchemy relationships are added later
        self.place = place
        self.user = user
