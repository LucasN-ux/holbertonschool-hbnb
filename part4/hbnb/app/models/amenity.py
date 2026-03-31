#!/usr/bin/python3

from app import db
from app.models.base import BaseModel


class Amenity(BaseModel):
    __tablename__ = 'amenities'

    name = db.Column(db.String(50), nullable=False)

    def __init__(self, name: str):
        if not name or len(name) > 50:
            raise ValueError("Invalid amenity name")
        self.name = name
