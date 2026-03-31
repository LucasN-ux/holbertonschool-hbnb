# Tests by unittest

This document describes the tests performed for the HBnB application, covering the users, amenities, places and reviews endpoints.

## Tools and Technologies

- Python 3.12  
- Flask and Flask-RESTX for the API  
- unittest for unit and integration testing  
- Flask test client  

Tests are executed from the `part2/hbnb` directory with:

```bash
python -m unittest discover -s app/tests -p "test_*.py"
```
## Test File Structure

The tests are divided into four files corresponding to the API namespaces:

app/tests/test_users.py: tests for the /users/ endpoints

app/tests/test_amenities.py: tests for the /amenities/ endpoints

app/tests/test_places.py: tests for the /places/ endpoints

app/tests/test_reviews.py: tests for the /reviews/ endpoints

## Types of Tests Performed

### Creation (POST)

Verifies that a new object is created successfully and returns an ID.

Also checks validation rules such as:

Empty or invalid fields

Duplicate email (User)

Invalid latitude or owner (Place)

Empty text or invalid references (Review)

Invalid inputs correctly return 400 Bad Request.

### Retrieval (GET)

Verifies that:

Lists of objects are returned correctly

Individual objects can be retrieved by ID

Non-existent resources return 404 Not Found

### Update (PUT)

Verifies that:

Existing objects can be updated

Updating a non-existent object returns 404

Invalid update data returns 400

### Deletion (DELETE – Reviews)

Verifies that:

A review can be deleted

Deleting a non-existent review returns 404

Validation Coverage

Model-level validation ensures:

User

first_name and last_name are not empty

email format is valid

email uniqueness is enforced

Amenity

name is not empty

name length does not exceed 50 characters

Place

title is not empty

price is positive

latitude ∈ [-90, 90]

longitude ∈ [-180, 180]

owner must exist

Review

text is not empty

rating is between 1 and 5

user_id and place_id reference existing entities

## Results

All unit tests pass successfully:

```bash
@AllixRbn ➜ /workspaces/holbertonschool-hbnb/part2/hbnb (dev) $ python -m unittest discover -s app/tests -p "test_*.py"
.........................
----------------------------------------------------------------------
Ran 25 tests in 0.321s

OK

Total tests executed: 25
All tests passed: 25/25
```

## Conclusion

The endpoints correctly handle:

Object creation and retrieval

Input validation

Error handling (400 and 404 cases)

Update and deletion operations

The application behaves according to the project specifications.
