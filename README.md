# CampusHub

**Smart Academic Resource Sharing Platform for University Students**

CampusHub is a full-stack web platform that replaces the informal "shared Drive folder" workflow used across university batches with a structured, searchable, AI-assisted resource hub for notes, past papers, tutorials, and peer-led revision sessions (**kuppi**).

> Status: 🚧 In active development — built as a portfolio/learning project ahead of internship interviews.

---

## Table of Contents

- [Problem](#problem)
- [Solution](#solution)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Roadmap](#roadmap)
- [Author](#author)
- [License](#license)

---

## Problem

Most university batches rely on informal Google Drive folders to share notes, past papers, and peer-led revision material. This works, but breaks down in predictable ways:

- **Poor organization** — inconsistent naming, deep nested folders, no structure by course or topic
- **Weak discoverability** — filename-only search, no way to search by actual content
- **Duplicate sprawl** — the same resource re-uploaded repeatedly under different names
- **No quality signal** — no way to tell which version is accurate, corrected, or outdated
- **No personalization** — every student sees the same flat, unsorted folder regardless of their enrolled courses

The underlying problem isn't file sharing — it's **organizing, deduplicating, ranking, and surfacing the right content to the right student.**

## Solution

CampusHub is a purpose-built platform that adds real structure and intelligence on top of the sharing workflow students already use:

- Content organized by **course → resource type → individual resource**
- **Content-aware search** across extracted text and AI-generated tags, not just filenames
- **Automatic duplicate detection** (exact + near-duplicate) so the same file doesn't get re-uploaded endlessly
- **Lightweight versioning** so updated notes stay linked to the original instead of fragmenting
- **Community-driven quality signals** via upvotes and comments
- **Personalized feed** based on a student's actual enrolled courses

AI is used deliberately, as a feature layer solving specific problems — not as the entire product.

## Features

| Feature | Description |
|---|---|
|  Authentication | JWT-based auth via Spring Security, university-email gated signup |
|  Course-based organization | Resources structured by course code, semester, and type |
|  Smart upload | SHA-256 hashing detects exact duplicates on upload |
|  AI auto-summarization & tagging | LLM generates a short summary and topic tags for each uploaded resource |
|  Near-duplicate detection | Embedding-based similarity check flags likely duplicate/updated content |
|  Version threads | Related resources link into a version history instead of duplicating |
|  Voting & comments | Community signals surface the best version of a resource |
|  Personalized feed | Surfaces new/trending resources relevant to the student's enrolled courses |
|  Content-aware search | Search matches extracted text and AI tags, not just filenames |

## Tech Stack

**Frontend**
- React + TypeScript
- Vite

**Backend**
- Java 17 + Spring Boot
- Spring Security (JWT auth)
- Spring Data JPA / Hibernate

**Database & Storage**
- PostgreSQL
- Supabase Storage (file storage)

**AI Layer**
- LLM API — summarization & auto-tagging
- Embedding model — cosine similarity for near-duplicate detection

**Deployment**
- Frontend: Vercel
- Backend: Render / Railway (Docker)

## Architecture

```
┌─────────────────┐        ┌──────────────────────┐        ┌──────────────┐
│  React + TS SPA  │ <────> │  Spring Boot REST API │ <────> │ PostgreSQL   │
└─────────────────┘  HTTPS  └──────────────────────┘  JPA   └──────────────┘
                                    │
                        ┌───────────┴────────────┐
                        │                         │
                ┌───────▼───────┐        ┌────────▼────────┐
                │ Supabase       │        │ AI Service Layer │
                │ Storage (files)│        │ (summarize/tag/  │
                └────────────────┘        │  embeddings)     │
                                           └───────────────────┘
```

- **Controller → Service → Repository** layered architecture on the backend
- AI functionality isolated in its own service module — swappable and independently testable
- File uploads go directly to Supabase Storage; metadata, hashes, and extracted text tracked in PostgreSQL

## Project Structure

```
campushub/
├── backend/          # Spring Boot application
│   ├── src/main/java/com/campushub/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── entity/
│   │   ├── dto/
│   │   ├── security/
│   │   └── ai/
│   └── src/main/resources/
├── frontend/         # React + TypeScript application
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── types/
├── docs/             # Architecture notes, schema diagrams, proposal
└── README.md
```

## Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL 14+
- A Supabase project (for storage)

### Backend
```bash
cd backend
./mvnw spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Create a `.env` (frontend) and `application.properties` / `application-local.properties` (backend) with:
```
DB_URL=
DB_USERNAME=
DB_PASSWORD=
SUPABASE_URL=
SUPABASE_KEY=
JWT_SECRET=
AI_API_KEY=
```

*(Full setup instructions will be expanded as the project develops.)*

## Roadmap

- [x] Project scoping & architecture design
- [ ] Auth (Spring Security + JWT)
- [ ] Core CRUD — courses & resources
- [ ] File upload pipeline + exact-duplicate detection
- [ ] Voting & comments
- [ ] Text extraction + AI summarization/tagging
- [ ] Content-aware search
- [ ] Embedding-based near-duplicate detection & version threads
- [ ] Personalized feed
- [ ] Deployment

## Author

Built by a 3rd-year IT undergraduate at the **University of Moratuwa**, as a portfolio project ahead of internship applications.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
