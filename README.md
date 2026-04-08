# holbertonschool-hbnb

> *Galactic Habitat Registry — a full-stack Airbnb-inspired web application built progressively across four parts.*

**hbnb** (Habitat Beyond New Borders) is an interstellar lodging platform where explorers across the universe can discover, list, and review extraordinary habitats. Built as a Holberton School end-to-end project, it covers every layer of modern web development: system design, backend API, database persistence, authentication, reservations, and a complete frontend.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Part 1 — Technical Documentation](#part-1--technical-documentation)
- [Part 2 — REST API (In-Memory)](#part-2--rest-api-in-memory)
- [Part 3 — Database & Authentication](#part-3--database--authentication)
- [Part 4 — Full-Stack Application](#part-4--full-stack-application)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Authors](#authors)

---

## Project Overview

| Part | Focus | Stack |
|------|-------|-------|
| [Part 1](#part-1--technical-documentation) | Architecture & Design | UML · Diagrams |
| [Part 2](#part-2--rest-api-in-memory) | REST API — In-Memory | Python · Flask · Flask-RESTX |
| [Part 3](#part-3--database--authentication) | Database & Auth | SQLAlchemy · Flask-JWT-Extended · BCrypt |
| [Part 4](#part-4--full-stack-application) | Full-Stack | Flask · SQLAlchemy · HTML · CSS · Vanilla JS · GSAP |

Each part is **self-contained** and builds directly on the previous one. The codebase evolves from a pure design specification to a deployable, production-ready web application.

---

## Architecture

hbnb follows a strict **three-layer architecture** throughout all parts:

```
┌──────────────────────────────────────────┐
│           Presentation Layer             │
│   REST API (Flask-RESTX) · Frontend JS   │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│          Business Logic Layer            │
│         Facade Pattern · Models          │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│           Persistence Layer              │
│   In-Memory (Part 2) · SQLAlchemy (3+4)  │
└──────────────────────────────────────────┘
```

The **Facade pattern** is the central design decision — all API routes talk to a single `HBnBFacade` object, never directly to models or repositories. This decoupling made it possible to swap the entire persistence layer (in-memory → SQLAlchemy) between Part 2 and Part 3 without touching the API layer.

---

## Part 1 — Technical Documentation

**Goal:** Define the full architecture before writing a single line of code.

Part 1 is a complete technical specification document covering the system design, entity relationships, and interaction flows — the blueprint for everything that follows.

### Deliverables

| Document | Description |
|----------|-------------|
| High-Level Package Diagram | Three-layer architecture (Presentation → Business Logic → Persistence) |
| Detailed Class Diagram | All entities (User, Place, Review, Amenity) with attributes, methods, relationships |
| Sequence Diagram — User Registration | End-to-end flow from HTTP request to persistence |
| Sequence Diagram — Place Creation | Owner validation, model creation, repository storage |
| Sequence Diagram — Review Submission | Auth check, duplicate prevention, persistence |
| Sequence Diagram — Fetching Places | Query, serialization, response |
| Compiled PDF | Full technical documentation bundled |

### Project Structure

```
part1/
├── High_Package_Diagram.png
├── High_Class_Diagram.png
├── Sequence-Diagram-User_Registration.png
├── Sequence-Diagram-Place_Creation.png
├── Sequence-Diagram-Review_Submission.png
├── Sequence-Diagram-Fetching_a_List_of_Places.png
└── Compiled_HBNB_Technical_Documentation.pdf
```

---

## Part 2 — REST API (In-Memory)

**Goal:** Implement the business logic and API layer — no database yet.

Part 2 translates the Part 1 architecture into a working REST API. Data lives in memory (Python dicts) via a repository pattern, making it easy to swap for a real database in Part 3.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Flask |
| REST API | Flask-RESTX + Swagger UI |
| Storage | In-memory repositories (Python dicts) |
| Runtime | Python 3.10+ |

### Key Features

- Full CRUD for **Users**, **Places**, **Reviews**, and **Amenities**
- Input validation at the API layer via Flask-RESTX models
- **Facade pattern** — single entry point for all business logic
- **Repository pattern** — storage layer abstracted behind an interface
- Auto-generated **Swagger UI** at `/`
- UUID-based identifiers, automatic `created_at` / `updated_at` timestamps

### Project Structure

```
part2/hbnb/
├── app/
│   ├── __init__.py              # App factory
│   ├── api/
│   │   └── v1/
│   │       ├── users.py         # CRUD /api/v1/users
│   │       ├── places.py        # CRUD /api/v1/places
│   │       ├── reviews.py       # CRUD /api/v1/reviews
│   │       └── amenities.py     # CRUD /api/v1/amenities
│   ├── models/
│   │   ├── base_model.py        # BaseModel (UUID, timestamps)
│   │   ├── user.py
│   │   ├── place.py
│   │   ├── review.py
│   │   └── amenity.py
│   ├── services/
│   │   └── facade.py            # HBnBFacade — business logic entry point
│   └── persistence/
│       └── repository.py        # In-memory repository
├── config.py
├── run.py
└── requirements.txt
```

### Running Part 2

```bash
cd part2/hbnb
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python run.py
# → API:     http://127.0.0.1:5000
# → Swagger: http://127.0.0.1:5000/
```

---

## Part 3 — Database & Authentication

**Goal:** Replace in-memory storage with a real database and add secure authentication.

Part 3 introduces persistent storage (SQLite via SQLAlchemy), password hashing (BCrypt), and stateless JWT authentication. The Facade pattern from Part 2 is fully preserved — only the persistence layer changes.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Flask |
| REST API | Flask-RESTX + Swagger UI |
| Authentication | Flask-JWT-Extended (Bearer tokens) |
| ORM | Flask-SQLAlchemy |
| Password hashing | Flask-Bcrypt |
| Database | SQLite (development) |
| Runtime | Python 3.10+ |

### Key Features

- **SQLAlchemy ORM** — all models mapped to relational tables with proper column types
- **Flask-JWT-Extended** — JWT tokens with `is_admin` claim in `additional_claims`
- **Flask-Bcrypt** — passwords hashed before storage, never stored in plaintext
- **Role-based access control** — admin vs. regular user permissions enforced per endpoint
- **Repository pattern** — `SQLAlchemyRepository` replaces in-memory dict, zero changes to Facade
- **Database schema** — SQL DDL with constraints, foreign keys, and cascade deletes
- **Seed data** — `enter_data.sql` for initial population including a default admin account

### Database Schema

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
│ created_at  │       │ owner_id (FK)│       │ place_id    │
│ updated_at  │       │ created_at   │       │ amenity_id  │
└─────────────┘       │ updated_at   │       └─────────────┘
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

### Project Structure

```
part3/hbnb/
├── app/
│   ├── __init__.py              # App factory — Flask, JWT, BCrypt, SQLAlchemy
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py          # POST /api/v1/auth/login
│   │       ├── users.py         # CRUD + role checks
│   │       ├── places.py        # CRUD + owner/admin checks
│   │       ├── reviews.py       # CRUD + owner/admin checks
│   │       └── amenities.py     # CRUD (admin-only write)
│   ├── models/
│   │   ├── base.py              # BaseModel (UUID, timestamps)
│   │   ├── user.py              # SQLAlchemy model + BCrypt
│   │   ├── place.py
│   │   ├── review.py
│   │   ├── amenity.py
│   │   └── association.py       # place_amenity M2M table
│   ├── services/
│   │   └── facade.py            # Facade (now hits SQLAlchemy repos)
│   └── persistence/
│       └── repositories/        # SQLAlchemy repository implementations
├── sql/
│   ├── schema.sql               # Database DDL
│   └── enter_data.sql           # Seed data (admin account + sample data)
├── config.py
├── run.py
└── requirements.txt
```

### Running Part 3

```bash
cd part3/hbnb
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python run.py
# → API:     http://127.0.0.1:5000
# → Swagger: http://127.0.0.1:5000/
```

---

## Part 4 — Full-Stack Application

**Goal:** Build a complete, deployable web application on top of the Part 3 API.

Part 4 adds a fully interactive frontend — pure HTML, CSS, and Vanilla JavaScript — along with a reservation system and RGPD compliance. The result is a deployable full-stack application with an immersive space-themed interface.

→ **[Full Part 4 documentation](part4/README.md)**

### Tech Stack

#### Backend

| Layer | Technology |
|-------|------------|
| Framework | Flask |
| REST API | Flask-RESTX + Swagger UI |
| Authentication | Flask-JWT-Extended (Bearer tokens) |
| ORM | Flask-SQLAlchemy |
| Password hashing | Flask-Bcrypt |
| CORS | Flask-CORS |
| Database | SQLite (development) |

#### Frontend

| Layer | Technology |
|-------|------------|
| Markup | HTML5 (semantic) |
| Styling | CSS3 — custom design system, CSS variables, mobile-first |
| Logic | Vanilla JavaScript (ES2020+, Fetch API) |
| Animations | GSAP 3 + ScrollTrigger |
| Auth storage | Session cookies (JWT) |

### Key Features

- **Interactive catalog** — live search by designation, price filter, sort by name or colony
- **Multi-photo upload** — up to 10 images per habitat, served directly by Flask (`/uploads/`)
- **JWT auth flow** — login, register, protected routes, username displayed in nav dropdown
- **Reservation system** — book habitats with date pickers, owner confirms or rejects, conflict detection
- **Admin control room** — full CRUD panel for all entities, connected live to the API
- **Responsive design** — mobile-first, hamburger drawer menu, touch-optimized (44px targets)
- **GSAP animations** — hero wordmark scrolls from full-screen to header on scroll
- **Dual-row marquee carousel** — two rows of portrait cards scrolling in opposite directions
- **RGPD/GDPR compliance** — cookie consent banner, privacy policy page, right to erasure
- **Space narrative** — every word of copy is in-universe (habitats, keepers, mission logs, cycle rates…)

### Project Structure

```
part4/hbnb/
├── app/
│   ├── __init__.py              # App factory — Flask, CORS, JWT, SQLAlchemy
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py          # POST /api/v1/auth/login
│   │       ├── users.py         # CRUD /api/v1/users
│   │       ├── places.py        # CRUD /api/v1/places
│   │       ├── reviews.py       # CRUD /api/v1/reviews
│   │       ├── amenities.py     # CRUD /api/v1/amenities
│   │       ├── reservations.py  # Reservation lifecycle
│   │       └── upload.py        # POST /api/v1/upload (multipart)
│   ├── models/
│   │   ├── base.py
│   │   ├── user.py
│   │   ├── place.py             # photos as JSON array
│   │   ├── review.py
│   │   ├── amenity.py
│   │   ├── reservation.py       # guest, place, dates, status
│   │   └── association.py       # place_amenity M2M table
│   ├── services/
│   │   └── facade.py            # Business logic layer
│   └── persistence/
│       └── repositories/        # Repository pattern over SQLAlchemy
├── base_files/                  # Frontend (zero dependencies except GSAP CDN)
│   ├── index.html               # Home — hero, features, marquee, explore catalog
│   ├── place.html               # Habitat detail + gallery + mission logs + booking
│   ├── login.html               # Access portal + enlistment form
│   ├── register.html            # Enlistment form (standalone)
│   ├── my_places.html           # Navigator's registered stations
│   ├── my_reservations.html     # My bookings + incoming requests
│   ├── add_place.html           # Register a new habitat
│   ├── edit_place.html          # Modify existing habitat
│   ├── add_review.html          # File a mission log
│   ├── profile.html             # Navigator file + danger zone
│   ├── admin.html               # Control room (admin only)
│   ├── how_it_works.html        # Mission briefing
│   ├── trust_safety.html        # Galactic protection protocol
│   ├── privacy.html             # Privacy policy (RGPD/GDPR)
│   ├── header.html              # Dynamic header (injected via JS)
│   ├── footer.html              # Dynamic footer
│   ├── scripts.js               # All frontend logic (~1675 lines)
│   ├── styles.css               # Design system (~2358 lines)
│   └── images/
│       └── no_picture.jpg       # Default habitat image
├── sql/
│   ├── schema.sql               # Database DDL
│   └── enter_data.sql           # Seed data
├── seed_data.py                 # Python seeder — 10 users + 20 diverse places
├── config.py
├── run.py
└── requirements.txt
```

### API Reference (Part 4)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/auth/login` | Get JWT token | ✗ |
| `GET` | `/api/v1/users/` | List all users | Admin |
| `POST` | `/api/v1/users/` | Create user | ✗ |
| `GET` | `/api/v1/users/<id>` | Get user | JWT |
| `PUT` | `/api/v1/users/<id>` | Update user | Owner / Admin |
| `DELETE` | `/api/v1/users/<id>` | Delete user | Owner / Admin |
| `GET` | `/api/v1/places/` | List all habitats | ✗ |
| `POST` | `/api/v1/places/` | Create habitat | JWT |
| `GET` | `/api/v1/places/<id>` | Get habitat detail | ✗ |
| `PUT` | `/api/v1/places/<id>` | Update habitat | Owner / Admin |
| `DELETE` | `/api/v1/places/<id>` | Delete habitat | Owner / Admin |
| `GET` | `/api/v1/places/<id>/reviews` | List mission logs | ✗ |
| `POST` | `/api/v1/reviews/` | File mission log | JWT |
| `PUT` | `/api/v1/reviews/<id>` | Update log | Owner / Admin |
| `DELETE` | `/api/v1/reviews/<id>` | Delete log | Owner / Admin |
| `POST` | `/api/v1/reservations/` | Book a habitat | JWT |
| `GET` | `/api/v1/reservations/mine` | My bookings | JWT |
| `GET` | `/api/v1/reservations/incoming` | Incoming requests (owner) | JWT |
| `DELETE` | `/api/v1/reservations/<id>` | Cancel reservation | JWT |
| `PUT` | `/api/v1/reservations/<id>/confirm` | Confirm reservation | Place owner |
| `PUT` | `/api/v1/reservations/<id>/reject` | Reject reservation | Place owner |
| `GET` | `/api/v1/amenities/` | List systems | ✗ |
| `POST` | `/api/v1/amenities/` | Create system | Admin |
| `PUT` | `/api/v1/amenities/<id>` | Update system | Admin |
| `DELETE` | `/api/v1/amenities/<id>` | Delete system | Admin |
| `POST` | `/api/v1/upload` | Upload photos (multipart) | JWT |

---

## Getting Started

Each part is self-contained. To run the final application (Part 4):

### Prerequisites

- Python 3.10+
- pip

### Installation

```bash
git clone https://github.com/LucasN-ux/holbertonschool-hbnb.git
cd holbertonschool-hbnb/part4/hbnb

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Start the API server

```bash
python run.py
# → API:     http://127.0.0.1:5000
# → Swagger: http://127.0.0.1:5000/
```

### Serve the frontend

```bash
# In a second terminal, from part4/hbnb/
cd base_files
python3 -m http.server 8080
# → Frontend: http://localhost:8080
```

### Seed the database

```bash
# SQL seed files
sqlite3 instance/development.db < sql/schema.sql
sqlite3 instance/development.db < sql/enter_data.sql

# Or use the Python seeder (10 users + 20 places with photos)
python seed_data.py
```

Default admin account: `admin@hbnb.io` / `Admin1234!`

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

## Repository Structure

```
holbertonschool-hbnb/
├── part1/                        # Technical documentation & UML diagrams
│   ├── High_Package_Diagram.png
│   ├── High_Class_Diagram.png
│   ├── Sequence-Diagram-*.png
│   └── Compiled_HBNB_Technical_Documentation.pdf
├── part2/                        # REST API — in-memory storage
│   └── hbnb/
│       ├── app/                  # API · models · services · persistence
│       ├── config.py
│       ├── run.py
│       └── requirements.txt
├── part3/                        # REST API — SQLAlchemy + JWT auth
│   └── hbnb/
│       ├── app/                  # API · models · services · persistence
│       ├── sql/                  # schema.sql + enter_data.sql
│       ├── config.py
│       ├── run.py
│       └── requirements.txt
├── part4/                        # Full-stack web application
│   ├── hbnb/
│   │   ├── app/                  # Flask backend (API + models + services)
│   │   ├── base_files/           # Frontend (HTML · CSS · JS)
│   │   ├── sql/                  # Database schema & seed data
│   │   ├── seed_data.py          # Python seeder
│   │   ├── config.py
│   │   ├── run.py
│   │   └── requirements.txt
│   └── README.md                 # Detailed Part 4 documentation
└── README.md                     # This file
```

---

## Authors

- **Robin Allix** — [@AllixRbn](https://github.com/AllixRbn)
- **Lucas Nevano** — [@LucasN-ux](https://github.com/LucasN-ux)

*Holberton School — Full-Stack Web Development · 2025–2026*
