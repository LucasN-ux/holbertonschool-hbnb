#!/usr/bin/python3
import unittest
from app import create_app
from app.services import facade


class TestPlaceEndpoints(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        facade.user_repo._storage.clear()
        facade.place_repo._storage.clear()
        facade.review_repo._storage.clear()
        facade.amenity_repo._storage.clear()

        from app.models.user import User
        User.existing_emails.clear()

        res = self.client.post("/api/v1/users/", json={
            "first_name": "Owner",
            "last_name": "User",
            "email": "owner@example.com"
        })
        self.owner_id = res.get_json()["id"]

        res = self.client.post("/api/v1/amenities/", json={"name": "WiFi"})
        self.amenity_id = res.get_json()["id"]

    def test_create_place_valid(self):
        res = self.client.post("/api/v1/places/", json={
            "title": "Place",
            "description": "Test",
            "price": 100.0,
            "latitude": 48.0,
            "longitude": 2.0,
            "owner_id": self.owner_id,
            "amenities": [self.amenity_id]
        })
        self.assertEqual(res.status_code, 201)

    def test_create_place_invalid_latitude(self):
        res = self.client.post("/api/v1/places/", json={
            "title": "Bad lat",
            "description": "Test",
            "price": 100.0,
            "latitude": 100.0,
            "longitude": 2.0,
            "owner_id": self.owner_id,
            "amenities": []
        })
        self.assertEqual(res.status_code, 400)

    def test_create_place_invalid_owner(self):
        res = self.client.post("/api/v1/places/", json={
            "title": "No owner",
            "description": "Test",
            "price": 100.0,
            "latitude": 48.0,
            "longitude": 2.0,
            "owner_id": "fake-id",
            "amenities": []
        })
        self.assertEqual(res.status_code, 400)

    def test_create_place_lat_boundary_valid(self):
        res = self.client.post("/api/v1/places/", json={
            "title": "North",
            "description": "Edge",
            "price": 50.0,
            "latitude": 90.0,
            "longitude": 0.0,
            "owner_id": self.owner_id,
            "amenities": []
        })
        self.assertEqual(res.status_code, 201)

    def test_get_place_not_found(self):
        res = self.client.get("/api/v1/places/not-a-real-id")
        self.assertEqual(res.status_code, 404)


if __name__ == "__main__":
    unittest.main()
