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
- **Book habitats** and track reservation status (pending / confirmed / rejected)
- **Manage incoming booking requests** as a habitat owner
- Manage their navigator profile (edit name, delete account)

Administrators get a dedicated control room panel to manage users, habitats, reviews, and amenities — all connected live to the API.

The platform is fully **RGPD/GDPR compliant**: cookie consent banner, privacy policy page, and right to erasure from the navigator profile.

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
│   │       ├── auth.py          # POST /api/v1/auth/login
│   │       ├── users.py         # CRUD /api/v1/users
│   │       ├── places.py        # CRUD /api/v1/places
│   │       ├── reviews.py       # CRUD /api/v1/reviews
│   │       ├── amenities.py     # CRUD /api/v1/amenities
│   │       ├── reservations.py  # Reservation lifecycle endpoints
│   │       └── upload.py        # POST /api/v1/upload (multipart)
│   ├── models/
│   │   ├── base.py          # BaseModel (UUID, timestamps)
│   │   ├── user.py
│   │   ├── place.py         # photos stored as JSON array
│   │   ├── review.py
│   │   ├── amenity.py
│   │   ├── reservation.py   # Reservation model (guest, place, dates, status)
│   │   └── association.py   # place_amenity M2M table
│   ├── services/
│   │   └── facade.py        # Business logic layer (Facade pattern)
│   └── persistence/
│       └── repositories/    # Repository pattern over SQLAlchemy
├── base_files/              # Frontend (zero dependencies except GSAP CDN)
│   ├── index.html           # Home — hero, features, marquee, explore catalog
│   ├── place.html           # Habitat detail + gallery + mission logs + booking
│   ├── login.html           # Access portal + enlistment form
│   ├── register.html        # Enlistment form (standalone)
│   ├── my_places.html       # Navigator's registered stations
│   ├── my_reservations.html # My bookings + incoming requests (owner)
│   ├── add_place.html       # Register a new habitat
│   ├── edit_place.html      # Modify existing habitat
│   ├── add_review.html      # File a mission log
│   ├── profile.html         # Navigator file + danger zone (delete account)
│   ├── admin.html           # Control room (admin only)
│   ├── how_it_works.html    # Mission briefing
│   ├── trust_safety.html    # Galactic protection protocol
│   ├── privacy.html         # Privacy policy (RGPD/GDPR)
│   ├── header.html          # Dynamic header (injected via JS)
│   ├── footer.html          # Dynamic footer
│   ├── scripts.js           # All frontend logic (~1675 lines)
│   ├── styles.css           # Design system (~2358 lines)
│   └── images/
│       └── no_picture.jpg   # Default habitat image
├── sql/
│   ├── schema.sql           # Database DDL
│   └── enter_data.sql       # Seed data (admin + sample users, places, amenities)
├── seed_data.py             # Python seeder — 10 users + 20 diverse places
├── config.py                # Flask config (dev/prod)
├── run.py                   # Entry point
└── requirements.txt
```

---

## Database Schema

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
│    users    │       │      places      │       │  amenities  │
├─────────────┤       ├──────────────────┤       ├─────────────┤
│ id (PK)     │──────▶│ id (PK)          │       │ id (PK)     │
│ first_name  │       │ title            │       │ name        │
│ last_name   │       │ description      │◀──────│             │
│ email       │       │ price            │       └─────────────┘
│ password    │       │ latitude         │         place_amenity
│ is_admin    │       │ longitude        │       ┌─────────────┐
│ created_at  │       │ photos (JSON)    │       │ place_id    │
│ updated_at  │       │ owner_id (FK)    │       │ amenity_id  │
└─────────────┘       │ created_at       │       └─────────────┘
       │              │ updated_at       │
       │              └──────────────────┘
       │                     │
       ▼                     ▼
┌─────────────────────────────────┐     ┌──────────────────────────────┐
│            reviews              │     │         reservations          │
├─────────────────────────────────┤     ├──────────────────────────────┤
│ id (PK)                         │     │ id (PK)                      │
│ text                            │     │ guest_id (FK) ─────────────▶ users
│ rating (1–5)                    │     │ place_id (FK) ─────────────▶ places
│ user_id (FK) ─────────────────▶ users │ check_in (DATE)             │
│ place_id (FK) ────────────────▶ places│ check_out (DATE)            │
│ created_at                      │     │ total_price                  │
│ updated_at                      │     │ status (pending/confirmed/   │
└─────────────────────────────────┘     │         rejected/cancelled)  │
                                        │ created_at                   │
                                        │ updated_at                   │
                                        └──────────────────────────────┘
```

**Constraints:**
- `price > 0`, `latitude ∈ [-90, 90]`, `longitude ∈ [-180, 180]`
- `rating ∈ [1, 5]`
- One review per user per place (`UNIQUE user_id, place_id`)
- `check_out > check_in` enforced at DB and business logic level
- No overlap with confirmed reservations for the same place
- A habitat owner cannot book their own place
- Cascade deletes on all foreign keys

---

## API Reference

