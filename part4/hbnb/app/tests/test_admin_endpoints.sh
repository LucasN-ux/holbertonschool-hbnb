#!/bin/bash

BASE_URL="http://127.0.0.1:5000"

echo "== Creating normal users =="

USER_A_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Alice",
    "last_name": "User",
    "email": "alice@example.com",
    "password": "alice123"
  }')

echo "User A response: $USER_A_RESPONSE"

USER_B_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Bob",
    "last_name": "User",
    "email": "bob@example.com",
    "password": "bob123"
  }')

echo "User B response: $USER_B_RESPONSE"

USER_A_ID=$(echo "$USER_A_RESPONSE" | jq -r '.id')
USER_B_ID=$(echo "$USER_B_RESPONSE" | jq -r '.id')

echo "USER_A_ID=$USER_A_ID"
echo "USER_B_ID=$USER_B_ID"

echo
echo "== Logging in users =="

ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }')

echo "Admin login response: $ADMIN_LOGIN"

USER_A_LOGIN=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "alice123"
  }')

echo "User A login response: $USER_A_LOGIN"

USER_B_LOGIN=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bob@example.com",
    "password": "bob123"
  }')

echo "User B login response: $USER_B_LOGIN"

ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | jq -r '.access_token')
USER_A_TOKEN=$(echo "$USER_A_LOGIN" | jq -r '.access_token')
USER_B_TOKEN=$(echo "$USER_B_LOGIN" | jq -r '.access_token')

echo
echo "== Tokens loaded =="

echo
echo "== Test: normal user cannot create amenity =="

curl -i -X POST "$BASE_URL/api/v1/amenities/" \
  -H "Authorization: Bearer $USER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Pool"}'

echo
echo
echo "== Test: admin creates amenity =="

AMENITY_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/amenities/" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Pool"}')

echo "Amenity response: $AMENITY_RESPONSE"

AMENITY_ID=$(echo "$AMENITY_RESPONSE" | jq -r '.id')
echo "AMENITY_ID=$AMENITY_ID"

echo
echo "== Test: user A creates a place =="

PLACE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/places/" \
  -H "Authorization: Bearer $USER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Alice Place\",
    \"description\": \"Nice place\",
    \"price\": 100.0,
    \"latitude\": 45.0,
    \"longitude\": 3.0,
    \"amenities\": [\"$AMENITY_ID\"]
  }")

echo "Place response: $PLACE_RESPONSE"

PLACE_ID=$(echo "$PLACE_RESPONSE" | jq -r '.id')
echo "PLACE_ID=$PLACE_ID"

echo
echo "== Test: user B cannot update Alice's place =="

curl -i -X PUT "$BASE_URL/api/v1/places/$PLACE_ID" \
  -H "Authorization: Bearer $USER_B_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Hacked title"}'

echo
echo
echo "== Test: admin can update Alice's place =="

curl -i -X PUT "$BASE_URL/api/v1/places/$PLACE_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Admin updated title"}'

echo
echo
echo "== Test: owner cannot review own place =="

curl -i -X POST "$BASE_URL/api/v1/reviews/" \
  -H "Authorization: Bearer $USER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"text\": \"My own place is great\",
    \"rating\": 5,
    \"place_id\": \"$PLACE_ID\"
  }"

echo
echo
echo "== Test: user B reviews Alice's place =="

REVIEW_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/reviews/" \
  -H "Authorization: Bearer $USER_B_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"text\": \"Great place!\",
    \"rating\": 5,
    \"place_id\": \"$PLACE_ID\"
  }")

echo "Review response: $REVIEW_RESPONSE"

REVIEW_ID=$(echo "$REVIEW_RESPONSE" | jq -r '.id')
echo "REVIEW_ID=$REVIEW_ID"

echo
echo "== Test: same user cannot review same place twice =="

curl -i -X POST "$BASE_URL/api/v1/reviews/" \
  -H "Authorization: Bearer $USER_B_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"text\": \"Second review\",
    \"rating\": 4,
    \"place_id\": \"$PLACE_ID\"
  }"

echo
echo
echo "== Test: user A cannot update Bob's review =="

curl -i -X PUT "$BASE_URL/api/v1/reviews/$REVIEW_ID" \
  -H "Authorization: Bearer $USER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "Should fail"}'

echo
echo
echo "== Test: admin can update Bob's review =="

curl -i -X PUT "$BASE_URL/api/v1/reviews/$REVIEW_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "Admin edited this", "rating": 3}'

echo
echo
echo "== Test: user A cannot delete Bob's review =="

curl -i -X DELETE "$BASE_URL/api/v1/reviews/$REVIEW_ID" \
  -H "Authorization: Bearer $USER_A_TOKEN"

echo
echo
echo "== Test: admin can delete Bob's review =="

curl -i -X DELETE "$BASE_URL/api/v1/reviews/$REVIEW_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

echo
echo
echo "== Test: user A can update own first name =="

curl -i -X PUT "$BASE_URL/api/v1/users/$USER_A_ID" \
  -H "Authorization: Bearer $USER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"first_name": "AliceUpdated"}'

echo
echo
echo "== Test: user A cannot change own email =="

curl -i -X PUT "$BASE_URL/api/v1/users/$USER_A_ID" \
  -H "Authorization: Bearer $USER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "newalice@example.com"}'

echo
echo
echo "== Test: user A cannot modify Bob =="

curl -i -X PUT "$BASE_URL/api/v1/users/$USER_B_ID" \
  -H "Authorization: Bearer $USER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"first_name": "Hacked"}'

echo
echo
echo "== Test: admin can modify Alice's email =="

curl -i -X PUT "$BASE_URL/api/v1/users/$USER_A_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "alice_new@example.com"}'

echo
echo
echo "== Test: admin can modify Alice's password =="

curl -i -X PUT "$BASE_URL/api/v1/users/$USER_A_ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password": "newalice123"}'

echo
echo
echo "== Test: login with new Alice credentials =="

curl -i -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice_new@example.com",
    "password": "newalice123"
  }'

echo
echo
echo "== Test: public places list =="

curl -i -X GET "$BASE_URL/api/v1/places/"

echo
echo
echo "== Test: public place details =="

curl -i -X GET "$BASE_URL/api/v1/places/$PLACE_ID"
