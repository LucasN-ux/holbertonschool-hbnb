#!/usr/bin/python3
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt
from app.services import facade

api = Namespace('amenities', description='Amenity operations')

# Define the amenity model for input validation and documentation
amenity_model = api.model('Amenity', {
    'name': fields.String(required=True, description='Name of the amenity')
})


def _is_admin():
    claims = get_jwt()
    return claims.get("is_admin", False)


@api.route('/')
class AmenityList(Resource):
    @jwt_required()
    @api.doc(security='Bearer Auth')
    @api.expect(amenity_model)
    @api.response(201, 'Amenity successfully created')
    @api.response(400, 'Invalid input data')
    @api.response(403, 'Unauthorized action')
    def post(self):
        """Register a new amenity"""
        if not _is_admin():
            return {"error": "Unauthorized action"}, 403
        try:
            amenity = facade.create_amenity(api.payload)
            return {"id": amenity.id, "name": amenity.name}, 201
        except ValueError as e:
            return {"error": str(e)}, 400

    @api.response(200, 'List of amenities retrieved successfully')
    def get(self):
        """Retrieve a list of all amenities"""
        amenities = facade.get_all_amenities()
        return [{"id": a.id, "name": a.name} for a in amenities], 200


@api.route('/<amenity_id>')
class AmenityResource(Resource):
    @api.response(200, 'Amenity details retrieved successfully')
    @api.response(404, 'Amenity not found')
    def get(self, amenity_id):
        """Get amenity details by ID"""
        amenity = facade.get_amenity(amenity_id)
        if not amenity:
            return {"error": "Amenity not found"}, 404
        return {"id": amenity.id, "name": amenity.name}, 200

    @jwt_required()
    @api.doc(security='Bearer Auth')
    @api.expect(amenity_model)
    @api.response(200, 'Amenity updated successfully')
    @api.response(404, 'Amenity not found')
    @api.response(400, 'Invalid input data')
    @api.response(403, 'Unauthorized action')
    def put(self, amenity_id):
        """Update an amenity's information"""
        if not _is_admin():
            return {"error": "Unauthorized action"}, 403
        try:
            amenity = facade.update_amenity(amenity_id, api.payload)
            if not amenity:
                return {"error": "Amenity not found"}, 404
            return {"id": amenity.id, "name": amenity.name}, 200
        except ValueError as e:
            return {"error": str(e)}, 400
