from app.models.reservation import Reservation
from app.persistence.repository import SQLAlchemyRepository


class ReservationRepository(SQLAlchemyRepository):
    def __init__(self):
        super().__init__(Reservation)

    def get_by_guest(self, guest_id):
        return Reservation.query.filter_by(guest_id=guest_id).all()

    def get_by_place(self, place_id):
        return Reservation.query.filter_by(place_id=place_id).all()

    def get_confirmed_for_place(self, place_id):
        return Reservation.query.filter_by(place_id=place_id, status='confirmed').all()
