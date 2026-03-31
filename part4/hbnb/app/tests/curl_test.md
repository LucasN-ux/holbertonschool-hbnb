# cURL TEST

This file contains the cURL test performed to test the v1 of the project

Base URL: http://127.0.0.1:5000  
Swagger: http://127.0.0.1:5000/api/v1/

---

# User

## Testing valid user creation

```bash
curl -i -X POST "http://127.0.0.1:5000/api/v1/users/" \
-H "Content-Type: application/json" \
-d '{
  "first_name":"John",
  "last_name":"Doe",
  "email":"john.doe@example.com"
}'
````

Result (201):

```json
{
  "id": "875bd553-d382-4bac-87e3-a933a7fb7df8",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com"
}
```

---

## Testing invalid user creation

```bash
curl -i -X POST "http://127.0.0.1:5000/api/v1/users/" \
-H "Content-Type: application/json" \
-d '{
  "first_name":"",
  "last_name":"",
  "email":"invalid-email"
}'
```

Result (400):

```json
{
  "error": "Invalid first name"
}
```

---

## Testing get user (not found)

```bash
curl -i "http://127.0.0.1:5000/api/v1/users/fake-id"
```

Result (404):

```json
{
  "error": "User not found"
}
```

---

# Amenity

## Testing valid amenity creation

```bash
curl -i -X POST "http://127.0.0.1:5000/api/v1/amenities/" \
-H "Content-Type: application/json" \
-d '{"name":"WiFi"}'
```

Result (201):

```json
{
  "id": "1c36fd5b-0217-4287-a29d-707a3545824b",
  "name": "WiFi"
}
```

---

## Testing invalid amenity creation

```bash
curl -i -X POST "http://127.0.0.1:5000/api/v1/amenities/" \
-H "Content-Type: application/json" \
-d '{"name":""}'
```

Result (400):

```json
{
  "error": "Invalid amenity name"
}
```

---

## Testing get amenity (not found)

```bash
curl -i "http://127.0.0.1:5000/api/v1/amenities/not-a-real-id"
```

Result (404):

```json
{
  "error": "Amenity not found"
}
```

---

# Place

## Testing valid place creation

```bash
curl -i -X POST "http://127.0.0.1:5000/api/v1/places/" \
-H "Content-Type: application/json" \
-d '{
  "title":"My place",
  "description":"Nice place",
  "price":100,
  "latitude":48.85,
  "longitude":2.35,
  "owner_id":"875bd553-d382-4bac-87e3-a933a7fb7df8",
  "amenities":["1c36fd5b-0217-4287-a29d-707a3545824b"]
}'
```

Result (201):

```json
{
  "id": "2f7aebdb-c609-49c3-b0ce-ca503dfd8c24",
  "title": "My place",
  "description": "Nice place",
  "price": 100.0,
  "latitude": 48.85,
  "longitude": 2.35,
  "owner_id": "875bd553-d382-4bac-87e3-a933a7fb7df8"
}
```

---

## Testing invalid latitude place creation

```bash
curl -i -X POST "http://127.0.0.1:5000/api/v1/places/" \
-H "Content-Type: application/json" \
-d '{
  "title":"Bad lat",
  "description":"Nope",
  "price":100,
  "latitude":100,
  "longitude":2.35,
  "owner_id":"875bd553-d382-4bac-87e3-a933a7fb7df8",
  "amenities":[]
}'
```

Result (400):

```json
{
  "error": "Invalid latitude"
}
```

---

## Testing get place (not found)

```bash
curl -i "http://127.0.0.1:5000/api/v1/places/not-a-real-id"
```

Result (404):

```json
{
  "error": "Place not found"
}
```

---

# Review

## Testing valid review creation

```bash
curl -i -X POST "http://127.0.0.1:5000/api/v1/reviews/" \
-H "Content-Type: application/json" \
-d '{
  "text":"Great place",
  "rating":5,
  "user_id":"875bd553-d382-4bac-87e3-a933a7fb7df8",
  "place_id":"2f7aebdb-c609-49c3-b0ce-ca503dfd8c24"
}'
```

Result (201):

```json
{
  "id": "d945a2a4-3727-43bf-a3b4-c1df5648a1ed",
  "text": "Great place",
  "rating": 5,
  "user_id": "875bd553-d382-4bac-87e3-a933a7fb7df8",
  "place_id": "2f7aebdb-c609-49c3-b0ce-ca503dfd8c24"
}
```

---

## Testing invalid review creation

```bash
curl -i -X POST "http://127.0.0.1:5000/api/v1/reviews/" \
-H "Content-Type: application/json" \
-d '{
  "text":"",
  "rating":5,
  "user_id":"875bd553-d382-4bac-87e3-a933a7fb7df8",
  "place_id":"2f7aebdb-c609-49c3-b0ce-ca503dfd8c24"
}'
```

Result (400):

```json
{
  "error": "Review text is required"
}
```

---

## Testing valid review deletion

```bash
curl -i -X DELETE "http://127.0.0.1:5000/api/v1/reviews/d945a2a4-3727-43bf-a3b4-c1df5648a1ed"
```

Result (200):

```json
{
  "message": "Review deleted successfully"
}
```

---

## Testing get reviews by place

```bash
curl -i "http://127.0.0.1:5000/api/v1/places/2f7aebdb-c609-49c3-b0ce-ca503dfd8c24/reviews"
```

Result (200):

```json
[
  {
    "id": "d945a2a4-3727-43bf-a3b4-c1df5648a1ed",
    "text": "Great place",
    "rating": 5
  }
]
```

