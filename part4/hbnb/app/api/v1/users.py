#!/usr/bin/python3
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.services import facade

api = Namespace('users', description='User operations')

# Define the user model for input validation and documentation
user_model = api.model('User', {
    'first_name': fields.String(required=True, description='First name of the user'),
    'last_name': fields.String(required=True, description='Last name of the user'),
    'email': fields.String(required=True, description='Email of the user'),
    'password': fields.String(required=True, description='Password of the user')
})
# Define the user update model
user_update_model = api.model('UserUpdate', {
    'first_name': fields.String(description='First name of the user'),
    'last_name': fields.String(description='Last name of the user')
})
# Define the admin user update model with additional fields for email, password, and is_admin
admin_user_update_model = api.model('AdminUserUpdate', {
    'first_name': fields.String(description='First name of the user'),
    'last_name': fields.String(description='Last name of the user'),
    'email': fields.String(description='Email of the user'),
    'password': fields.String(description='Password of the user'),
    'is_admin': fields.Boolean(description='Admin status')
})


def _is_admin():
    claims = get_jwt()
    return claims.get("is_admin", False)


@api.route('/')
class UserList(Resource):
    @api.expect(user_model, validate=True)
    @api.response(201, 'User successfully created')
    @api.response(400, 'Email already registered')
    @api.response(400, 'Invalid input data')
    def post(self):
        """Register a new user"""
        user_data = api.payload.copy()

        existing_user = facade.get_user_by_email(user_data['email'])
        if existing_user:
            return {'error': 'Email already registered'}, 400

        try:
            password = user_data.pop("password")
            new_user = facade.create_user(user_data, password)

            return {
                "message": "User created successfully",
                'id': new_user.id,
                'first_name': new_user.first_name,
                'last_name': new_user.last_name,
                'email': new_user.email
            }, 201
        except ValueError as e:
            return {'error': str(e)}, 400

    def get(self):
        """Get a list of all users"""
        users = facade.get_all_users()
        return [
            {
                'id': u.id,
                'first_name': u.first_name,
                'last_name': u.last_name,
                'email': u.email,
                'is_admin': u.is_admin
            }
            for u in users
        ], 200


@api.route('/<user_id>')
class UserResource(Resource):
    @api.response(200, 'User details retrieved successfully')
    @api.response(404, 'User not found')
    def get(self, user_id):
        """Get user details by ID"""
        user = facade.get_user(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        return {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email
        }, 200

    @jwt_required()
    @api.doc(security='Bearer Auth')
    @api.response(200, 'User deleted successfully')
    @api.response(403, 'Admin access required')
    @api.response(404, 'User not found')
    def delete(self, user_id):
        """Delete a user (admin only)"""
        if not _is_admin():
            return {'error': 'Admin access required'}, 403
        deleted = facade.delete_user(user_id)
        if not deleted:
            return {'error': 'User not found'}, 404
        return {'message': 'User deleted successfully'}, 200

    @jwt_required()
    @api.doc(security='Bearer Auth')
    @api.expect(admin_user_update_model, validate=False)
    @api.response(200, 'User updated successfully')
    @api.response(404, 'User not found')
    @api.response(400, 'You cannot modify email or password')
    @api.response(400, 'Email is already in use')
    @api.response(403, 'Unauthorized action')
    def put(self, user_id):
        """Update a user's information"""
        current_user = get_jwt_identity()
        is_admin = _is_admin()
        new_data = api.payload.copy()

        # Normal users can only update themselves
        if not is_admin and user_id != current_user:
            return {'error': 'Unauthorized action'}, 403

        # Normal users cannot modify email, password or is_admin
        if not is_admin and ('email' in new_data or 'password' in new_data or 'is_admin' in new_data):
            return {'error': 'You cannot modify email, password or admin status.'}, 400

        # If email is being changed, ensure uniqueness
        email = new_data.get('email')
        if email:
            existing_user = facade.get_user_by_email(email)
            if existing_user and existing_user.id != user_id:
                return {'error': 'Email is already in use'}, 400

        try:
            updated_user = facade.update_user(user_id, new_data, is_admin=is_admin)
            if not updated_user:
                return {'error': 'User not found'}, 404

            return {
                'id': updated_user.id,
                'first_name': updated_user.first_name,
                'last_name': updated_user.last_name,
                'email': updated_user.email
            }, 200

        except ValueError as e:
            return {'error': str(e)}, 400


@api.route('/<user_id>/places')
class UserPlaces(Resource):
    @jwt_required()
    @api.doc(security='Bearer Auth')
    @api.response(200, 'Places retrieved successfully')
    @api.response(403, 'Unauthorized action')
    @api.response(404, 'User not found')
    def get(self, user_id):
        """Get all places owned by a user"""
        current_user = get_jwt_identity()
        is_admin = _is_admin()

        if user_id != current_user and not is_admin:
            return {'error': 'Unauthorized action'}, 403

        user = facade.get_user(user_id)
        if not user:
            return {'error': 'User not found'}, 404

        places = facade.get_all_places()
        user_places = [p for p in places if p.owner.id == user_id]

        return [
            {
                'id': p.id,
                'title': p.title,
                'price': p.price,
                'photos': p.photos,
                'description': p.description,
                'latitude': p.latitude,
                'longitude': p.longitude,
                'amenities': [
                    {'id': a.id, 'name': a.name}
                    for a in p.amenities
                ]
            }
            for p in user_places
        ], 200
