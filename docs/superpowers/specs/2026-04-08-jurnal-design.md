# Jurnal — Design Spec

## Overview

Jurnal is an AI-powered daily journaling web app focused on mental wellness. Users record their thoughts via voice (or text), and an AI companion asks follow-up questions to help them dig deeper into their emotions and experiences. The AI remembers past conversations, tracks mood trends, and proactively follows up on events and emotional patterns.

**Target users:** Small group (the developer + friends) — no enterprise multi-tenancy needed.

**Core value proposition:** A journal that listens, remembers, and asks the right questions — turning a passive diary into an active reflective companion.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js + React + shadcn/ui + Tailwind CSS (mobile-first responsive) |
| Backend | Next.js API routes (monorepo) |
| Database | Neon (PostgreSQL + pgvector) |
| Auth | NextAuth.js with Google provider |
| LLM | Gemini 3 Flash (`gemini-3-flash-preview`) |
| Embeddings | `gemini-embedding-2-preview` (768 dimensions) |
| Speech-to-Text | Google Cloud Speech-to-Text V2 with Chirp 3 (streaming real-time) |
| Deploy | Vercel (via CLI) |
| DB Management | Neon CLI |

## Data Model

### `users`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | |
| email | text (unique) | Google account email |
| name | text | Display name from Google |
| created_at | timestamptz | |

### `sessions`

One per day per user. Represents a complete journaling session.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | |
| user_id | uuid (FK → users) | |
| date | date (unique per user) | Session date |
| transcript | text | Full conversation (user + AI) |
| summary | text | AI-generated end-of-session summary (2-3 paragraphs) |
| mood_score | integer (1-100) | AI-assigned daily mood score |
| mood_keywords | text[] | 3-5 emotion keywords (e.g., ["ansioso", "motivato"]) |
| embedding | vector(768) | Embedding of the summary for semantic search |
| created_at | timestamptz | |

### `facts`

Structured information extracted by the LLM after each session. This is the AI's memory system.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | |
| user_id | uuid (FK → users) | |
| session_id | uuid (FK → sessions) | Source session |
| type | enum | `event`, `emotion`, `person`, `theme`, `insight` |
| content | text | The fact itself ("Ha un colloquio di lavoro") |
| reference_date | date (nullable) | Date the fact refers to (null if not temporal) |
| tags | text[] | Correlation tags (["lavoro", "ansia", "colloquio"]) |
| status | enum | `active`, `followed_up`, `expired` |
| created_at | timestamptz | |

### `messages`

Individual messages within a session, for reconstructing the conversation flow.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | |
| session_id | uuid (FK → sessions) | |
| role | enum | `user`, `assistant` |
| content | text | Message text |
| created_at | timestamptz | |

### Key Queries

**Daily follow-up events:**
```sql
SELECT * FROM facts
WHERE user_id = $1 AND reference_date = CURRENT_DATE AND status = 'active'
```

**Recent mood trend:**
```sql
SELECT date, mood_score, mood_keywords FROM sessions
WHERE user_id = $1 ORDER BY date DESC LIMIT 7
```

**Thematically correlated facts:**
```sql
SELECT * FROM facts
WHERE user_id = $1 AND status = 'active' AND tags && $2
ORDER BY created_at DESC LIMIT 10
```

## Session Flow

### 1. Pre-Session (on app open)

When the user opens the app, the backend prepares a context briefing:
- Facts with `reference_date = today` (events to follow up)
- Mood scores + keywords from the last 7 days
- Active facts with recent/relevant tags

This briefing is injected into the Gemini system prompt as structured context.

### 2. Brain Dump (voice or text)

- User taps the microphone button
- Audio streams to Google Cloud Speech-to-Text V2 (Chirp 3) via WebSocket
- Words appear in real-time as the user speaks
- When the user stops, the transcribed text is saved as the first message

### 3. AI Question Cycle (3-5 iterations)

Gemini receives:
- **System prompt**: role definition, tone guidelines, ethical boundaries
- **Context briefing**: today's follow-up events, mood trends, correlated facts
- **Conversation so far**: brain dump + all previous Q&A in this session

Gemini generates ONE question at a time. The user responds (voice → Chirp 3 → text, or typed). The cycle repeats 3-5 times. Gemini decides when to close based on:
- Has it covered the follow-up events?
- Has the user explored their emotions sufficiently?
- Is the user giving short answers (signal to wrap up)?

**Closure mechanism:** Gemini's response includes a structured JSON field `"session_complete": true/false`. When `true`, the frontend stops the question cycle and triggers session closure. The system prompt instructs Gemini to set this to `true` after 3-5 exchanges, or earlier if the user signals they want to wrap up.

### 4. Session Closure (single Gemini call)

After the conversation ends, one final Gemini call with the full transcript produces structured JSON:

