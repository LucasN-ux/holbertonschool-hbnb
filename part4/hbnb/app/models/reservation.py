#!/usr/bin/python3
"""Reservation model — links a guest (User) to a Place with dates and status."""

from app import db
from app.models.base import BaseModel


class Reservation(BaseModel):
    __tablename__ = 'reservations'

    guest_id    = db.Column(db.String(36), db.ForeignKey('users.id',  ondelete='CASCADE'), nullable=False)
    place_id    = db.Column(db.String(36), db.ForeignKey('places.id', ondelete='CASCADE'), nullable=False)
    check_in    = db.Column(db.Date, nullable=False)
    check_out   = db.Column(db.Date, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    # status: pending | confirmed | cancelled
    status      = db.Column(db.String(20), nullable=False, default='pending')

    guest = db.relationship('User',  backref=db.backref('reservations', lazy=True), foreign_keys=[guest_id])
    place = db.relationship('Place', backref=db.backref('reservations', lazy=True), foreign_keys=[place_id])

    def to_dict(self):
        return {
            'id':          self.id,
            'guest_id':    self.guest_id,
            'place_id':    self.place_id,
            'place_title': self.place.title if self.place else None,
            'guest_name':  f"{self.guest.first_name} {self.guest.last_name}" if self.guest else None,
            'check_in':    self.check_in.isoformat()  if self.check_in  else None,
            'check_out':   self.check_out.isoformat() if self.check_out else None,
            'total_price': self.total_price,
            'status':      self.status,
            'created_at':  self.created_at.isoformat() if self.created_at else None,
        }
