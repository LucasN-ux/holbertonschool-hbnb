# HBnB — Part 2 (Flask-RESTX API)

## Overview
HBnB is a simplified Airbnb-like application. Part 2 implements a layered architecture with:
- **Presentation layer**: REST API built with **Flask** and **Flask-RESTX**
- **Business logic layer**: core models + validation
- **Persistence layer**: **in-memory repository** (to be replaced later by a database with SQL Alchemy)

Swagger documentation is available at:
- `http://127.0.0.1:5000/`

---

## Project Structure
```text
part2/hbnb/
├── app/
│   ├── __init__.py
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── amenities.py
│   │       ├── places.py
│   │       ├── reviews.py
│   │       └── users.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── amenity.py
│   │   ├── base.py
│   │   ├── place.py
│   │   ├── review.py
│   │   └── user.py
│   ├── persistence/
│   │   ├── __init__.py
│   │   └── repository.py
│   ├── services/
│   │   ├── __init__.py
│   │   └── facade.py
│   └── tests/
│       ├── curl_test.md
│       ├── test_amenities.py
│       ├── test_places.py
│       ├── test_reviews.py
│       ├── test_users.py
│       └── unittest.md
├── config.py
├── README.md
├── requirements.txt
└── run.py

````

---

## Architecture

The application follows a **3-layer design**:

* **API (Flask-RESTX)** → receives HTTP requests, returns JSON responses
* **Facade (`HBnBFacade`)** → centralizes business operations and orchestration
* **Repository (InMemoryRepository)** → stores objects in memory

Flow:

```text
API → Facade → Models / Repository
```

---

## Business Models and Validation (Summary)

* **User**

  * `first_name`, `last_name`, `email`: required and non-empty
  * `email`: valid format + unique
* **Amenity**

  * `name`: required, non-empty, max 50 characters
* **Place**

  * `title`: required, non-empty, max 100 characters
  * `price`: must be strictly positive
  * `latitude`: must be between -90 and 90
  * `longitude`: must be between -180 and 180
  * `owner_id`: must reference an existing user
* **Review**

  * `text`: required and non-empty
  * `rating`: integer between 1 and 5
  * `user_id`, `place_id`: must reference existing entities

---

## API Endpoints (v1)

All endpoints are prefixed with `/api/v1`.

### Users

* `POST /users/`
* `GET /users/`
* `GET /users/<user_id>`
* `PUT /users/<user_id>`

### Amenities

* `POST /amenities/`
* `GET /amenities/`
* `GET /amenities/<amenity_id>`
* `PUT /amenities/<amenity_id>`

### Places

* `POST /places/`
* `GET /places/`
* `GET /places/<place_id>`
* `PUT /places/<place_id>`
* `GET /places/<place_id>/reviews`

### Reviews

* `POST /reviews/`
* `GET /reviews/`
* `GET /reviews/<review_id>`
* `PUT /reviews/<review_id>`
* `DELETE /reviews/<review_id>`

---

## Installation

**Prerequisites**
- Python 3.8+
- pip

**Clone the repository:**
```bash
git clone [https://github.com/LucasN-ux/holbertonschool-hbnb.git]
```

**Create a virtual environment (recommended):**
```bash
python3 -m venv venv
source venv/bin/activate
```

**Install dependencies:**
```bash
pip install -r requirements.txt
```

`requirements.txt` includes:

* `flask`
* `flask-restx`

---

## Run the Application

From `part2/hbnb/` run the application with the following command:

```bash
python3 run.py
```

Swagger UI:

* `http://127.0.0.1:5000/api/v1/`

---

## Tests (unittest)

Test files are located in:

* `app/tests/`

Run the full test suite from `part2/hbnb/` with following command:

```bash
python -m unittest discover -s app/tests -p "test_*.py"
```

### Result:

* **25 tests** executed — **OK**

```bash
@AllixRbn ➜ /workspaces/holbertonschool-hbnb/part2/hbnb (dev) $ python -m unittest discover -s app/tests -p "test_*.py"
.........................
----------------------------------------------------------------------
Ran 25 tests in 0.321s

OK
```

## Authors

Lucas Nevano
Allix Robin
