# MyVansh.AI — Complete Development Guide

**Master Reference for Building with Claude Code**
**Last Updated:** February 15, 2026
**Product Name:** MyVansh.AI

---

## Table of Contents

1. [Product Vision & Business Rules](#1-product-vision--business-rules)
2. [Architecture Overview](#2-architecture-overview)
3. [Tech Stack](#3-tech-stack)
4. [Project Structure](#4-project-structure)
5. [Environment Variables](#5-environment-variables)
6. [Supabase Database Schema](#6-supabase-database-schema)
7. [Database Functions & Triggers](#7-database-functions--triggers)
8. [Row Level Security (RLS)](#8-row-level-security-rls)
9. [SQL Migrations](#9-sql-migrations)
10. [MCP Tool Definitions](#10-mcp-tool-definitions)
11. [MCP Server Implementation](#11-mcp-server-implementation)
12. [API Route: Chat Endpoint](#12-api-route-chat-endpoint)
13. [Embedding Service (RAG Pipeline)](#13-embedding-service-rag-pipeline)
14. [Supabase Client Configuration](#14-supabase-client-configuration)
15. [System Prompt for Claude AI](#15-system-prompt-for-claude-ai)
16. [Frontend: Website (Next.js)](#16-frontend-website-nextjs)
17. [Frontend: iOS App (Swift)](#17-frontend-ios-app-swift)
18. [Design System & Brand Tokens](#18-design-system--brand-tokens)
19. [Conversation Flow Examples](#19-conversation-flow-examples)
20. [Household & Invitation Logic](#20-household--invitation-logic)
21. [Cross-Household Linking](#21-cross-household-linking)
22. [Deployment (Vercel)](#22-deployment-vercel)
23. [Testing](#23-testing)
24. [Build Phases & Roadmap](#24-build-phases--roadmap)
25. [Cost Estimates](#25-cost-estimates)
26. [Future Enhancements](#26-future-enhancements)

---

## 1. Product Vision & Business Rules

### What is MyVansh.AI?

A conversational AI-powered family history platform. Family members chat naturally with an AI assistant to ask questions about ancestors, major events, relationships, and photos — and contribute new information through natural conversation. The tagline is: **"Every Family Has a Story Worth Keeping."**

### Core Concept

Every family member opens the app, chats naturally ("Who was grandpa's father?", "When did we move to the US?", "Show me photos from the 1985 wedding"), and the AI answers from the family knowledge base. Members can also add new entries just by talking.

### Target Users

- **Baby Boomers** — Enter rich historical data, stories, old photos
- **Gen X** — Primary data contributors; will mostly use iPhone/iPad
- **Millennials** — Data contributors + tech-savvy users; website + mobile
- **Gen Z** — Future audience; chat-first UX on mobile

### Household Model (Business Rules)

- The app is **per-household** as the core account unit
- Each household allows a maximum of **5 active members**: **1 Owner + 4 Members**
- The **Owner** can create as large a family tree as they want
- The Owner can **invite** other family branches to create their own household accounts
- When someone accepts a **household invitation**, the two family trees **auto-link** at a shared ancestor
- The invited household also gets **1 Owner + 4 Members**
- Cross-household queries traverse only **direct links (1 hop)** — no chains (A→B→C)
- Each household owns its own data independently — unlinking doesn't break anything

### Invitation Types

- `invite_type = 'member'` → Invitee joins the existing household as a member (uses one of the 4 member slots)
- `invite_type = 'household'` → Invitee creates a brand new household; trees auto-link at the shared ancestor specified by `link_person_id`

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND                                  │
│                                                              │
│  Next.js Website          iOS App (Swift)                    │
│  └── /api/chat            └── APIService.swift               │
│       (route.ts)               (calls same endpoint)         │
└──────────┬──────────────────────────┬────────────────────────┘
           │                         │
           ▼                         ▼
┌──────────────────────────────────────────────────────────────┐
│               /api/chat/route.ts                             │
│                                                              │
│  1. Receives user message                                    │
│  2. Loads chat session history from Supabase                 │
│  3. Calls Claude API with:                                   │
│     - System prompt (household context)                      │
│     - Chat history                                           │
│     - MCP tool definitions                                   │
│  4. Handles tool calls from Claude                           │
│  5. Saves messages to chat_messages table                    │
│  6. Streams response back to client                          │
└──────────┬───────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────┐
│              CLAUDE API (Anthropic)                           │
│                                                              │
│  Model: claude-sonnet-4-5-20250929                           │
│  Receives: system prompt + messages + tools[]                │
│  Returns: text response OR tool_use blocks                   │
└──────────┬───────────────────────────────────────────────────┘
           │ (tool calls)
           ▼
┌──────────────────────────────────────────────────────────────┐
│              MCP TOOL HANDLER                                │
│                                                              │
│  Receives tool_use block from Claude                         │
│  Routes to correct tool function                             │
│  Executes Supabase query                                     │
│  Returns tool_result to Claude                               │
│                                                              │
│  14 Tools:                                                   │
│  ├── origin_search_family     (RAG semantic search)          │
│  ├── origin_get_person        (person details)               │
│  ├── origin_add_person        (create person)                │
│  ├── origin_update_person     (update person)                │
│  ├── origin_add_relationship  (link two persons)             │
│  ├── origin_get_family_tree   (tree traversal)               │
│  ├── origin_add_event         (create event)                 │
│  ├── origin_get_events        (list events)                  │
│  ├── origin_get_timeline      (family timeline)              │
│  ├── origin_search_photos     (find assets)                  │
│  ├── origin_add_story         (create story)                 │
│  ├── origin_search_stories    (find stories)                 │
│  ├── origin_get_today_history (today's events)               │
│  └── origin_generate_bio      (AI biography)                 │
└──────────┬───────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────┐
│              SUPABASE                                        │
│                                                              │
│  PostgreSQL + pgvector                                       │
│  ├── 19 tables + 2 views                                     │
│  ├── document_chunks (semantic search via embedding)         │
│  ├── persons, relationships (tree queries)                   │
│  ├── events, event_links (event queries)                     │
│  ├── assets, asset_persons, asset_tags (photo queries)       │
│  ├── stories, story_persons (story queries)                  │
│  ├── chat_sessions, chat_messages (conversation history)     │
│  ├── household_links (cross-household search)                │
│  └── Supabase Storage (family_assets bucket)                 │
│                                                              │
│  Functions:                                                  │
│  ├── search_family_across_households()                       │
│  ├── get_persons_across_households()                         │
│  ├── get_relationships_across_households()                   │
│  ├── get_linked_household_ids()                              │
│  ├── activate_household_link()                               │
│  └── revoke_household_link()                                 │
└──────────────────────────────────────────────────────────────┘
```

### Message Flow

```
User types: "Who was my great grandmother?"
     │
     ▼
Next.js /api/chat endpoint receives message
     │
     ▼
Claude API called with message + MCP tool definitions
     │
     ▼
Claude decides to call origin_search_family tool
     │
     ▼
MCP Server executes tool → queries Supabase
     │
     ▼
Results returned to Claude
     │
     ▼
Claude generates conversational response with citations
     │
     ▼
Response streamed back to user's browser/app
```

---

## 3. Tech Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Web Framework | Next.js (App Router) | 14+ | API routes + frontend |
| Styling | Tailwind CSS | latest | UI styling |
| AI SDK | Vercel AI SDK | latest | Streaming chat with Claude |
| LLM | Claude API | claude-sonnet-4-5-20250929 | Conversational AI engine |
| Protocol | MCP (Model Context Protocol) | latest | Standardized tool interface between Claude and Supabase |
| Database | Supabase (PostgreSQL + pgvector) | latest | Structured data + vector semantic search |
| Database Client | @supabase/supabase-js | 2.x | Supabase queries |
| Storage | Supabase Storage | — | Family photos and scanned documents |
| Auth | Supabase Auth | — | Family member login (email/magic link) |
| Embeddings | OpenAI text-embedding-3-small | latest | Convert text to vectors for RAG search |
| Schema Validation | Zod | 3.x | Tool input validation |
| Hosting | Vercel | — | Frontend + API deployment (auto-deploy from GitHub) |
| Version Control | GitHub | — | Full codebase including database schema |
| iOS App | Swift / SwiftUI | latest | iPhone/iPad native app |

### Package Dependencies

```json
{
  "name": "myvansh-ai-web",
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "@supabase/supabase-js": "^2.39.0",
    "@anthropic-ai/sdk": "^0.30.0",
    "ai": "^3.0.0",
    "openai": "^4.20.0",
    "zod": "^3.22.0"
  }
}
```

---

## 4. Project Structure

```
myvansh-ai/
│
├── README.md                           ← Setup & deploy instructions
├── .env.example                        ← Environment variables template
├── .env.local                          ← Local env vars (never commit)
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── vercel.json                         ← Serverless function config
│
├── supabase/                           ← DATABASE SCHEMA (version controlled)
│   ├── migrations/
│   │   ├── 001_extensions.sql          ← pgvector + uuid-ossp extensions
│   │   ├── 002_identity_access.sql     ← households, members, profiles, invitations, links
│   │   ├── 003_people_relationships.sql ← persons, relationships, countries
│   │   ├── 004_events.sql              ← events, event_links
│   │   ├── 005_assets_media.sql        ← assets, asset_persons, asset_tags
│   │   ├── 006_stories.sql             ← stories, story_persons
│   │   ├── 007_ai_search.sql           ← documents, document_chunks, chat_sessions, chat_messages
│   │   ├── 008_jobs_sync.sql           ← ingestion_jobs, household_sheets
│   │   ├── 009_views.sql               ← person_summary, family_timeline views
│   │   ├── 010_functions.sql           ← All database functions
│   │   ├── 011_triggers.sql            ← Household limit + single owner triggers
│   │   ├── 012_rls_policies.sql        ← Row Level Security policies
│   │   ├── 013_storage.sql             ← Storage bucket + policies
│   │   └── 014_indexes.sql             ← All indexes including pgvector
│   └── seed/
│       └── seed_data.sql               ← Sample family data + countries
│
├── app/                                ← NEXT.JS FRONTEND
│   ├── layout.tsx                      ← Root layout with auth provider
│   ├── page.tsx                        ← Landing page / main chat
│   ├── login/
│   │   └── page.tsx                    ← Login / signup page
│   ├── dashboard/
│   │   └── page.tsx                    ← Dashboard after login
│   └── api/
│       ├── chat/
│       │   └── route.ts               ← Chat endpoint (Claude API + MCP)
│       ├── upload/
│       │   └── route.ts               ← Photo upload handler
│       └── invite/
│           └── route.ts               ← Invitation handler
│
├── components/                         ← UI COMPONENTS
│   ├── ChatWindow.tsx                  ← Main chat container
│   ├── MessageBubble.tsx               ← Individual message display
│   ├── PhotoViewer.tsx                 ← Photo gallery / viewer
│   ├── FamilyTreeView.tsx              ← Visual family tree
│   ├── LoginForm.tsx                   ← Auth form
│   ├── Sidebar.tsx                     ← Navigation sidebar
│   ├── Timeline.tsx                    ← Family timeline view
│   └── InviteModal.tsx                 ← Invitation modal
│
├── lib/                                ← SHARED UTILITIES
│   ├── supabase-server.ts              ← Supabase server client (service role key)
│   ├── supabase-client.ts              ← Supabase browser client (anon key)
│   ├── embeddings.ts                   ← OpenAI embedding generation
│   ├── claude.ts                       ← Claude API wrapper
│   └── auth.ts                         ← Auth helper functions
│
├── mcp/                                ← MCP SERVER + TOOLS
│   ├── index.ts                        ← Tool registry + router
│   ├── tools.ts                        ← Tool definitions (names, descriptions, schemas)
│   ├── types.ts                        ← TypeScript types
│   └── handlers/
│       ├── search-family.ts            ← origin_search_family
│       ├── get-person.ts               ← origin_get_person
│       ├── add-person.ts               ← origin_add_person
│       ├── update-person.ts            ← origin_update_person
│       ├── add-relationship.ts         ← origin_add_relationship
│       ├── get-family-tree.ts          ← origin_get_family_tree
│       ├── add-event.ts                ← origin_add_event
│       ├── get-events.ts               ← origin_get_events
│       ├── get-timeline.ts             ← origin_get_timeline
│       ├── search-photos.ts            ← origin_search_photos
│       ├── add-story.ts                ← origin_add_story
│       ├── search-stories.ts           ← origin_search_stories
│       ├── get-today-history.ts        ← origin_get_today_history
│       └── generate-bio.ts            ← origin_generate_bio
│
├── public/
│   ├── logo.svg                        ← App logo
│   └── myvanshlogolight.png            ← Brand logo (light version)
│
└── ios/                                ← iOS APP (separate Xcode project)
    ├── MyVanshAI.xcodeproj
    └── MyVanshAI/
        ├── App/
        │   └── MyVanshAIApp.swift
        ├── Views/
        │   ├── ChatView.swift
        │   ├── LoginView.swift
        │   └── PhotoGalleryView.swift
        ├── Services/
        │   ├── APIService.swift         ← Calls same /api/chat endpoint
        │   ├── AuthService.swift
        │   └── VoiceService.swift       ← Voice input (Whisper API)
        └── Models/
            ├── Message.swift
            ├── Person.swift
            └── Household.swift
```

---

## 5. Environment Variables

Create `.env.local` (never commit this):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Anthropic (Claude AI)
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI (for embeddings only)
OPENAI_API_KEY=sk-...

# App
NEXT_PUBLIC_APP_URL=https://myvansh.ai
```

---

## 6. Supabase Database Schema

**Database:** Supabase (PostgreSQL + pgvector)
**Total:** 19 tables + 2 views

### Schema Map

```
┌─────────────────────────────────────────────────────────────────┐
│                        MYVANSH.AI DATABASE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  IDENTITY & ACCESS (5)          PEOPLE & RELATIONSHIPS (3)       │
│  ├── households                 ├── persons                      │
│  ├── household_members          ├── relationships                │
│  ├── profiles                   └── countries                    │
│  ├── invitations                                                 │
│  └── household_links            EVENTS (2)                       │
│                                 ├── events                       │
│  ASSETS & MEDIA (3)             └── event_links                  │
│  ├── assets                                                      │
│  ├── asset_persons              STORIES (2)                      │
│  └── asset_tags                 ├── stories                      │
│                                 └── story_persons                │
│  AI & SEARCH (4)                                                 │
│  ├── documents                  SYNC (1)                         │
│  ├── document_chunks            └── household_sheets             │
│  ├── chat_sessions                                               │
│  └── chat_messages              JOBS (1)                         │
│                                 └── ingestion_jobs               │
│  VIEWS (2)                                                       │
│  ├── person_summary                                              │
│  └── family_timeline                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 6.1 Identity & Access

#### `households`

The core account unit. Each household owns its own family tree, assets, stories, and events.

| Column | Type | Nullable | Default | Description |
|--------|------|:--------:|---------|-------------|
| **id** | uuid | NO | uuid_generate_v4() | Primary key |
| name | text | NO | — | Household display name (e.g., "The Kumar Family") |
| created_by | uuid | NO | — | FK → auth.users (the Owner) |
| created_at | timestamptz | NO | now() | Creation timestamp |

#### `household_members`

Links auth users to households. Max 5 active members (1 Owner + 4 Members), enforced by trigger.

| Column | Type | Nullable | Default | Description |
|--------|------|:--------:|---------|-------------|
| **id** | uuid | NO | uuid_generate_v4() | Primary key |
| household_id | uuid | NO | — | FK → households |
| user_id | uuid | NO | — | FK → auth.users |
| role | text | NO | — | `'owner'` or `'member'` |
| status | text | NO | 'active' | `'active'`, `'suspended'`, `'removed'` |
| created_at | timestamptz | NO | now() | When the user joined |

**Constraints:**
- Trigger `check_household_limit` — max 5 active members per household
- Trigger `check_single_owner` — exactly 1 owner per household

#### `profiles`

Extended user profile data, synced from Supabase Auth on signup.

| Column | Type | Nullable | Default | Description |
|--------|------|:--------:|---------|-------------|
| **id** | uuid | NO | — | PK, matches auth.users.id |
| email | text | YES | — | User email |
| first_name | text | YES | — | First name |
| last_name | text | YES | — | Last name |
| avatar_url | text | YES | — | Profile photo URL |
| created_at | timestamptz | NO | now() | Account creation |
| updated_at | timestamptz | NO | now() | Last profile update |

#### `invitations`

Manages both member invitations (join existing household) and household invitations (create new linked household).

| Column | Type | Nullable | Default | Description |
|--------|------|:--------:|---------|-------------|
| **id** | uuid | NO | uuid_generate_v4() | Primary key |
| household_id | uuid | NO | — | FK → households (the inviting household) |
| invited_email | text | NO | — | Invitee's email address |
| role | text | NO | — | `'owner'` or `'member'` |
| invite_type | text | YES | 'member' | `'member'` = join household; `'household'` = create new linked household |
| link_person_id | uuid | YES | — | FK → persons. Shared ancestor connecting trees (when invite_type = 'household') |
| token_hash | text | NO | — | Hashed invitation token for secure URL |
| expires_at | timestamptz | NO | — | When the invitation expires |
| accepted_by | uuid | YES | — | FK → auth.users (who accepted) |
| accepted_at | timestamptz | YES | — | When accepted |
| created_by | uuid | NO | — | FK → auth.users (who sent the invite) |
| created_at | timestamptz | NO | now() | When the invitation was sent |

#### `household_links`

Cross-household tree connections. When one household invites another family branch, a link is created at a shared ancestor.

| Column | Type | Nullable | Default | Description |
|--------|------|:--------:|---------|-------------|
| **id** | uuid | NO | uuid_generate_v4() | Primary key |
| household_a | uuid | NO | — | FK → households (first household) |
| household_b | uuid | NO | — | FK → households (second household) |
| person_a | uuid | NO | — | FK → persons (shared ancestor's record in household A) |
| person_b | uuid | NO | — | FK → persons (shared ancestor's record in household B) |
| status | text | NO | 'pending' | `'pending'`, `'active'`, `'revoked'` |
| created_by | uuid | NO | — | FK → auth.users (who initiated) |
| created_at | timestamptz | NO | now() | When created |
| activated_at | timestamptz | YES | — | When invited household accepted |

**Constraints:**
- `no_self_link` — a household cannot link to itself
- `idx_unique_household_pair` — unique index preventing duplicate links (A→B and B→A treated as same)

**Design: Linked Duplicates Pattern** — Each household keeps its own copy of the shared ancestor. `person_a` and `person_b` are two separate records representing the same real individual. This ensures each household owns its data independently.

**Scope: Direct Links Only (1 Hop)** — Queries traverse only directly linked households, not chains (A→B→C).

---

### 6.2 People & Relationships

#### `persons`

Every ancestor, family member, or relative in the tree. Each person belongs to one household. Supports vector embeddings for AI semantic search.

| Column | Type | Nullable | Default | Description |
|--------|------|:--------:|---------|-------------|
| **id** | uuid | NO | uuid_generate_v4() | Primary key |
| household_id | uuid | NO | — | FK → households |
| external_ref | text | YES | — | External ID (Google Sheets row, GEDCOM import) |
| first_name | text | NO | — | First name |
| middle_name | text | YES | — | Middle name |
| last_name | text | NO | — | Last name / surname |
| nickname | text | YES | — | Common nickname or alias |
| sex | text | YES | — | `'male'`, `'female'`, `'other'` |
| birth_date | date | YES | — | Full birth date (if known) |
| birth_day | integer | YES | — | Day of birth (for partial dates) |
| birth_month | integer | YES | — | Month of birth (for partial dates) |
| birth_year | integer | YES | — | Year of birth (for partial dates) |
| birth_place | text | YES | — | Free-text birth location |
| birth_city | text | YES | — | Structured city name |
| birth_country_id | uuid | YES | — | FK → countries |
| death_date | date | YES | — | Date of death |
| notes | text | YES | — | Free-text biography / notes |
| primary_photo_asset_id | uuid | YES | — | FK → assets (profile photo) |
| embedding | vector | YES | — | pgvector embedding for semantic search |
| created_by | uuid | NO | — | FK → auth.users |
| created_at | timestamptz | NO | now() | When added |
| updated_at | timestamptz | NO | now() | Last modified |

**Design notes:**
- Supports both full dates (`birth_date`) and partial dates (`birth_day`, `birth_month`, `birth_year`) — essential for historical records where only the year is known
- `external_ref` enables Google Sheets sync and GEDCOM import without duplicates
- `embedding` stores a vector directly on the person record for RAG search

#### `relationships`

Directed relationships between two persons. Direction matters: `from_person_id` → `to_person_id` with `relation_type`.

| Column | Type | Nullable | Default | Description |
|--------|------|:--------:|---------|-------------|
| **id** | uuid | NO | uuid_generate_v4() | Primary key |
| household_id | uuid | NO | — | FK → households |
| from_person_id | uuid | NO | — | FK → persons (subject) |
| to_person_id | uuid | NO | — | FK → persons (object) |
| relation_type | text | NO | — | `'parent'`, `'child'`, `'spouse'`, `'sibling'`, etc. |
| relation_label | text | YES | — | Display label (e.g., "Dadi", "Chacha", "elder brother") |
| start_date | date | YES | — | Relationship start (e.g., marriage date) |
| end_date | date | YES | — | Relationship end (e.g., divorce date) |
| is_primary | boolean | NO | true | Primary relationship flag |
| source | text | YES | — | Data provenance: `'manual'`, `'sheets'`, `'import'` |
| created_at | timestamptz | NO | now() | When added |

**Design notes:**
- `relation_label` allows culturally specific labels while `relation_type` stays standardized for tree traversal
- Direction: "A is parent of B" → `from_person_id=A`, `to_person_id=B`, `relation_type='parent'`

#### `countries`

Reference table for standardized country data.

| Column | Type | Nullable | Default | Description |
|--------|------|:--------:|---------|-------------|
| **id** | uuid | NO | gen_random_uuid() | Primary key |
| name | text | NO | — | Country name (e.g., "India") |
| code | text | NO | — | ISO 3166-1 code (e.g., "IN") |
| created_at | timestamptz | NO | now() | When added |

---

### 6.3 Events

#### `events`

Family milestones — weddings, migrations, births, deaths, achievements.

| Column | Type | Nullable | Default | Description |
|--------|------|:--------:|---------|-------------|
| **id** | uuid | NO | uuid_generate_v4() | Primary key |
| household_id | uuid | NO | — | FK → households |
| title | text | NO | — | Event name |
| event_type | text | YES | — | `'birth'`, `'death'`, `'marriage'`, `'migration'`, `'achievement'`, `'custom'` |
| event_date | date | YES | — | Full date (if known) |
| event_year | integer | YES | — | Year only (for approximate dates) |
| location | text | YES | — | Where it happened |
| description | text | YES | — | Detailed description |
| external_ref | text | YES | — | External ID (Google Sheets, GEDCOM) |
| created_by | uuid | NO | — | FK → auth.users |
| created_at | timestamptz | NO | now() | When added |

#### `event_links`

Junction table linking persons to events with their role.

| Column | Type | Nullable | Default | Description |
|--------|------|:--------:|---------|-------------|
| **id** | uuid | NO | uuid_generate_v4() | Primary key |
| household_id | uuid | NO | — | FK → households |
| event_id | uuid | NO | — | FK → events |
| person_id | uuid | NO | — | FK → persons |
| role | text | YES | — | `'bride'`, `'groom'`, `'attendee'`, `'honoree'`, etc. |
| created_at | timestamptz | NO | now() | When linked |

---

### 6.4 Assets & Media

#### `assets`

All uploaded media — photos, scanned documents, certificates, letters, videos, audio. Stored in Supabase Storage (`family_assets` bucket).

| Column | Type | Nullable | Default | Description |
|--------|------|:--------:|---------|-------------|
| **id** | uuid | NO | uuid_generate_v4() | Primary key |
| household_id | uuid | NO | — | FK → households |
| asset_type | text | NO | — | `'photo'`, `'document'`, `'certificate'`, `'letter'`, `'video'`, `'audio'` |
| storage_bucket | text | NO | 'family_assets' | Supabase Storage bucket name |
| storage_path | text | NO | — | File path within the bucket |
| original_filename | text | YES | — | Original upload filename |
| mime_type | text | YES | — | File MIME type |
| description | text | YES | — | Caption / description |
| captured_at | timestamptz | YES | — | When photo was taken |
| year | integer | YES | — | Year (for approximate dating) |
| linked_event_id | uuid | YES | — | FK → events |
| linked_person_id | uuid | YES | — | FK → persons (primary subject) |
| checksum | text | YES | — | File hash for duplicate detection |
| embedding | vector | YES | — | pgvector embedding on description |
| created_by | uuid | NO | — | FK → auth.users |
| created_at | timestamptz | NO | now() | When uploaded |

#### `asset_persons`

Junction table tagging persons in assets.

| Column | Type | Nullable | Default | Description |
|--------|------|:--------:|---------|-------------|
| asset_id | uuid | NO | — | FK → assets (composite PK) |
| person_id | uuid | NO | — | FK → persons (composite PK) |
| is_primary | boolean | YES | false | Primary subject of the asset |
| face_index | integer | YES | — | Face position index (future face recognition) |
| created_at | timestamptz | NO | now() | When tagged |

#### `asset_tags`

Free-form tags on assets.

| Column | Type | Nullable | Default | Description |
|--------|------|:--------:|---------|-------------|
| **id** | uuid | NO | uuid_generate_v4() | Primary key |
| household_id | uuid | NO | — | FK → households |
| asset_id | uuid | NO | — | FK → assets |
| tag | text | NO | — | Tag value (e.g., `'wedding'`, `'black-and-white'`, `'1960s'`) |
| created_at | timestamptz | NO | now() | When tagged |

---

### 6.5 Stories & Narratives

#### `stories`

Written family stories, oral histories, and narratives.

| Column | Type | Nullable | Default | Description |
|--------|------|:--------:|---------|-------------|
| **id** | uuid | NO | uuid_generate_v4() | Primary key |
| household_id | uuid | NO | — | FK → households |
| title | text | NO | — | Story title |
| content | text | NO | — | Full story content |
| narrator_id | uuid | YES | — | FK → persons (who told this story) |
| era | text | YES | — | Time period (e.g., `'1940s'`, `'Pre-Independence'`, `'Partition'`) |
| location | text | YES | — | Where the story took place |
| tags | text[] | YES | — | Array of tags |
| embedding | vector | YES | — | pgvector embedding for semantic search |
| created_by | uuid | NO | — | FK → auth.users |
| created_at | timestamptz | NO | now() | When added |

#### `story_persons`

Junction table linking persons mentioned in stories.

| Column | Type | Nullable | Default | Description |
|--------|------|:--------:|---------|-------------|
| story_id | uuid | NO | — | FK → stories (composite PK) |
| person_id | uuid | NO | — | FK → persons (composite PK) |
| mention_type | text | YES | 'mentioned' | `'narrator'`, `'subject'`, `'mentioned'` |

---

### 6.6 AI & Search (RAG Pipeline)

#### `documents`

Parent records for the RAG document chunking pipeline.

| Column | Type | Nullable | Default | Description |
|--------|------|:--------:|---------|-------------|
| **id** | uuid | NO | uuid_generate_v4() | Primary key |
| household_id | uuid | NO | — | FK → households |
| title | text | NO | — | Document title |
| doc_type | text | NO | — | `'person_bio'`, `'event_desc'`, `'story'`, `'asset_desc'`, `'note'` |
| source_table | text | YES | — | Source table: `'persons'`, `'events'`, `'stories'`, `'assets'` |
| source_id | uuid | YES | — | FK to the source record |
| language | text | YES | — | Content language (e.g., `'en'`, `'hi'`) |
| created_at | timestamptz | NO | now() | When created |

#### `document_chunks`

Chunked text with vector embeddings — the core RAG search table.

| Column | Type | Nullable | Default | Description |
|--------|------|:--------:|---------|-------------|
| **id** | uuid | NO | uuid_generate_v4() | Primary key |
| household_id | uuid | NO | — | FK → households |
| document_id | uuid | NO | — | FK → documents |
| chunk_index | integer | NO | — | Ordering within the document |
| content | text | NO | — | Chunk text content |
| token_count | integer | YES | — | Token count for context window management |
| metadata | jsonb | NO | '{}' | Flexible metadata (source person, event, dates, tags) |
| embedding | vector | YES | — | pgvector embedding for similarity search |
| created_at | timestamptz | NO | now() | When chunked |

#### `chat_sessions`

Conversation sessions between a user and the AI.

| Column | Type | Nullable | Default | Description |
|--------|------|:--------:|---------|-------------|
| **id** | uuid | NO | uuid_generate_v4() | Primary key |
| household_id | uuid | NO | — | FK → households |
| created_by | uuid | NO | — | FK → auth.users |
| title | text | YES | — | Auto-generated session title |
| created_at | timestamptz | NO | now() | Session start time |

#### `chat_messages`

Individual messages within a chat session.

| Column | Type | Nullable | Default | Description |
|--------|------|:--------:|---------|-------------|
| **id** | uuid | NO | uuid_generate_v4() | Primary key |
| household_id | uuid | NO | — | FK → households |
| session_id | uuid | NO | — | FK → chat_sessions |
| role | text | NO | — | `'user'`, `'assistant'`, `'system'` |
| content | text | NO | — | Message content |
| citations | jsonb | YES | — | Source references (which persons, events, stories were cited) |
| created_at | timestamptz | NO | now() | When sent |

---

### 6.7 Background Jobs

#### `ingestion_jobs`

Background job queue for processing uploaded assets.

| Column | Type | Nullable | Default | Description |
|--------|------|:--------:|---------|-------------|
| **id** | uuid | NO | uuid_generate_v4() | Primary key |
| household_id | uuid | NO | — | FK → households |
| source_type | text | NO | — | `'asset_upload'`, `'sheets_sync'`, `'bulk_import'`, `'story_embed'` |
| source_asset_id | uuid | YES | — | FK → assets |
| status | text | NO | 'queued' | `'queued'`, `'processing'`, `'completed'`, `'failed'` |
| error | text | YES | — | Error message if failed |
| created_by | uuid | NO | — | FK → auth.users |
| created_at | timestamptz | NO | now() | When queued |
| completed_at | timestamptz | YES | — | When finished |

---

### 6.8 Sync & Integration

#### `household_sheets`

Google Sheets integration for bulk data entry.

| Column | Type | Nullable | Default | Description |
|--------|------|:--------:|---------|-------------|
| household_id | uuid | NO | — | FK → households (composite PK) |
| sheet_id | text | NO | — | Google Sheet ID |
| sheet_url | text | NO | — | Full Google Sheet URL |
| template_version | text | YES | 'v1' | Template version |
| sync_enabled | boolean | NO | true | Whether auto-sync is active |
| last_synced_at | timestamptz | YES | — | Last successful sync |
| created_by | uuid | NO | — | FK → auth.users |
| created_at | timestamptz | NO | now() | When linked |

---

### 6.9 Views

#### `person_summary` (view)

Pre-computed summary of each person with aggregated counts.

| Column | Type | Source |
|--------|------|--------|
| id | uuid | persons.id |
| household_id | uuid | persons.household_id |
| full_name | text | Computed: first_name + last_name |
| nickname | text | persons.nickname |
| sex | text | persons.sex |
| birth_year | integer | persons.birth_year |
| birth_place | text | persons.birth_place |
| birth_city | text | persons.birth_city |
| birth_country | text | countries.name (joined) |
| is_deceased | boolean | Computed: death_date IS NOT NULL |
| relationship_count | bigint | COUNT from relationships |
| event_count | bigint | COUNT from event_links |
| photo_count | bigint | COUNT from asset_persons |

#### `family_timeline` (view)

Chronological timeline combining events and life milestones.

| Column | Type | Source |
|--------|------|--------|
| household_id | uuid | events.household_id |
| sort_date | date | Computed from event_date or event_year |
| event_year | integer | events.event_year |
| title | text | events.title |
| event_type | text | events.event_type |
| location | text | events.location |
| description | text | events.description |
| people_involved | text[] | Aggregated from event_links |

---

### Embedding Strategy

Vector embeddings (pgvector) are stored in 4 locations:

| Table | Embedding Column | What Gets Embedded |
|-------|-----------------|-------------------|
| `persons` | embedding | Concatenated: name + birth details + bio/notes |
| `assets` | embedding | Asset description / caption |
| `stories` | embedding | Story title + content |
| `document_chunks` | embedding | Chunked text from any source (the primary RAG search target) |

The `document_chunks` table is the main RAG search surface. The embeddings on `persons`, `assets`, and `stories` provide direct semantic search on those specific entities.

---

## 7. Database Functions & Triggers

### Functions

| Function | Purpose | Returns |
|----------|---------|---------|
| `get_linked_household_ids(household_id)` | Returns all household IDs directly linked (1 hop) | uuid[] |
| `search_family_across_households(household_id, embedding, threshold, count)` | Semantic search across document_chunks for household + linked households | table (id, content, source_type, source_id, household_id, similarity) |
| `get_persons_across_households(household_id)` | Returns persons from own + linked households with `is_linked` flag | table |
| `get_relationships_across_households(household_id)` | Returns relationships from own + linked households with `is_linked` flag | table |
| `activate_household_link(link_id)` | Activates a pending household link | void |
| `revoke_household_link(link_id)` | Revokes an active household link | void |
| `enforce_household_member_limit()` | Trigger function — max 5 active members per household | trigger |
| `enforce_single_owner()` | Trigger function — exactly 1 owner per household | trigger |

### Triggers

| Trigger | Table | Event | Function | Purpose |
|---------|-------|-------|----------|---------|
| `check_household_limit` | household_members | BEFORE INSERT | enforce_household_member_limit() | Max 5 active members |
| `check_single_owner` | household_members | BEFORE INSERT OR UPDATE | enforce_single_owner() | Exactly 1 owner |

---

## 8. Row Level Security (RLS)

| Table | Policy | Access | Rule |
|-------|--------|--------|------|
| household_links | Read | authenticated | User's household is household_a or household_b |
| household_links | Insert | authenticated | User is owner of household_a or household_b |
| household_links | Update | authenticated | User is owner of household_a or household_b |

**Pattern for all other tables:** Read access to own household + linked households. Write access to own household only.

---

## 9. SQL Migrations

### 001 — Extensions

```sql
create extension if not exists vector;
create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;
```

### 002 — Core Schema (People)

```sql
create table people (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  birth_date date,
  death_date date,
  birth_place text,
  bio text,
  generation int,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create table relationships (
  id uuid primary key default gen_random_uuid(),
  person_a uuid references people(id) on delete cascade,
  person_b uuid references people(id) on delete cascade,
  type text not null check (type in ('parent', 'spouse', 'sibling')),
  marriage_date date,
  notes text
);

create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date,
  location text,
  description text,
  created_at timestamptz default now()
);

create table event_people (
  event_id uuid references events(id) on delete cascade,
  person_id uuid references people(id) on delete cascade,
  role text,
  primary key (event_id, person_id)
);

create table photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  caption text,
  photo_date date,
  event_id uuid references events(id),
  uploaded_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create table photo_people (
  photo_id uuid references photos(id) on delete cascade,
  person_id uuid references people(id) on delete cascade,
  primary key (photo_id, person_id)
);

create table embeddings (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding vector(1536),
  source_type text check (source_type in ('person', 'event', 'photo')),
  source_id uuid,
  created_at timestamptz default now()
);
```

### Vector Search Function

```sql
create or replace function match_family_history(
  query_embedding vector(1536),
  match_threshold float default 0.7,
  match_count int default 5
)
returns table (
  id uuid,
  content text,
  source_type text,
  source_id uuid,
  similarity float
)
language sql stable
as $$
  select
    e.id,
    e.content,
    e.source_type,
    e.source_id,
    1 - (e.embedding <=> query_embedding) as similarity
  from embeddings e
  where 1 - (e.embedding <=> query_embedding) > match_threshold
  order by e.embedding <=> query_embedding
  limit match_count;
$$;
```

### Storage Bucket

```sql
insert into storage.buckets (id, name, public)
values ('family-photos', 'family-photos', false);

create policy "Authenticated users can upload photos"
on storage.objects for insert to authenticated
with check (bucket_id = 'family-photos');

create policy "Authenticated users can view photos"
on storage.objects for select to authenticated
using (bucket_id = 'family-photos');

create policy "Users can delete own uploads"
on storage.objects for delete to authenticated
using (bucket_id = 'family-photos' and auth.uid()::text = (storage.foldername(name))[1]);
```

### Indexes

```sql
create index idx_people_name on people using gin (name gin_trgm_ops);
create index idx_embeddings_vector on embeddings
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index idx_relationships_persons on relationships (person_a, person_b);
create index idx_event_people on event_people (person_id);
create index idx_photo_people on photo_people (person_id);
```

### RLS Policies (Base)

```sql
alter table people enable row level security;
alter table relationships enable row level security;
alter table events enable row level security;
alter table photos enable row level security;
alter table embeddings enable row level security;

create policy "Authenticated users can read people"
  on people for select to authenticated using (true);
create policy "Authenticated users can insert people"
  on people for insert to authenticated with check (true);
create policy "Authenticated users can update people"
  on people for update to authenticated using (true);

create policy "Authenticated users can read relationships"
  on relationships for select to authenticated using (true);
create policy "Authenticated users can insert relationships"
  on relationships for insert to authenticated with check (true);

create policy "Authenticated users can read events"
  on events for select to authenticated using (true);
create policy "Authenticated users can insert events"
  on events for insert to authenticated with check (true);

create policy "Authenticated users can read photos"
  on photos for select to authenticated using (true);
create policy "Authenticated users can insert photos"
  on photos for insert to authenticated with check (true);

create policy "Authenticated users can read embeddings"
  on embeddings for select to authenticated using (true);
create policy "Authenticated users can insert embeddings"
  on embeddings for insert to authenticated with check (true);
```

---

## 10. MCP Tool Definitions

These definitions are sent to Claude with every API call. Claude reads them to decide which tool to call.

### Read Tools

#### `origin_search_family`
- **Purpose:** Semantic + text search across all family data
- **Args:** `query` (string, required), `limit` (number, optional, default 10)
- **Returns:** Array of matching results with content, source type, source ID, household ID, similarity score
- **Use when:** User asks questions about family history, people, events, or stories
- **Searches:** document_chunks via `search_family_across_households()`, falls back to text search on persons

#### `origin_get_person`
- **Purpose:** Get full details of a specific person including relationships, events, stories, photos
- **Args:** `person_id` (string, optional), `name` (string, optional)
- **Returns:** Person record + arrays of relationships, events, stories, photos
- **Use when:** User asks about a specific person by name

#### `origin_get_family_tree`
- **Purpose:** Get tree structure from a starting person — ancestors and descendants
- **Args:** `person_id` (string, required), `direction` ('ancestors'|'descendants'|'both', default 'both'), `depth` (number, default 3)
- **Returns:** Tree structure with persons and relationships, including linked households

#### `origin_get_events`
- **Purpose:** List events filtered by person, type, date range, or keyword
- **Args:** `person_id`, `event_type`, `year_from`, `year_to`, `keyword`, `limit` (default 20)
- **Returns:** Array of events with linked persons

#### `origin_get_timeline`
- **Purpose:** Chronological family timeline from the `family_timeline` view
- **Args:** `year_from`, `year_to` (both optional)
- **Returns:** Chronological list of events with dates, titles, types, locations, people

#### `origin_search_photos`
- **Purpose:** Search family photos and media assets
- **Args:** `person_id`, `event_id`, `tag`, `year`, `keyword`, `limit` (default 20)
- **Returns:** Array of assets with storage URL, description, date, tagged persons, tags

#### `origin_search_stories`
- **Purpose:** Semantic search on family stories
- **Args:** `query`, `person_id`, `era`, `tag`, `limit` (default 10)
- **Returns:** Array of stories with title, content, narrator, era, location, people

#### `origin_get_today_history`
- **Purpose:** Events and births/deaths that occurred on today's date in history
- **Args:** None
- **Returns:** Events on this day, births on this day, deaths on this day

#### `origin_generate_bio`
- **Purpose:** Generate narrative biography using all available data
- **Args:** `person_id` (string, required)
- **Returns:** AI-generated narrative biography string

### Write Tools

#### `origin_add_person`
- **Purpose:** Add a new person to the family tree
- **Args:** `first_name` (required), `last_name` (required), `middle_name`, `nickname`, `sex`, `birth_year`, `birth_month`, `birth_day`, `birth_date`, `birth_city`, `birth_place`, `birth_country_code`, `death_date`, `notes`
- **Returns:** Created person record with ID
- **Side effects:** Auto-generates embedding, creates document + document_chunk for RAG

#### `origin_update_person`
- **Purpose:** Update existing person's details (only provided fields)
- **Args:** `person_id` (required), plus any field from add_person
- **Returns:** Updated person record
- **Side effects:** Re-generates embedding after update

#### `origin_add_relationship`
- **Purpose:** Create a relationship between two persons
- **Args:** `from_person_id` (required), `to_person_id` (required), `relation_type` (required: 'parent'|'child'|'spouse'|'sibling'), `relation_label`, `start_date`
- **Returns:** Created relationship record

#### `origin_add_event`
- **Purpose:** Record a family event or milestone
- **Args:** `title` (required), `event_type`, `event_date`, `event_year`, `location`, `description`, `person_ids[]`, `roles[]`
- **Returns:** Created event record with linked persons

#### `origin_add_story`
- **Purpose:** Add a family story or narrative
- **Args:** `title` (required), `content` (required), `narrator_id`, `era`, `location`, `tags[]`, `person_ids[]`
- **Returns:** Created story record with auto-generated embedding

### Tool Annotations Summary

| Tool | Read Only | Destructive | Idempotent |
|------|:---------:|:-----------:|:----------:|
| origin_search_family | Yes | No | Yes |
| origin_get_person | Yes | No | Yes |
| origin_get_family_tree | Yes | No | Yes |
| origin_get_events | Yes | No | Yes |
| origin_get_timeline | Yes | No | Yes |
| origin_search_photos | Yes | No | Yes |
| origin_search_stories | Yes | No | Yes |
| origin_get_today_history | Yes | No | Yes |
| origin_generate_bio | Yes | No | Yes |
| origin_add_person | No | No | No |
| origin_update_person | No | No | Yes |
| origin_add_relationship | No | No | No |
| origin_add_event | No | No | No |
| origin_add_story | No | No | No |

---

## 11. MCP Server Implementation

### Tool Registry (`mcp/index.ts`)

```typescript
import { searchFamily } from './handlers/search-family';
import { getPerson } from './handlers/get-person';
import { addPerson } from './handlers/add-person';
import { updatePerson } from './handlers/update-person';
import { addRelationship } from './handlers/add-relationship';
import { getFamilyTree } from './handlers/get-family-tree';
import { addEvent } from './handlers/add-event';
import { getEvents } from './handlers/get-events';
import { getTimeline } from './handlers/get-timeline';
import { searchPhotos } from './handlers/search-photos';
import { addStory } from './handlers/add-story';
import { searchStories } from './handlers/search-stories';
import { getTodayHistory } from './handlers/get-today-history';
import { generateBio } from './handlers/generate-bio';

const toolHandlers: Record<string, Function> = {
  origin_search_family: searchFamily,
  origin_get_person: getPerson,
  origin_add_person: addPerson,
  origin_update_person: updatePerson,
  origin_add_relationship: addRelationship,
  origin_get_family_tree: getFamilyTree,
  origin_add_event: addEvent,
  origin_get_events: getEvents,
  origin_get_timeline: getTimeline,
  origin_search_photos: searchPhotos,
  origin_add_story: addStory,
  origin_search_stories: searchStories,
  origin_get_today_history: getTodayHistory,
  origin_generate_bio: generateBio,
};

export async function executeToolCall(
  toolName: string,
  toolInput: Record<string, unknown>,
  householdId: string,
  userId: string
): Promise<string> {
  const handler = toolHandlers[toolName];

  if (!handler) {
    return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }

  try {
    const result = await handler({ ...toolInput, householdId, userId });
    return JSON.stringify(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return JSON.stringify({
      error: message,
      suggestion: 'Try rephrasing your request or check if the data exists.'
    });
  }
}
```

### Search Family Handler (`mcp/handlers/search-family.ts`)

```typescript
import { supabaseAdmin } from '@/lib/supabase-server';
import { generateEmbedding } from '@/lib/embeddings';

interface SearchFamilyInput {
  query: string;
  limit?: number;
  householdId: string;
  userId: string;
}

export async function searchFamily(input: SearchFamilyInput) {
  const { query, limit = 10, householdId } = input;

  // 1. Generate embedding for the query
  const embedding = await generateEmbedding(query);

  // 2. Search across household + linked households
  const { data: chunks, error } = await supabaseAdmin.rpc(
    'search_family_across_households',
    {
      input_household_id: householdId,
      query_embedding: embedding,
      match_threshold: 0.65,
      match_count: limit,
    }
  );

  if (error) {
    throw new Error(`Search failed: ${error.message}`);
  }

  if (!chunks || chunks.length === 0) {
    // Fallback: direct text search on persons table
    const { data: persons } = await supabaseAdmin
      .from('persons')
      .select('id, first_name, last_name, nickname, birth_year, birth_place, notes')
      .eq('household_id', householdId)
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,nickname.ilike.%${query}%`)
      .limit(limit);

    if (persons && persons.length > 0) {
      return {
        results: persons.map((p) => ({
          type: 'person',
          id: p.id,
          name: `${p.first_name} ${p.last_name}`,
          nickname: p.nickname,
          birth_year: p.birth_year,
          birth_place: p.birth_place,
          notes: p.notes,
        })),
        source: 'text_search',
        count: persons.length,
      };
    }

    return { results: [], source: 'none', count: 0 };
  }

  // 3. Return semantic search results
  return {
    results: chunks.map((c: any) => ({
      content: c.content,
      source_type: c.source_type,
      source_id: c.source_id,
      household_id: c.household_id,
      similarity: Math.round(c.similarity * 100) / 100,
    })),
    source: 'semantic_search',
    count: chunks.length,
  };
}
```

### Add Person Handler (`mcp/handlers/add-person.ts`)

```typescript
import { supabaseAdmin } from '@/lib/supabase-server';
import { generateEmbedding, buildPersonEmbeddingText } from '@/lib/embeddings';

interface AddPersonInput {
  first_name: string;
  last_name: string;
  middle_name?: string;
  nickname?: string;
  sex?: string;
  birth_year?: number;
  birth_month?: number;
  birth_day?: number;
  birth_date?: string;
  birth_city?: string;
  birth_place?: string;
  birth_country_code?: string;
  death_date?: string;
  notes?: string;
  householdId: string;
  userId: string;
}

export async function addPerson(input: AddPersonInput) {
  const { householdId, userId, birth_country_code, ...personData } = input;

  // 1. Resolve country code to country ID
  let birth_country_id = null;
  if (birth_country_code) {
    const { data: country } = await supabaseAdmin
      .from('countries')
      .select('id')
      .eq('code', birth_country_code.toUpperCase())
      .single();
    birth_country_id = country?.id || null;
  }

  // 2. Generate embedding
  const embeddingText = buildPersonEmbeddingText(personData);
  const embedding = await generateEmbedding(embeddingText);

  // 3. Insert person
  const { data: person, error } = await supabaseAdmin
    .from('persons')
    .insert({
      ...personData,
      household_id: householdId,
      birth_country_id,
      embedding,
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add person: ${error.message}`);
  }

  // 4. Create document + chunk for RAG pipeline
  const { data: doc } = await supabaseAdmin
    .from('documents')
    .insert({
      household_id: householdId,
      title: `${person.first_name} ${person.last_name}`,
      doc_type: 'person_bio',
      source_table: 'persons',
      source_id: person.id,
    })
    .select('id')
    .single();

  if (doc) {
    await supabaseAdmin.from('document_chunks').insert({
      household_id: householdId,
      document_id: doc.id,
      chunk_index: 0,
      content: embeddingText,
      token_count: Math.ceil(embeddingText.length / 4),
      metadata: { person_id: person.id, type: 'person_bio' },
      embedding,
    });
  }

  return {
    success: true,
    person: {
      id: person.id,
      name: `${person.first_name} ${person.last_name}`,
      birth_year: person.birth_year,
      birth_place: person.birth_place,
    },
    message: `Added ${person.first_name} ${person.last_name} to the family tree.`,
  };
}
```

---

## 12. API Route: Chat Endpoint

### `app/api/chat/route.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin } from '@/lib/supabase-server';
import { originTools } from '@/mcp/tools';
import { executeToolCall } from '@/mcp/index';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request) {
  const { message, sessionId, householdId, userId } = await request.json();

  // 1. Get or create chat session
  let session = sessionId;
  if (!session) {
    const { data } = await supabaseAdmin
      .from('chat_sessions')
      .insert({ household_id: householdId, created_by: userId })
      .select('id')
      .single();
    session = data?.id;
  }

  // 2. Load chat history
  const { data: history } = await supabaseAdmin
    .from('chat_messages')
    .select('role, content')
    .eq('session_id', session)
    .order('created_at', { ascending: true })
    .limit(50);

  const messages = [
    ...(history || []).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: message },
  ];

  // 3. Save user message
  await supabaseAdmin.from('chat_messages').insert({
    household_id: householdId,
    session_id: session,
    role: 'user',
    content: message,
  });

  // 4. Get household name for system prompt
  const { data: household } = await supabaseAdmin
    .from('households')
    .select('name')
    .eq('id', householdId)
    .single();

  // 5. Build system prompt (see Section 15)
  const systemPrompt = buildSystemPrompt(household?.name);

  // 6. Call Claude with tools
  let response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    system: systemPrompt,
    messages,
    tools: originTools.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.input_schema,
    })),
  });

  // 7. Handle tool use loop
  const allMessages = [...messages];

  while (response.stop_reason === 'tool_use') {
    const assistantContent = response.content;
    allMessages.push({ role: 'assistant', content: assistantContent as any });

    const toolResults = [];
    for (const block of assistantContent) {
      if (block.type === 'tool_use') {
        const result = await executeToolCall(
          block.name,
          block.input as Record<string, unknown>,
          householdId,
          userId
        );
        toolResults.push({
          type: 'tool_result' as const,
          tool_use_id: block.id,
          content: result,
        });
      }
    }

    allMessages.push({ role: 'user', content: toolResults as any });

    response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      system: systemPrompt,
      messages: allMessages,
      tools: originTools.map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: t.input_schema,
      })),
    });
  }

  // 8. Extract final text response
  const assistantMessage = response.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('\n');

  // 9. Save assistant response
  await supabaseAdmin.from('chat_messages').insert({
    household_id: householdId,
    session_id: session,
    role: 'assistant',
    content: assistantMessage,
    citations: null,
  });

  // 10. Return response
  return Response.json({
    message: assistantMessage,
    sessionId: session,
  });
}
```

---

## 13. Embedding Service (RAG Pipeline)

### `lib/embeddings.ts`

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.trim(),
  });
  return response.data[0].embedding;
}

export function buildPersonEmbeddingText(person: {
  first_name: string;
  last_name: string;
  nickname?: string;
  birth_year?: number;
  birth_city?: string;
  birth_place?: string;
  notes?: string;
}): string {
  const parts = [
    `${person.first_name} ${person.last_name}`,
    person.nickname ? `also known as ${person.nickname}` : '',
    person.birth_year ? `born ${person.birth_year}` : '',
    person.birth_city || person.birth_place || '',
    person.notes || '',
  ];
  return parts.filter(Boolean).join('. ');
}
```

---

## 14. Supabase Client Configuration

### Server Client (`lib/supabase-server.ts`)

Uses service role key — bypasses RLS. Used by MCP tool handlers.

```typescript
import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
}

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false },
    db: { schema: 'public' }
  }
);
```

### Browser Client (`lib/supabase-client.ts`)

Uses anon key — respects RLS. Used by frontend for auth and realtime.

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

---

## 15. System Prompt for Claude AI

```
You are MyVansh.AI, a warm and knowledgeable family historian for the "{householdName}" family. You help family members discover, record, and explore their family history through natural conversation.

Your personality:
- Warm, respectful, and curious about family stories
- You speak as if you genuinely care about preserving this family's legacy
- You encourage users to share more details and stories
- When you find connections between family members, you highlight them naturally
- You use culturally appropriate terms when relevant (e.g., Dadi, Nani, Chacha)

Your capabilities:
- Search across the family's entire history (persons, events, stories, photos)
- Add new family members, relationships, events, and stories
- Answer questions about the family tree and relationships
- Find and display family photos
- Generate biographies from available data

Rules:
- Always cite which persons, events, or stories your answers come from
- If you're not sure about something, say so — don't make up family history
- When adding data, always confirm with the user before saving
- When showing search results, summarize them naturally — don't dump raw data
- If asked about a person and multiple matches exist, ask the user to clarify
```

---

## 16. Frontend: Website (Next.js)

### Brand Name

**MyVansh.AI** — "Every Family Has a Story Worth Keeping"

### Design Philosophy

The website uses a warm, premium aesthetic targeted at Baby Boomers, Gen X, and Millennials. The design avoids cold/tech-forward looks and instead feels like a family heirloom — warm, textured, and emotionally inviting.

### Key Pages

- **Landing Page** — Hero with gradient text, feature grid, pricing, testimonials, CTA
- **Login/Signup** — Email/magic link authentication via Supabase Auth
- **Dashboard** — Sidebar navigation with chat, family tree, timeline, photos, stories, settings
- **Chat View** — Full-screen AI chat interface (primary interaction mode)
- **Family Tree View** — Visual tree diagram (D3.js)
- **Timeline View** — Chronological family events
- **Photos/Assets** — Media gallery with tagging
- **Settings** — Household management, member invites, account settings

### Fonts

- **Display:** Fraunces (serif) — for headings and brand elements
- **Body:** Plus Jakarta Sans (sans-serif) — for all body text
- **Mono:** IBM Plex Mono — for technical/code elements

### Dashboard Sidebar Navigation

- Chat (AI Conversation)
- Family Tree
- Timeline
- Members (Persons)
- Events
- Photos & Docs
- Stories
- Settings (Household, Members, Invitations)

---

## 17. Frontend: iOS App (Swift)

The iOS app targets **Gen X users primarily** on iPhone and iPad. It is a **chat-first** and **voice-first** interface.

### Key Features

- Chat interface calling the same `/api/chat` endpoint as the website
- Voice input via Whisper API for hands-free storytelling
- Photo upload from camera roll
- Push notifications for "Today in Family History"
- Offline message queue

### API Integration

The iOS app calls the exact same Next.js `/api/chat` endpoint deployed on Vercel. No separate backend needed.

---

## 18. Design System & Brand Tokens

```css
:root {
  /* Primary Gradient */
  --pink: #F093FB;
  --pink-deep: #D462E5;
  --coral: #F5576C;
  --coral-deep: #E03E54;
  --gold: #FFD452;
  --gold-deep: #F0B429;

  /* Backgrounds */
  --bg: #FBF8F3;
  --bg-alt: #F4EFE6;
  --bg-white: #FFFFFF;
  --bg-dark: #1A1215;

  /* Text Scale */
  --text-900: #1A1215;
  --text-800: #2D2328;
  --text-700: #4A3F46;
  --text-600: #6B5E64;
  --text-500: #8B7E84;
  --text-400: #A89CA2;
  --text-300: #C4BAC0;

  /* Accent Colors */
  --teal: #2DD4BF;
  --blue: #60A5FA;
  --purple: #A78BFA;

  /* Gradients */
  --gradient: linear-gradient(135deg, var(--pink), var(--coral), var(--gold));
  --gradient-h: linear-gradient(90deg, var(--pink), var(--coral), var(--gold));

  /* Typography */
  --font-display: 'Fraunces', serif;
  --font-body: 'Plus Jakarta Sans', sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;

  /* Shadows */
  --shadow-sm: 0 1px 6px rgba(0,0,0,0.035);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.06);
  --shadow-lg: 0 12px 40px rgba(0,0,0,0.08);

  /* Layout */
  --sidebar-w: 260px;
}
```

---

## 19. Conversation Flow Examples

### Reading Data
```
User:     "Who was my great grandmother on dad's side?"
Claude:   Calls origin_search_family tool → queries Supabase
Supabase: Returns matching person records
Claude:   "Your great grandmother was Savitri Devi, born August 22, 1940
           in Varanasi. She was a homemaker and had 4 children..."
```

### Writing Data
```
User:     "Add my grandfather — Ramesh Kumar, born March 15, 1935 in
           Allahabad. He was a school teacher."
Claude:   Calls origin_add_person tool → inserts into Supabase
Claude:   "Done! I've added Ramesh Kumar to the family history.
           Want to add his spouse or link him to any events?"
```

### Photo Search
```
User:     "Show me photos from grandpa's wedding"
Claude:   Calls origin_search_photos tool → queries Supabase + Storage
Claude:   "I found 3 photos from Ramesh and Savitri's wedding in 1958.
           [displays photos with captions]"
```

### Story Recording
```
User:     "My grandmother used to tell this story about how grandpa
           walked 10 miles to school every day during monsoon season..."
Claude:   Calls origin_add_story tool → saves to stories table
Claude:   "What a wonderful story! I've saved it as 'Grandpa's Monsoon
           Walk to School.' Want to tag which family members are in it?"
```

---

## 20. Household & Invitation Logic

### Creating a Household (Signup Flow)

1. User signs up via Supabase Auth
2. Profile created in `profiles` table
3. User creates a household (names it, e.g., "The Kumar Family")
4. User automatically becomes the **Owner** (role='owner' in `household_members`)
5. Owner can invite up to 4 more members

### Inviting a Member

1. Owner sends invitation (`invite_type = 'member'`)
2. Invitation record created with `token_hash` and `expires_at`
3. Email sent to invitee with secure link
4. Invitee clicks link → signs up / logs in → added to household as member
5. Trigger `check_household_limit` enforces max 5

### Inviting a New Household (Cross-Family Linking)

1. Owner sends invitation (`invite_type = 'household'`, `link_person_id` = shared ancestor)
2. Invitee receives email with secure link
3. Invitee creates their own new household (they become Owner of that household)
4. System creates `household_links` record linking the two households at the shared ancestor
5. Both households can now search across each other's data (1 hop only)

---

## 21. Cross-Household Linking

### How It Works

1. Household A invites Household B, specifying a shared ancestor (e.g., "Grandpa Ramesh")
2. Each household keeps its own copy of the shared person (`person_a` in A, `person_b` in B)
3. `household_links` record connects the two with status 'pending'
4. When B accepts, `activate_household_link()` sets status to 'active'
5. AI search via `search_family_across_households()` now spans both households
6. Either owner can `revoke_household_link()` to disconnect

### Query Scope

All cross-household functions use `get_linked_household_ids()` which returns only **directly linked (1 hop)** households. No transitive chains (A→B→C).

---

## 22. Deployment (Vercel)

### Steps

1. Push code to GitHub
2. Import repository in Vercel
3. Set environment variables in Vercel Dashboard → Settings → Environment Variables
4. Deploy — auto-builds on every push to `main`

### Serverless Config (`vercel.json`)

```json
{
  "functions": {
    "app/api/chat/route.ts": {
      "maxDuration": 60
    }
  }
}
```

The `/api/chat` endpoint runs as a Vercel Serverless Function. Default timeout is 10 seconds; increase to 60 seconds for complex multi-tool queries.

---

## 23. Testing

### cURL Tests

```bash
# Test search
curl -X POST https://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me about Ramesh Kumar", "householdId": "...", "userId": "..."}'

# Test add person
curl -X POST https://localhost:3000/api/chat \
  -d '{"message": "Add my grandfather Ramesh Kumar, born 1935 in Allahabad", "householdId": "...", "userId": "..."}'

# Test timeline
curl -X POST https://localhost:3000/api/chat \
  -d '{"message": "Show me the family timeline from 1900 to 1960", "householdId": "...", "userId": "..."}'
```

### MCP Inspector (Local)

```bash
npx @modelcontextprotocol/inspector
```

---

## 24. Build Phases & Roadmap

### Phase 1 — Foundation (Week 1)
- [ ] Create Supabase project
- [ ] Run database migrations
- [ ] Seed initial family data (10–15 members)
- [ ] Set up Next.js project with Tailwind
- [ ] Configure Supabase client library

### Phase 2 — Core MCP Tools (Week 2)
- [ ] Build `origin_search_family` (semantic + text search)
- [ ] Build `origin_get_person` (fetch person details)
- [ ] Build `origin_add_person` (add new member + auto-embed)
- [ ] Build `origin_add_event` (record family event)
- [ ] Build `origin_add_relationship` (link two people)
- [ ] Wire MCP tools to Claude API

### Phase 3 — Chat Interface (Week 3)
- [ ] Build ChatWindow and MessageBubble components
- [ ] Create /api/chat route with Claude + MCP integration
- [ ] Add streaming responses (Vercel AI SDK)
- [ ] Set up Supabase Auth (login/signup)
- [ ] Test end-to-end flow

### Phase 4 — Photos & Media (Week 4)
- [ ] Set up Supabase Storage bucket for photos
- [ ] Build upload and search photo tools
- [ ] Build PhotoViewer component
- [ ] Add photo upload UI in chat

### Phase 5 — Polish & Launch (Week 5)
- [ ] Build FamilyTreeView component (visual tree with D3.js)
- [ ] Add `origin_get_family_tree` tool
- [ ] Mobile responsiveness
- [ ] Error handling and loading states
- [ ] Deploy to Vercel
- [ ] Set up custom domain

### Phase 6 — iOS App (Week 6–8)
- [ ] Set up Xcode project with SwiftUI
- [ ] Build chat interface calling /api/chat
- [ ] Add voice input (Whisper API)
- [ ] Photo upload from camera roll
- [ ] Push notifications

### Phase 7 — Household Linking (Week 9–10)
- [ ] Implement invitation system
- [ ] Build household linking flow
- [ ] Cross-household search
- [ ] Invitation acceptance UI

---

## 25. Cost Estimates

| Service | Free Tier | After Free Tier |
|---------|-----------|-----------------|
| Supabase (DB + Auth + Storage) | 500MB DB, 1GB storage | $25/month (Pro) |
| Claude API (Sonnet 4.5) | N/A | ~$5–10/month |
| OpenAI Embeddings | N/A | ~$1–2/month |
| Vercel Hosting | Free tier (hobby) | $0 |
| Custom Domain | N/A | ~$12/year |
| **Total (free tier)** | | **~$7–12/month** |
| **Total (after free tier)** | | **~$30–40/month** |

---

## 26. Future Enhancements

- **Family tree visualization** — interactive D3.js tree diagram
- **Timeline view** — chronological family events on a visual timeline
- **Multi-language support** — Hindi, regional languages for older family members
- **Voice input** — let elders speak instead of type (Whisper API)
- **Export** — generate PDF family book from the database
- **WhatsApp/Telegram bot** — alternative interface for less tech-savvy members
- **AI-generated stories** — Claude writes narrative biographies from data
- **Ancestry.com import** — GEDCOM file parser to bulk-import existing trees
- **Search by face** — photo face recognition to auto-tag people
- **Google Sheets sync** — bidirectional sync for bulk data entry
- **Daily "Today in History"** — push notifications for birthdays and anniversaries

---

## Appendix: Setup Instructions (Quick Start)

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free at supabase.com)
- Anthropic API key (from console.anthropic.com)
- OpenAI API key (from platform.openai.com) — for embeddings
- Vercel account (free at vercel.com)
- GitHub account

### Quick Start

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/myvansh-ai.git
cd myvansh-ai
npm install

# 2. Configure
cp .env.example .env.local
# Fill in API keys

# 3. Database
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push

# 4. Run
npm run dev
# Open http://localhost:3000

# 5. Deploy
# Push to GitHub → Vercel auto-deploys
```

---

## Appendix: Useful Links

- [Supabase Docs](https://supabase.com/docs)
- [Supabase pgvector Guide](https://supabase.com/docs/guides/ai/vector-columns)
- [Claude API Docs](https://docs.anthropic.com)
- [MCP Protocol Spec](https://modelcontextprotocol.io)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Vercel Deployment](https://vercel.com/docs)

---

*This document is the single source of truth for building MyVansh.AI with Claude Code. All database schemas, API implementations, tool definitions, and business logic are consolidated here.*
