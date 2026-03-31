#!/usr/bin/python3
import unittest
from app import create_app
from app.services import facade


class TestAmenityEndpoints(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        facade.user_repo._storage.clear()
        facade.place_repo._storage.clear()
        facade.review_repo._storage.clear()
        facade.amenity_repo._storage.clear()

        from app.models.user import User
        User.existing_emails.clear()

    def test_create_amenity_valid(self):
        res = self.client.post("/api/v1/amenities/", json={"name": "WiFi"})
        self.assertEqual(res.status_code, 201)

    def test_create_amenity_empty_name(self):
        res = self.client.post("/api/v1/amenities/", json={"name": ""})
        self.assertEqual(res.status_code, 400)

    def test_create_amenity_name_too_long(self):
        res = self.client.post("/api/v1/amenities/", json={"name": "A" * 51})
        self.assertEqual(res.status_code, 400)

    def test_get_amenity_not_found(self):
        res = self.client.get("/api/v1/amenities/not-a-real-id")
        self.assertEqual(res.status_code, 404)


if __name__ == "__main__":
    unittest.main()