The Swagger UI is available at `http://127.0.0.1:5000/` when the server is running.

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/auth/login` | Get JWT token (+ first_name, last_name in claims) | ✗ |

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/users/` | List all users | Admin |
| `POST` | `/api/v1/users/` | Create user | ✗ |
| `GET` | `/api/v1/users/<id>` | Get user | JWT |
| `PUT` | `/api/v1/users/<id>` | Update user | Owner / Admin |
| `DELETE` | `/api/v1/users/<id>` | Delete user + all their data | Owner / Admin |
| `GET` | `/api/v1/users/<id>/places` | Get user's habitats | JWT |

### Habitats (Places)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/places/` | List all habitats | ✗ |
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

### Reservations

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/reservations/` | Book a habitat | JWT |
| `GET` | `/api/v1/reservations/mine` | My bookings (as guest) | JWT |
| `GET` | `/api/v1/reservations/incoming` | Incoming requests (as owner) | JWT |
| `GET` | `/api/v1/reservations/<id>` | Get reservation detail | JWT |
| `DELETE` | `/api/v1/reservations/<id>` | Cancel reservation | Owner (guest) |
| `PUT` | `/api/v1/reservations/<id>/confirm` | Confirm reservation | Place owner |
| `PUT` | `/api/v1/reservations/<id>/reject` | Reject reservation | Place owner |

**Reservation rules:**
- A habitat owner cannot book their own place
- `check_in` must be in the future, `check_out > check_in`
- Only `confirmed` reservations block new bookings for the same dates
- `total_price` is calculated automatically: `nights × price_per_night`

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
| `POST` | `/api/v1/upload` | Upload photos (multipart, up to 10) | JWT |

Static files are served at `http://127.0.0.1:5000/uploads/<filename>`.

---

## Frontend

The frontend is a multi-page application with zero runtime dependencies (aside from GSAP loaded from CDN for animations).

### Key design decisions

- **JWT in session cookie** — `document.cookie = \`token=...; path=/\`` — accessible to JS, cleared on tab close
- **Dynamic header/footer** — injected via `fetch()` + `innerHTML`, avoids duplication across pages
- **Username in header** — `first_name` is embedded in the JWT `additional_claims` and displayed in the nav dropdown
- **Body-appended dropdown** — the nav dropdown is moved to `document.body` via JS to escape the header's stacking context, positioned dynamically with `getBoundingClientRect()`
- **Mobile-first CSS** — custom design system with CSS variables, breakpoints at 480 / 768 / 1100px
- **GSAP logo animation** — hero wordmark scrolls from full-screen to header position with `ScrollTrigger`
- **RGPD compliance** — cookie consent banner (localStorage), privacy policy page (`privacy.html`), right to erasure in navigator profile

### Pages

| File | Route | Description |
|------|-------|-------------|
| `index.html` | `/` | Hero, features, dual-row marquee carousel, explore catalog |
| `place.html` | `/place.html?id=<uuid>` | Habitat detail, photo gallery, mission logs, booking form |
| `login.html` | `/login.html` | Access portal + enlistment (`?register=1` auto-shows register form) |
| `register.html` | `/register.html` | Enlistment form (standalone) |
| `my_places.html` | `/my_places.html` | Navigator's stations (protected) |
| `my_reservations.html` | `/my_reservations.html` | My bookings + incoming requests with confirm/reject actions |
| `add_place.html` | `/add_place.html` | Register habitat (protected) |
| `edit_place.html` | `/edit_place.html?id=<uuid>` | Modify habitat (owner / admin) |
| `add_review.html` | `/add_review.html?id=<uuid>` | File mission log (protected) |
| `profile.html` | `/profile.html` | Navigator file — edit name, danger zone (delete account) |
| `admin.html` | `/admin.html` | Control room — full CRUD on all entities (admin only) |
| `how_it_works.html` | `/how_it_works.html` | Mission briefing |
| `trust_safety.html` | `/trust_safety.html` | Galactic protection protocol |
| `privacy.html` | `/privacy.html` | Privacy policy (RGPD/GDPR, in French) |

### Marquee Carousel

The homepage features a **dual-row animated marquee** of featured habitats:
- Two rows scrolling in opposite directions (65s left / 80s right) for a dynamic effect
- Portrait cards (240×320px) with a hover lift + scale animation
- Price pill badge overlaid on each card
- Dark background (`#0a0a0a`) for an immersive space atmosphere

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
# From part4/hbnb/base_files/
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

**Option 1 — SQL seed files:**
```bash
sqlite3 instance/development.db < sql/schema.sql
sqlite3 instance/development.db < sql/enter_data.sql
```

**Option 2 — Python seeder** (10 users + 20 diverse places with photos):
```bash
# With the server running
python seed_data.py
```

Seeded users all have the password `string`. Example accounts:
```
atlas.vega@galactic.io   / string
nova.rin@galactic.io     / string
zara.orin@galactic.io    / string
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

- **Lucas Nevano** — [@LucasN-ux](https://github.com/LucasN-ux)

*Holberton School — Full-Stack Web Development · 2025–2026*
