#!/usr/bin/python3

from app import bcrypt, db
from .base import BaseModel
from email_validator import validate_email, EmailNotValidError
import uuid


class User(BaseModel):

    __tablename__ = 'users'

    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    password = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

    # One-to-many relationship with Place and Review
    places = db.relationship('Place', backref='owner', cascade='all, delete-orphan', lazy=True)
    reviews = db.relationship('Review', backref='user', cascade='all, delete-orphan', lazy=True)

    def __init__(self, first_name: str, last_name: str, email: str, is_admin=False):
        if not first_name or len(first_name) > 50:
            raise ValueError("Invalid first name")
        if not last_name or len(last_name) > 50:
            raise ValueError("Invalid last name")
        if not self.validate_email_format(email):
            raise ValueError("Invalid email format")

        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.is_admin = is_admin
        self.password = None

    @staticmethod
    def validate_email_format(email):
        try:
            validate_email(email)
            return True
        except EmailNotValidError:
            return False

    def hash_password(self, password):
        """Hash the password before storing it."""
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def verify_password(self, password):
        """Verify the hashed password."""
        return bcrypt.check_password_hash(self.password, password)
