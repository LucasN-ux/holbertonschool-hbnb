#!/usr/bin/python3
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.services import facade

api = Namespace('places', description='Place operations')

# Define the models for related entities
amenity_model = api.model('PlaceAmenity', {
    'id': fields.String(description='Amenity ID'),
    'name': fields.String(description='Name of the amenity')
})

user_model = api.model('PlaceUser', {
    'id': fields.String(description='User ID'),
    'first_name': fields.String(description='First name of the owner'),
    'last_name': fields.String(description='Last name of the owner'),
    'email': fields.String(description='Email of the owner')
})

# Define the review model for input validation and documentation
review_model = api.model('PlaceReview', {
    'id': fields.String(description='Review ID'),
    'text': fields.String(description='Text of the review'),
    'rating': fields.Integer(description='Rating of the place (1-5)'),
    'user_id': fields.String(description='ID of the user')
})

# Model for creating a place
place_create_model = api.model('PlaceCreate', {
    'title': fields.String(required=True, description='Title of the place'),
    'description': fields.String(description='Description of the place'),
    'price': fields.Float(required=True, description='Price per night'),
    'latitude': fields.Float(required=True, description='Latitude of the place'),
    'longitude': fields.Float(required=True, description='Longitude of the place'),
    'amenities': fields.List(fields.String, required=False, description="List of amenities IDs"),
    'photo_url': fields.String(required=False, description='URL of the place photo'),
})

# Model for updating a place
place_update_model = api.model('PlaceUpdate', {
    'title': fields.String(description='Title of the place'),
    'description': fields.String(description='Description of the place'),
    'price': fields.Float(description='Price per night'),
    'latitude': fields.Float(description='Latitude of the place'),
    'longitude': fields.Float(description='Longitude of the place'),
    'amenities': fields.List(fields.String, required=False, description="List of amenities IDs"),
})


def _is_admin():
    claims = get_jwt()
    return claims.get("is_admin", False)


@api.route('/')
class PlaceList(Resource):
    @jwt_required()
    @api.doc(security='Bearer Auth')
    @api.expect(place_create_model, validate=True)
    @api.response(201, 'Place successfully created')
    @api.response(400, 'Invalid input data')
    def post(self):
        """Register a new place"""
        try:
            current_user = get_jwt_identity()
            place_data = api.payload.copy()
            place_data['owner_id'] = current_user

            place = facade.create_place(place_data)

            return {
                "id": place.id,
                "title": place.title,
                "description": place.description,
                "price": place.price,
                "latitude": place.latitude,
                "longitude": place.longitude,
                "owner_id": place.owner.id
            }, 201

        except ValueError as e:
            return {"error": str(e)}, 400

    @api.response(200, 'List of places retrieved successfully')
    def get(self):
        """Retrieve a list of all places"""
        places = facade.get_all_places()

        return [
            {
                "id": p.id,
                "title": p.title,
                "price": p.price,
                "photo_url": p.photo_url,
                "latitude": p.latitude,
                "longitude": p.longitude,
                "owner": {
                    "id": p.owner.id,
                    "first_name": p.owner.first_name,
                    "last_name": p.owner.last_name,
                    "email": p.owner.email
                },
                "amenities": [
                    {
                        "id": a.id,
                        "name": a.name
                    } for a in p.amenities
                ]
            }
            for p in places
        ], 200


@api.route('/<place_id>')
class PlaceResource(Resource):
    @api.response(200, 'Place details retrieved successfully')
    @api.response(404, 'Place not found')
    def get(self, place_id):
        """Get place details by ID"""

        place = facade.get_place(place_id)

        if not place:
            return {"error": "Place not found"}, 404

        return {
            "id": place.id,
            "title": place.title,
            "description": place.description,
            "price": place.price,
            "photo_url": place.photo_url,
            "latitude": place.latitude,
            "longitude": place.longitude,
            "owner": {
                "id": place.owner.id,
                "first_name": place.owner.first_name,
                "last_name": place.owner.last_name,
                "email": place.owner.email
            },
            "amenities": [
                {
                    "id": amenity.id,
                    "name": amenity.name
                }
                for amenity in place.amenities
            ]
        }, 200

    @jwt_required()
    @api.doc(security='Bearer Auth')
    @api.expect(place_update_model, validate=True)
    @api.response(200, 'Place updated successfully')
    @api.response(404, 'Place not found')
    @api.response(400, 'Invalid input data')
    @api.response(403, 'Unauthorized action')
    def put(self, place_id):
        """Update a place's information"""
        place = facade.get_place(place_id)
        if not place:
            return {"error": "Place not found"}, 404

        current_user = get_jwt_identity()
        is_admin = _is_admin()

        if place.owner.id != current_user and not is_admin:
            return {"error": "Unauthorized action"}, 403

        try:
            updated_place = facade.update_place(place_id, api.payload)

            if not updated_place:
                return {"error": "Place not found"}, 404

            return {"message": "Place updated successfully"}, 200

        except ValueError as e:
            return {"error": str(e)}, 400


@api.route('/<place_id>/reviews')
class PlaceReviewList(Resource):
    @api.response(200, 'List of reviews for the place retrieved successfully')
    @api.response(404, 'Place not found')
    def get(self, place_id):
        """Get all reviews for a specific place"""
        reviews = facade.get_reviews_by_place(place_id)
        if reviews is None:
            return {"error": "Place not found"}, 404

        return [
            {
                "id": r.id,
                "text": r.text,
                "rating": r.rating
            }
            for r in reviews
        ], 200


@api.route('/<place_id>/amenities')
class PlaceAmenityList(Resource):
    @api.response(200, 'Amenities for the place retrieved successfully')
    @api.response(404, 'Place not found')
    def get(self, place_id):
        """Get all amenities for a specific place"""
        place = facade.get_place(place_id)
        if not place:
            return {"error": "Place not found"}, 404

        return [
            {
                "id": amenity.id,
                "name": amenity.name
            } for amenity in place.amenities
        ], 200

    @jwt_required()
    @api.doc(security='Bearer Auth')
    @api.expect(api.model('PlaceAmenityUpdate', {
        'amenity_ids': fields.List(fields.String, required=True, description='List of amenity IDs to associate')
    }), validate=True)
    @api.response(200, 'Amenities associated successfully')
    @api.response(404, 'Place or amenity not found')
    @api.response(403, 'Unauthorized action')
    def post(self, place_id):
        """Associate amenities with a specific place"""
        place = facade.get_place(place_id)
        if not place:
            return {"error": "Place not found"}, 404

        current_user = get_jwt_identity()
        is_admin = _is_admin()
        if place.owner.id != current_user and not is_admin:
            return {"error": "Unauthorized action"}, 403

        amenity_ids = api.payload.get('amenity_ids', [])
        try:
            updated_place = facade.add_amenities_to_place(place_id, amenity_ids)
            return {
                "id": updated_place.id,
                "title": updated_place.title,
                "amenities": [
                    {"id": a.id, "name": a.name} for a in updated_place.amenities
                ]
            }, 200
        except ValueError as e:
            return {"error": str(e)}, 404
