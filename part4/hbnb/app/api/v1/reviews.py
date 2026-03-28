#!/usr/bin/python3
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.services import facade

api = Namespace('reviews', description='Review operations')

# Define the review model for input validation and documentation
review_model = api.model('Review', {
    'text': fields.String(required=True, description='Text of the review'),
    'rating': fields.Integer(required=True, description='Rating of the place (1-5)'),
    'place_id': fields.String(required=True, description='ID of the place')
})

review_update_model = api.model('ReviewUpdate', {
    'text': fields.String(description='Text of the review'),
    'rating': fields.Integer(description='Rating of the place (1-5)')
})


def _is_admin():
    claims = get_jwt()
    return claims.get("is_admin", False)


@api.route('/')
class ReviewList(Resource):
    @jwt_required()
    @api.doc(security='Bearer Auth')
    @api.expect(review_model)
    @api.response(201, 'Review successfully created')
    @api.response(400, 'Invalid input data')
    def post(self):
        """Register a new review"""
        try:
            current_user = get_jwt_identity()
            review_data = api.payload.copy()
            review_data['user_id'] = current_user

            place = facade.get_place(review_data['place_id'])
            if not place:
                return {"error": "Place not found"}, 404

            if place.owner.id == current_user:
                return {"error": "You cannot review your own place"}, 400

            existing_reviews = facade.get_all_reviews()
            for review in existing_reviews:
                if review.user.id == current_user and review.place.id == review_data['place_id']:
                    return {"error": "You have already reviewed this place"}, 400

            review = facade.create_review(review_data)
            return {
               "id": review.id,
               "text": review.text,
               "rating": review.rating,
               "user_id": review.user.id,
               "place_id": review.place.id
            }, 201
        except ValueError as e:
            return {"error": str(e)}, 400

    @api.response(200, 'List of reviews retrieved successfully')
    def get(self):
        """Retrieve a list of all reviews"""
        review = facade.get_all_reviews()
        return [{
            "id": r.id,
            "text": r.text,
            "rating": r.rating,
            "user_id": r.user.id,
            "place_id": r.place.id
        } for r in review], 200


@api.route('/<review_id>')
class ReviewResource(Resource):
    @api.response(200, 'Review details retrieved successfully')
    @api.response(404, 'Review not found')
    def get(self, review_id):
        """Get review details by ID"""
        review = facade.get_review(review_id)
        if not review:
            return {"error": "Review not found"}, 404
        return {
            "id": review.id,
            "text": review.text,
            "rating": review.rating,
            "user_id": review.user.id,
            "place_id": review.place.id
        }, 200

    @jwt_required()
    @api.doc(security='Bearer Auth')
    @api.expect(review_update_model, validate=True)
    @api.response(200, 'Review updated successfully')
    @api.response(404, 'Review not found')
    @api.response(400, 'Invalid input data')
    @api.response(403, 'Unauthorized action')
    def put(self, review_id):
        """Update a review's information"""
        try:
            current_user = get_jwt_identity()
            is_admin = _is_admin()

            review = facade.get_review(review_id)
            if not review:
                return {"error": "Review not found"}, 404
            if review.user.id != current_user and not is_admin:
                return {"error": "Unauthorized action"}, 403
            updated = facade.update_review(review_id, api.payload)
            if not updated:
                return {"error": "Review not found"}, 404
            return {
                "id": updated.id,
                "text": updated.text,
                "rating": updated.rating,
                "user_id": updated.user.id,
                "place_id": updated.place.id
                }, 200
        except ValueError as e:
            return {"error": str(e)}, 400

    @jwt_required()
    @api.doc(security='Bearer Auth')
    @api.response(200, 'Review deleted successfully')
    @api.response(404, 'Review not found')
    @api.response(403, 'Unauthorized action')
    def delete(self, review_id):
        """Delete a review"""
        current_user = get_jwt_identity()
        is_admin = _is_admin()

        review = facade.get_review(review_id)
        if not review:
            return {"error": "Review not found"}, 404
        if review.user.id != current_user and not is_admin:
            return {"error": "Unauthorized action"}, 403
        deleted = facade.delete_review(review_id)
        if not deleted:
            return {"error": "Review not found"}, 404
        return {"message": "Review deleted successfully"}, 200
