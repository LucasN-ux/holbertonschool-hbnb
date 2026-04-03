# hbnb — Part 4 · Full-Stack Web Application

> *Galactic Habitat Registry — a full-stack lodging platform built with Flask and Vanilla JS.*

Part 4 is the final iteration of the hbnb project. It combines a production-ready REST API (Flask + SQLAlchemy) with a fully interactive frontend (HTML · CSS · Vanilla JS) — no framework, no shortcuts.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Frontend](#frontend)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Authors](#authors)

---

## Overview

hbnb Part 4 delivers a complete web application where users can:

- Browse and search planetary habitats across the galaxy
- Register an account and authenticate via JWT
- Create, edit, and delete their own habitats with multi-photo upload
- Leave mission logs (reviews) on habitats they've visited
- Manage their navigator profile

Administrators get a dedicated control room panel to manage users, habitats, reviews, and amenities — all connected live to the API.

---

## Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Framework | [Flask](https://flask.palletsprojects.com/) |
| REST API | [Flask-RESTX](https://flask-restx.readthedocs.io/) + Swagger UI |
| Authentication | [Flask-JWT-Extended](https://flask-jwt-extended.readthedocs.io/) (Bearer tokens) |
| ORM | [Flask-SQLAlchemy](https://flask-sqlalchemy.palletsprojects.com/) |
| Password hashing | [Flask-Bcrypt](https://flask-bcrypt.readthedocs.io/) |
| CORS | [Flask-CORS](https://flask-cors.readthedocs.io/) |
| Database | SQLite (development) |

### Frontend

| Layer | Technology |
|---|---|
| Markup | HTML5 (semantic) |
| Styling | CSS3 — custom design system, CSS variables, mobile-first |
| Logic | Vanilla JavaScript (ES2020+, Fetch API) |
| Animations | [GSAP 3](https://gsap.com/) + ScrollTrigger |
| Auth storage | Session cookies (JWT) |

---

## Project Structure

```
part4/hbnb/
├── app/
│   ├── __init__.py          # App factory — Flask, CORS, JWT, SQLAlchemy
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py      # POST /api/v1/auth/login
│   │       ├── users.py     # CRUD /api/v1/users
│   │       ├── places.py    # CRUD /api/v1/places
│   │       ├── reviews.py   # CRUD /api/v1/reviews
│   │       ├── amenities.py # CRUD /api/v1/amenities
│   │       └── upload.py    # POST /api/v1/upload (multipart)
│   ├── models/
│   │   ├── base.py          # BaseModel (UUID, timestamps)
│   │   ├── user.py
│   │   ├── place.py
│   │   ├── review.py
│   │   ├── amenity.py
│   │   └── association.py   # place_amenity M2M table
│   ├── services/
│   │   └── facade.py        # Business logic layer (Facade pattern)
│   └── persistence/
│       └── repositories/    # Repository pattern over SQLAlchemy
├── base_files/              # Frontend
│   ├── index.html           # Home — hero, features, explore catalog
│   ├── place.html           # Habitat detail + mission logs
│   ├── login.html           # Access portal + enlistment form
│   ├── my_places.html       # Navigator's registered stations
│   ├── add_place.html       # Register a new habitat
│   ├── edit_place.html      # Modify existing habitat
│   ├── add_review.html      # File a mission log
│   ├── profile.html         # Navigator file
│   ├── admin.html           # Control room (admin only)
│   ├── how_it_works.html    # Mission briefing
│   ├── trust_safety.html    # Galactic protection protocol
│   ├── header.html          # Dynamic header (injected via JS)
│   ├── footer.html          # Dynamic footer
│   ├── scripts.js           # All frontend logic (~1200 lines)
│   ├── styles.css           # Design system (~1900 lines)
│   └── images/
│       └── no_picture.jpg   # Default habitat image
├── sql/
│   ├── schema.sql           # Database DDL
│   └── enter_data.sql       # Seed data
├── config.py                # Flask config (dev/prod)
├── run.py                   # Entry point
└── requirements.txt
```

---

## Database Schema

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│    users    │       │    places    │       │  amenities  │
├─────────────┤       ├──────────────┤       ├─────────────┤
│ id (PK)     │──────▶│ id (PK)      │       │ id (PK)     │
│ first_name  │       │ title        │       │ name        │
│ last_name   │       │ description  │◀──────│             │
│ email       │       │ price        │       └─────────────┘
│ password    │       │ latitude     │         place_amenity
│ is_admin    │       │ longitude    │       ┌─────────────┐
│ created_at  │       │ photos (JSON)│       │ place_id    │
│ updated_at  │       │ owner_id (FK)│       │ amenity_id  │
└─────────────┘       │ created_at   │       └─────────────┘
       │              │ updated_at   │
       │              └──────────────┘
       │                     │
       ▼                     ▼
┌─────────────────────────────────┐
│            reviews              │
├─────────────────────────────────┤
│ id (PK)                         │
│ text                            │
│ rating (1–5)                    │
│ user_id (FK) ─────────────────▶ users
│ place_id (FK) ────────────────▶ places
│ created_at                      │
│ updated_at                      │
└─────────────────────────────────┘
```

**Constraints:**
- `price > 0`, `latitude ∈ [-90, 90]`, `longitude ∈ [-180, 180]`
- `rating ∈ [1, 5]`
- One review per user per place (`UNIQUE user_id, place_id`)
- Cascade deletes on all foreign keys

---

## API Reference

The Swagger UI is available at `http://127.0.0.1:5000/` when the server is running.

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/auth/login` | Get JWT token | ✗ |

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/users/` | List all users | Admin |
| `POST` | `/api/v1/users/` | Create user | ✗ |
| `GET` | `/api/v1/users/<id>` | Get user | JWT |
| `PUT` | `/api/v1/users/<id>` | Update user | Owner / Admin |
| `DELETE` | `/api/v1/users/<id>` | Delete user | Admin |
| `GET` | `/api/v1/users/<id>/places` | Get user's habitats | JWT |

### Habitats (Places)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/places/` | List all habitats | JWT |
| `POST` | `/api/v1/places/` | Create habitat | JWT |
| `GET` | `/api/v1/places/<id>` | Get habitat detail | ✗ |
| `PUT` | `/api/v1/places/<id>` | Update habitat | Owner / Admin |
| `DELETE` | `/api/v1/places/<id>` | Delete habitat | Owner / Admin |

### Reviews

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/places/<id>/reviews` | List mission logs | ✗ |
| `POST` | `/api/v1/reviews/` | File mission log | JWT |
| `PUT` | `/api/v1/reviews/<id>` | Update log | Owner / Admin |
| `DELETE` | `/api/v1/reviews/<id>` | Delete log | Owner / Admin |

### Amenities

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/amenities/` | List systems | ✗ |
| `POST` | `/api/v1/amenities/` | Create system | Admin |
| `PUT` | `/api/v1/amenities/<id>` | Update system | Admin |
| `DELETE` | `/api/v1/amenities/<id>` | Delete system | Admin |

### Upload

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/upload` | Upload photos (multipart) | JWT |

Static files are served at `http://127.0.0.1:5000/uploads/<filename>`.

---

## Frontend

The frontend is a single-page-style multi-file application with zero dependencies (aside from GSAP for animations).

### Key design decisions

- **JWT in session cookie** — `document.cookie = \`token=...; path=/\`` — accessible to JS, cleared on tab close
- **Dynamic header/footer** — injected via `fetch()` + `innerHTML`, avoids duplication across pages
- **Facade pattern mirrored** — `scripts.js` mirrors the backend facade: one function per resource action
- **Mobile-first CSS** — custom design system with CSS variables, breakpoints at 480 / 768 / 1100px
- **GSAP logo animation** — hero wordmark scrolls from full-screen to header position with `ScrollTrigger`

### Pages

| File | Route | Description |
|------|-------|-------------|
| `index.html` | `/` | Hero, features, marquee, explore catalog |
| `place.html` | `/?id=<uuid>` | Habitat detail, gallery, mission logs |
| `login.html` | `/login.html` | Access portal + enlistment (`?register=1` auto-shows register form) |
| `my_places.html` | `/my_places.html` | Navigator's stations (protected) |
| `add_place.html` | `/add_place.html` | Register habitat (protected) |
| `edit_place.html` | `/edit_place.html?id=<uuid>` | Modify habitat (owner / admin) |
| `add_review.html` | `/add_review.html?id=<uuid>` | File mission log (protected) |
| `profile.html` | `/profile.html` | Navigator file (protected) |
| `admin.html` | `/admin.html` | Control room (admin only) |

---

## Getting Started

### Prerequisites

- Python 3.10+
- pip

### Installation

```bash
# Clone the repository
git clone https://github.com/LucasN-ux/holbertonschool-hbnb.git
cd holbertonschool-hbnb/part4/hbnb

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Running the server

```bash
python run.py
```

The API will be available at `http://127.0.0.1:5000`.  
Swagger UI: `http://127.0.0.1:5000/`

### Opening the frontend

Since the frontend uses `fetch()` against `http://127.0.0.1:5000`, open the HTML files through a local server (not `file://`):

```bash
# From base_files/
cd base_files
python3 -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

### Default admin account

```
Email:    admin@hbnb.io
Password: Admin1234!
```

### Seed the database

```bash
sqlite3 instance/development.db < sql/schema.sql
sqlite3 instance/development.db < sql/enter_data.sql
```

---

## Running Tests

```bash
cd part4/hbnb

# Unit tests
python -m pytest app/tests/

# API integration tests (server must be running)
bash app/tests/test_admin_endpoints.sh
python app/tests/test_users.py
python app/tests/test_places.py
python app/tests/test_reviews.py
python app/tests/test_amenities.py
```

---

## Authors

- **Lucas N.** — [@LucasN-ux](https://github.com/LucasN-ux)

*Holberton School — Full-Stack Web Development*
