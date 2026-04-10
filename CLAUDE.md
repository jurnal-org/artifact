# Jurnal

AI-powered daily journaling web app focused on mental wellness. Users record thoughts via voice (or text), an AI companion asks follow-up questions, and the system tracks mood trends and proactively follows up on past events.

## Tech Stack

- **Frontend:** Next.js 16 + React 19 + shadcn/ui + Tailwind CSS 4
- **Backend:** Next.js API routes (monorepo)
- **Database:** Neon (PostgreSQL 17 + pgvector)
- **Auth:** NextAuth.js with Google OAuth
- **LLM:** Gemini 3 Flash (`gemini-3-flash-preview`)
- **Embeddings:** `gemini-embedding-2-preview` (768 dimensions)
- **Speech-to-Text:** Web Speech API (browser native, Italian `it-IT`)
- **Deploy:** Vercel

## Neon Database

- **Project:** jurnal
- **Project ID:** `divine-hill-95608352`
- **Region:** aws-us-west-2
- **Database:** neondb
- **Connection (pooled):** `ep-long-frog-ak9p1jcy-pooler.c-3.us-west-2.aws.neon.tech`
- **Neon API Key:** stored separately (not on the Francesco org account)
- **Tables:** `users`, `sessions`, `facts`, `messages`
- **Extensions:** pgvector
- **Migration file:** `sql/migrations/001-initial-schema.sql`

## Google Cloud

- **OAuth Client ID:** `1886479842-mreb8flqbl79m1n59dl3mqelusnik0cn.apps.googleusercontent.com`
- **Redirect URI:** `http://localhost:3000/api/auth/callback/google` (dev), update for production
- **Gemini API:** via Google AI Studio key in `GOOGLE_AI_API_KEY`

## Project Structure

```
app/
  layout.tsx              # Root layout with fonts (DM Sans + Libre Baskerville), dark theme, Providers
  page.tsx                # Home: greeting + start session or show today's summary
  login/page.tsx          # Google Sign-In
  session/page.tsx        # Active journaling: voice/text input, AI chat, session closure
  history/page.tsx        # Chronological session list
  history/[id]/page.tsx   # Session detail with summary + conversation
  dashboard/page.tsx      # Mood chart (recharts), keyword cloud, trend insights
  api/
    auth/[...nextauth]/   # NextAuth handler
    briefing/             # GET pre-session context (follow-up facts, mood trend)
    sessions/             # GET today, POST create, history, [id] detail
    messages/             # POST send message -> Gemini response
    close-session/        # POST generate summary, mood score, extract facts, embed
    dashboard/            # GET mood data + keyword aggregation
    stt-token/            # GET STT credentials
    health/               # Health check

lib/
  auth.ts                 # NextAuth config + getAuthenticatedUserId()
  db.ts                   # Neon serverless client
  gemini.ts               # Gemini 3 Flash client (chatWithGemini, generateClosure)
  embedding.ts            # gemini-embedding-2-preview (embedText)
  prompts.ts              # System prompts: conversation (Italian) + closure (JSON output)
  types.ts                # TypeScript interfaces: User, Session, Fact, Message, SessionBriefing, SessionClosure, AiResponse

components/
  providers.tsx           # SessionProvider wrapper (client component)
  aurora-background.tsx   # Animated aurora gradient (violet/teal/pink)
  bottom-nav.tsx          # Tab bar: Home | Storico | Trend
  mood-score.tsx          # Score display with color tiers (teal >= 70, violet >= 40, pink < 40)
  mood-pills.tsx          # Keyword pills with sentiment coloring
  session-card.tsx        # Session summary card
  chat-bubble.tsx         # User/assistant message bubbles
  voice-recorder.tsx      # Mic button with wave animation
  wave-indicator.tsx      # Animated wave bars during recording
  progress-dots.tsx       # Session progress indicator
  mood-chart.tsx          # Recharts LineChart with gradient
  keyword-cloud.tsx       # Frequency-based keyword pills
  ui/                     # shadcn components (button, card, input, scroll-area, tabs, avatar, separator, skeleton)

hooks/
  use-voice-recorder.ts   # Web Speech API hook (it-IT, continuous, interim results)
  use-session-chat.ts     # Chat state management, message sending, session closure
```

## Key Flows

### Session Flow
1. User opens app -> backend prepares briefing (follow-up facts, mood trend)
2. User records voice (or types) -> brain dump saved as first message
3. AI asks 3-5 follow-up questions (one at a time), response includes `session_complete: true/false`
4. On closure: Gemini generates summary, mood_score (1-100), mood_keywords, extracts facts
5. Summary embedded via gemini-embedding-2-preview, everything saved to DB

### Facts System (AI Memory)
- After each session, Gemini extracts structured facts: events (with future dates), emotions, persons, themes, insights
- Facts with `reference_date` trigger follow-up questions on that date
- Facts have `status`: active -> followed_up / expired
- Tags enable thematic correlation across sessions

## Visual Style

- **Theme:** Dark (#0a0a0a) with aurora gradient accent
- **Fonts:** Libre Baskerville (serif, emotional content), DM Sans (UI elements)
- **Palette:** Violet rgb(120,80,220) -> Teal rgb(60,180,160) gradient, Pink rgb(200,100,150) for negative
- **Cards:** rgba(255,255,255,0.03) bg, rgba(255,255,255,0.06) border

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npx tsc --noEmit     # Type check
```

## Environment Variables

All in `.env.local` (not committed):
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google OAuth
- `NEXTAUTH_SECRET` — NextAuth session encryption
- `NEXTAUTH_URL` — App URL (http://localhost:3000 for dev)
- `DATABASE_URL` — Neon pooled connection string
- `GOOGLE_AI_API_KEY` — Gemini API (chat + embeddings)
- `GOOGLE_CLOUD_PROJECT_ID` / `GOOGLE_CLOUD_STT_API_KEY` — (reserved for Chirp 3 upgrade)

## Design Docs

- **Spec:** `docs/superpowers/specs/2026-04-08-jurnal-design.md`
- **Plan:** `docs/superpowers/plans/2026-04-08-jurnal-implementation.md`