```json
{
  "summary": "2-3 paragraph summary of the day",
  "mood_score": 72,
  "mood_keywords": ["sollevato", "in attesa", "motivato"],
  "facts": [
    {
      "type": "event",
      "content": "Secondo colloquio di lavoro",
      "reference_date": "2026-04-15",
      "tags": ["lavoro", "colloquio"]
    },
    {
      "type": "emotion",
      "content": "Si sente sollevato dopo il primo colloquio ma ansioso per il secondo",
      "tags": ["lavoro", "ansia", "sollievo"]
    }
  ]
}
```

All data is saved to the database: session record, individual messages, extracted facts.

### 5. Embedding (async, post-session)

The session summary is embedded via `gemini-embedding-2-preview` and stored in the `sessions.embedding` column for future semantic search.

## AI Personality & System Prompt Guidelines

The AI companion is:
- **Empathetic but not a therapist** — asks open questions, reflects, connects patterns. Never diagnoses, prescribes, or gives medical advice.
- **Warm and conversational** — uses informal Italian, matches the user's energy level.
- **Proactively curious** — references past sessions naturally ("la settimana scorsa mi avevi parlato di...").
- **Respectful of boundaries** — if a user gives short answers or deflects, the AI doesn't push.
- **Concise** — questions are 1-2 sentences, not paragraphs.

The system prompt includes a structured context block with today's follow-up events, mood trends, and correlated facts. This context is refreshed at the start of each session.

## Frontend Architecture

### Pages

1. **`/login`** — Google Sign-In button. Nothing else.

2. **`/` (Home)** — Daily hub
   - If no session today → greeting + record button (prominent)
   - If session exists → today's summary card with mood score
   - Below: last session card (yesterday's entry preview)

3. **`/session`** — Active journaling session
   - Chat-like interface (simplified, not a full chat app)
   - Large microphone button at the bottom (press to talk / press to stop)
   - Real-time transcription appears as the user speaks
   - AI responses appear as bubbles
   - Progress dots (subtle indicator of how many questions remain)
   - Text input as alternative to voice

4. **`/history`** — Session archive
   - Chronological list (infinite scroll)
   - Each card: date, mood score (colored), keywords, summary preview
   - Tap → full summary + conversation transcript

5. **`/dashboard`** — Mood trends
   - Line chart of mood score over time (7 / 30 / 90 day views)
   - Most frequent keywords as pills/tags
   - Simple trend insight ("questa settimana stai meglio della scorsa")

### Navigation

Bottom tab bar (mobile-first): Home | History | Dashboard

### Visual Style

- **Theme:** Dark, with aurora boreale animated gradient as subtle background accent
- **Typography:** Libre Baskerville (serif) for main questions and emotional content, DM Sans for UI elements and metadata
- **Color palette:**
  - Background: `#0a0a0a` (near black)
  - Primary accent: violet `rgba(120, 80, 220)` → teal `rgba(60, 180, 160)` gradient
  - Positive emotions: teal tones
  - Negative emotions: soft pink `rgba(200, 100, 150)`
  - Neutral: violet tones
  - Text: soft white `rgba(255, 255, 255, 0.5-0.9)` at varying opacities
- **Cards:** `rgba(255,255,255,0.03)` background with `rgba(255,255,255,0.06)` borders
- **Record button:** 72px circle with violet→teal gradient and subtle glow
- **Animations:** Aurora background (slow pulse), wave bars during recording, smooth transitions

## Architecture Decisions

### Why Hybrid (Relational + Extracted Facts) over Knowledge Graph

The knowledge graph (Neo4j) is the most natural representation of human thoughts and connections. However, for this MVP:
- Few users → graph DB infrastructure overhead is unjustified
- The extracted facts table provides 90% of the graph's value at 30% of the complexity
- Facts are the building blocks for a future graph layer — the extraction pipeline is the same
- PostgreSQL + pgvector handles both structured queries (SQL for temporal follow-ups) and semantic search (vector similarity) in a single database

If the app grows and deeper pattern detection is needed (connections at N degrees of separation), a graph layer can be added on top of the existing facts data without rewriting the extraction pipeline.

### Why Chirp 3 over Gemini Native Audio

Gemini 3 Flash can process audio natively (multimodal input), which would simplify the pipeline to a single API call. However:
- Chirp 3 provides **real-time streaming transcription** — words appear as the user speaks, giving immediate feedback
- For a journaling app focused on mental wellness, the feeling of "being heard" in real-time is important UX
- Gemini native audio does not support real-time transcription
- Trade-off: slightly more complex pipeline (two services instead of one), but better user experience

### Why Gemini 3 Flash

- Frontier-class performance at cost-effective pricing
- Fast response times (important for conversational flow — user shouldn't wait long between speaking and getting a question back)
- Sufficient quality for empathetic questioning and fact extraction
- If deeper analysis is needed for pattern detection, can upgrade to Gemini 3 Pro for specific calls

## Out of Scope (for MVP)

- Push notifications / reminders to journal
- Export data (PDF, CSV)
- Multiple journals per user
- Therapist/coach integration
- Social features (sharing entries)
- Advanced graph-based pattern detection (future upgrade path exists)
- Native mobile app (web app with responsive design is sufficient)
- End-to-end encryption (trust model is personal use among friends)
