# holbertonschool-hbnb

> A full-stack Airbnb-inspired web application built progressively across four parts — from technical architecture to a live, deployable product.

**hbnb** (Habitat Beyond New Borders) is a galactic lodging platform where explorers across the universe can discover, list, and review extraordinary habitats. Built as a Holberton School end-to-end project, it covers every layer of modern web development: system design, backend API, database persistence, authentication, and a complete frontend.

---

## Project Progression

| Part | Focus | Stack |
|------|-------|-------|
| [Part 1](#part-1--technical-documentation) | Architecture & Design | UML · Diagrams |
| [Part 2](#part-2--rest-api-in-memory) | REST API — In-Memory | Python · Flask · Flask-RESTX |
| [Part 3](#part-3--database--authentication) | Database & Auth | SQLAlchemy · Flask-JWT-Extended · BCrypt |
| [Part 4](#part-4--full-stack-application) | Full-Stack | Flask · SQLite · HTML · CSS · Vanilla JS |

---

## Part 1 — Technical Documentation

**Goal:** Define the architecture before writing a single line of code.

Part 1 is a complete technical specification document covering the system's design, class relationships, and interaction flows.

### Deliverables

- **High-Level Package Diagram** — three-layer architecture (Presentation → Business Logic → Persistence)
- **Detailed Class Diagram** — all entities (User, Place, Review, Amenity) with attributes, methods, and relationships
- **Sequence Diagrams** — four critical flows:
  - User Registration
  - Place Creation
  - Review Submission
  - Fetching a List of Places
- **Compiled PDF** — full technical documentation

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

**Goal:** Implement the business logic and API layer with in-memory storage — no database yet.

Part 2 translates the Part 1 architecture into a working REST API. Data lives in memory (Python dicts) via a repository pattern, making it easy to swap for a real database later.

### Key features

- Full CRUD for **Users**, **Places**, **Reviews**, and **Amenities**
- Input validation at the API layer (Flask-RESTX models)
- **Facade pattern** decouples API routes from business logic
- **Repository pattern** abstracts the storage layer
- Auto-generated **Swagger UI** at `/`

### Stack

```
Flask · Flask-RESTX · Python 3
```

```
part2/hbnb/
├── app/
│   ├── api/v1/          # Route handlers
│   ├── models/          # Entity classes (User, Place, Review, Amenity)
│   ├── services/        # Facade — single business logic entry point
│   └── persistence/     # In-memory repositories
├── config.py
├── run.py
└── requirements.txt
```

---

## Part 3 — Database & Authentication

**Goal:** Replace in-memory storage with a real database and add secure authentication.

Part 3 introduces persistent storage (SQLite via SQLAlchemy), password hashing (BCrypt), and stateless authentication (JWT). The Facade pattern from Part 2 is preserved — only the persistence layer changes.

### Key features

- **SQLAlchemy ORM** — all models mapped to relational tables
- **Flask-JWT-Extended** — JWT tokens with `is_admin` claim
- **Flask-Bcrypt** — passwords hashed before storage, never stored in plaintext
- **Role-based access control** — admin vs. regular user permissions on each endpoint
- **Database schema** — SQL DDL with constraints, foreign keys, and cascade deletes
- **Seed data** — `enter_data.sql` for initial population

### Database diagram

```
users ──< places ──< reviews
           │
           └──< place_amenity >── amenities
```

### Stack

```
Flask · Flask-RESTX · Flask-JWT-Extended · Flask-Bcrypt · SQLAlchemy · SQLite
```

```
part3/hbnb/
├── app/
│   ├── api/v1/          # auth + CRUD namespaces
│   ├── models/          # SQLAlchemy models
│   ├── services/        # Facade (now hits the DB)
│   └── persistence/     # SQLAlchemy repositories
├── sql/
│   ├── schema.sql
│   └── enter_data.sql
├── config.py
├── run.py
└── requirements.txt
```

---

## Part 4 — Full-Stack Application

**Goal:** Build a complete, usable web application on top of the Part 3 API.

Part 4 adds a full frontend — no React, no Vue, no jQuery. Pure HTML, CSS, and Vanilla JavaScript. The result is a deployable full-stack application with an immersive space-themed interface.

→ **[Full Part 4 documentation](part4/README.md)**

### Key features

- **Interactive catalog** with live search, price filter, and sort
- **Multi-photo upload** (up to 10 images per habitat, served by Flask)
- **JWT auth flow** — login, register, protected routes, auto-redirect for admins
- **Admin control room** — full CRUD panel for all entities, connected live to the API
- **Responsive design** — mobile-first, hamburger menu, touch-optimized (44px targets)
- **GSAP animations** — hero wordmark scrolls from full-screen to header on scroll
- **Space narrative** — every word of copy is in-universe (habitats, keepers, mission logs…)

### Stack

```
Flask · SQLAlchemy · JWT · HTML5 · CSS3 · Vanilla JS · GSAP
```

---

## Getting Started

Each part is self-contained. To run the final application (Part 4):

```bash
git clone https://github.com/LucasN-ux/holbertonschool-hbnb.git
cd holbertonschool-hbnb/part4/hbnb

# Install dependencies
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Start the API server
python run.py
# → API:     http://127.0.0.1:5000
# → Swagger: http://127.0.0.1:5000/

# In a second terminal — serve the frontend
cd base_files && python3 -m http.server 8080
# → Frontend: http://localhost:8080
```

Default admin credentials: `admin@hbnb.io` / `Admin1234!`

---

## Repository Structure

```
holbertonschool-hbnb/
├── part1/                   # Technical documentation & UML diagrams
├── part2/                   # REST API — in-memory storage
│   └── hbnb/
├── part3/                   # REST API — SQLAlchemy + JWT auth
│   └── hbnb/
├── part4/                   # Full-stack web application
│   ├── hbnb/
│   │   ├── app/             # Flask backend (API + models + services)
│   │   ├── base_files/      # Frontend (HTML · CSS · JS)
│   │   └── sql/             # Database schema & seed data
│   └── README.md            # Detailed Part 4 documentation
└── README.md                # This file
```

---

## Authors

- **Robin Allix** — [@AllixRbn](https://github.com/AllixRbn)
- **Lucas Nevano** — [@LucasN-ux](https://github.com/LucasN-ux)

*Holberton School — Full-Stack Web Development · 2025–2026*
