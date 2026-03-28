#!/usr/bin/python3
import unittest
from app import create_app
from app.services import facade


class TestUserEndpoints(unittest.TestCase):
    """Tests for User API endpoints"""

    def setUp(self):
        """Create app and test client before each test"""
        self.app = create_app()
        self.client = self.app.test_client()
        facade.user_repo._storage.clear()
        facade.place_repo._storage.clear()
        facade.review_repo._storage.clear()
        facade.amenity_repo._storage.clear()

        from app.models.user import User
        User.existing_emails.clear()

    def test_create_user(self):
        """Test creating a valid user"""
        response = self.client.post('/api/v1/users/', json={
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com"
        })
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertIn("id", data)
        self.assertEqual(data["first_name"], "John")
        self.assertEqual(data["last_name"], "Doe")
        self.assertEqual(data["email"], "john.doe@example.com")

    def test_create_user_empty_first_name(self):
        """Test creating a user with empty first_name -> 400"""
        response = self.client.post('/api/v1/users/', json={
            "first_name": "",
            "last_name": "Doe",
            "email": "empty@example.com"
        })
        self.assertEqual(response.status_code, 400)

    def test_create_user_empty_last_name(self):
        """Test creating a user with empty last_name -> 400"""
        response = self.client.post('/api/v1/users/', json={
            "first_name": "John",
            "last_name": "",
            "email": "empty2@example.com"
        })
        self.assertEqual(response.status_code, 400)

    def test_create_user_invalid_email(self):
        """Test creating a user with invalid email format -> 400"""
        response = self.client.post('/api/v1/users/', json={
            "first_name": "John",
            "last_name": "Doe",
            "email": "invalid-email"
        })
        self.assertEqual(response.status_code, 400)

    def test_create_user_duplicate_email(self):
        """Test creating a user with an already registered email -> 400"""
        # Create 1st user
        self.client.post('/api/v1/users/', json={
            "first_name": "John",
            "last_name": "Doe",
            "email": "duplicate@example.com"
        })
        # Create 2nd user with same email as 1st user
        response = self.client.post('/api/v1/users/', json={
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "duplicate@example.com"
        })
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn("error", data)

    def test_create_user_name_too_long(self):
        """Test creating a user with first_name > 50 chars -> 400"""
        response = self.client.post('/api/v1/users/', json={
            "first_name": "A" * 51,
            "last_name": "Doe",
            "email": "toolong@example.com"
        })
        self.assertEqual(response.status_code, 400)

    def test_get_user_by_id(self):
        """Test retrieving an existing user by ID"""
        # Create user
        create_response = self.client.post('/api/v1/users/', json={
            "first_name": "Alice",
            "last_name": "Smith",
            "email": "alice@example.com"
        })
        user_id = create_response.get_json()["id"]

        # Get user
        response = self.client.get(f'/api/v1/users/{user_id}')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["first_name"], "Alice")
        self.assertEqual(data["email"], "alice@example.com")

    def test_get_user_not_found(self):
        """Test retrieving a user with a non-existent ID -> 404"""
        response = self.client.get('/api/v1/users/nonexistent-id-12345')
        self.assertEqual(response.status_code, 404)

    def test_get_all_users(self):
        """Test listing all users"""
        # Create 1st user
        self.client.post('/api/v1/users/', json={
            "first_name": "User1",
            "last_name": "Test",
            "email": "user1@example.com"
        })
        # Create 2nd user
        self.client.post('/api/v1/users/', json={
            "first_name": "User2",
            "last_name": "Test",
            "email": "user2@example.com"
        })

        response = self.client.get('/api/v1/users/')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 2)

    def test_update_user(self):
        """Test updating an existing user"""
        # Create user
        create_response = self.client.post('/api/v1/users/', json={
            "first_name": "Bob",
            "last_name": "Brown",
            "email": "bob@example.com"
        })
        user_id = create_response.get_json()["id"]

        # Update user
        response = self.client.put(f'/api/v1/users/{user_id}', json={
            "first_name": "Bobby",
            "last_name": "Brown",
            "email": "bob@example.com"
        })
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["first_name"], "Bobby")

    def test_update_user_not_found(self):
        """Test updating a non-existent user -> 404"""
        response = self.client.put('/api/v1/users/nonexistent-id', json={
            "first_name": "Ghost",
            "last_name": "User",
            "email": "ghost@example.com"
        })
        self.assertEqual(response.status_code, 404)


if __name__ == '__main__':
    unittest.main()
