#!/usr/bin/python3
"""Reservations API — book a place, confirm or cancel."""

from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from flask import request
from app.services import facade

api = Namespace('reservations', description='Reservation operations')

reservation_model = api.model('Reservation', {
    'place_id':  fields.String(required=True),
    'check_in':  fields.String(required=True, description='YYYY-MM-DD'),
    'check_out': fields.String(required=True, description='YYYY-MM-DD'),
})


def _is_admin():
    try:
        claims = get_jwt()
        return bool(claims.get('is_admin'))
    except Exception:
        return False


@api.route('/')
class ReservationList(Resource):

    @jwt_required()
    def get(self):
        """List all reservations (admin only)."""
        if not _is_admin():
            return {'error': 'Admin access required'}, 403
        reservations = facade.get_all_reservations()
        return [r.to_dict() for r in reservations], 200

    @jwt_required()
    @api.expect(reservation_model)
    def post(self):
        """Create a reservation for a place."""
        guest_id = get_jwt_identity()
        data = request.get_json()

        try:
            reservation = facade.create_reservation(
                guest_id=guest_id,
                place_id=data['place_id'],
                check_in_str=data['check_in'],
                check_out_str=data['check_out'],
            )
        except ValueError as e:
            return {'error': str(e)}, 400

        return reservation.to_dict(), 201


@api.route('/mine')
class MyReservations(Resource):

    @jwt_required()
    def get(self):
        """Get the current user's reservations (as a guest)."""
        guest_id = get_jwt_identity()
        reservations = facade.get_reservations_by_guest(guest_id)
        return [r.to_dict() for r in reservations], 200


@api.route('/incoming')
class IncomingReservations(Resource):

    @jwt_required()
    def get(self):
        """Get reservations for places owned by the current user."""
        owner_id = get_jwt_identity()
        reservations = facade.get_incoming_reservations(owner_id)
        return [r.to_dict() for r in reservations], 200


@api.route('/<string:reservation_id>')
class ReservationDetail(Resource):

    @jwt_required()
    def get(self, reservation_id):
        """Get a reservation by ID (guest, owner of place, or admin)."""
        user_id = get_jwt_identity()
        reservation = facade.get_reservation(reservation_id)
        if not reservation:
            return {'error': 'Reservation not found'}, 404

        is_admin = _is_admin()
        is_guest = reservation.guest_id == user_id
        is_owner = reservation.place and reservation.place.owner_id == user_id

        if not (is_admin or is_guest or is_owner):
            return {'error': 'Unauthorized'}, 403

        return reservation.to_dict(), 200

    @jwt_required()
    def delete(self, reservation_id):
        """Cancel a reservation (guest cancels their own, admin cancels any)."""
        user_id = get_jwt_identity()
        reservation = facade.get_reservation(reservation_id)
        if not reservation:
            return {'error': 'Reservation not found'}, 404

        is_admin = _is_admin()
        is_guest = reservation.guest_id == user_id

        if not (is_admin or is_guest):
            return {'error': 'Unauthorized'}, 403

        if reservation.status == 'cancelled':
            return {'error': 'Reservation already cancelled'}, 400

        facade.cancel_reservation(reservation_id)
        return {'message': 'Reservation cancelled'}, 200


@api.route('/<string:reservation_id>/confirm')
class ConfirmReservation(Resource):

    @jwt_required()
    def put(self, reservation_id):
        """Confirm a reservation (only the place owner can confirm)."""
        owner_id = get_jwt_identity()
        reservation = facade.get_reservation(reservation_id)
        if not reservation:
            return {'error': 'Reservation not found'}, 404

        is_admin = _is_admin()
        is_owner = reservation.place and reservation.place.owner_id == owner_id

        if not (is_admin or is_owner):
            return {'error': 'Only the place owner can confirm reservations'}, 403

        if reservation.status != 'pending':
            return {'error': f'Cannot confirm a reservation with status "{reservation.status}"'}, 400

        updated = facade.confirm_reservation(reservation_id)
        return updated.to_dict(), 200


@api.route('/<string:reservation_id>/reject')
class RejectReservation(Resource):

    @jwt_required()
    def put(self, reservation_id):
        """Reject a pending reservation (only the place owner can reject)."""
        owner_id = get_jwt_identity()
        reservation = facade.get_reservation(reservation_id)
        if not reservation:
            return {'error': 'Reservation not found'}, 404

        is_admin = _is_admin()
        is_owner = reservation.place and reservation.place.owner_id == owner_id

        if not (is_admin or is_owner):
            return {'error': 'Only the place owner can reject reservations'}, 403

        if reservation.status != 'pending':
            return {'error': f'Cannot reject a reservation with status "{reservation.status}"'}, 400

        updated = facade.cancel_reservation(reservation_id)
        return updated.to_dict(), 200
