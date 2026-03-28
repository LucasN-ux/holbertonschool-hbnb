#!/usr/bin/python3
import unittest
from app import create_app
from app.services import facade


class TestReviewEndpoints(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
        facade.user_repo._storage.clear()
        facade.place_repo._storage.clear()
        facade.review_repo._storage.clear()
        facade.amenity_repo._storage.clear()

        from app.models.user import User
        User.existing_emails.clear()

        owner = self.client.post("/api/v1/users/", json={
            "first_name": "Owner",
            "last_name": "User",
            "email": "owner@example.com"
        })
        self.owner_id = owner.get_json()["id"]

        reviewer = self.client.post("/api/v1/users/", json={
            "first_name": "Reviewer",
            "last_name": "User",
            "email": "reviewer@example.com"
        })
        self.reviewer_id = reviewer.get_json()["id"]

        place = self.client.post("/api/v1/places/", json={
            "title": "Test Place",
            "description": "For reviews",
            "price": 80.0,
            "latitude": 48.8,
            "longitude": 2.3,
            "owner_id": self.owner_id,
            "amenities": []
        })
        self.place_id = place.get_json()["id"]

    def test_create_review_valid(self):
        res = self.client.post("/api/v1/reviews/", json={
            "text": "Great!",
            "rating": 5,
            "user_id": self.reviewer_id,
            "place_id": self.place_id
        })
        self.assertEqual(res.status_code, 201)

    def test_create_review_empty_text(self):
        res = self.client.post("/api/v1/reviews/", json={
            "text": "",
            "rating": 4,
            "user_id": self.reviewer_id,
            "place_id": self.place_id
        })
        self.assertEqual(res.status_code, 400)

    def test_create_review_rating_min_max(self):
        res = self.client.post("/api/v1/reviews/", json={
            "text": "ok",
            "rating": 1,
            "user_id": self.reviewer_id,
            "place_id": self.place_id
        })
        self.assertEqual(res.status_code, 201)

        res = self.client.post("/api/v1/reviews/", json={
            "text": "great",
            "rating": 5,
            "user_id": self.reviewer_id,
            "place_id": self.place_id
        })
        self.assertEqual(res.status_code, 201)

    def test_create_review_invalid_user(self):
        res = self.client.post("/api/v1/reviews/", json={
            "text": "Ghost",
            "rating": 3,
            "user_id": "fake-user",
            "place_id": self.place_id
        })
        self.assertEqual(res.status_code, 400)

    def test_get_reviews_by_place(self):
        self.client.post("/api/v1/reviews/", json={
            "text": "Great!",
            "rating": 5,
            "user_id": self.reviewer_id,
            "place_id": self.place_id
        })

        res = self.client.get(f"/api/v1/places/{self.place_id}/reviews")
        self.assertEqual(res.status_code, 200)
        self.assertIsInstance(res.get_json(), list)


if __name__ == "__main__":
    unittest.main()
