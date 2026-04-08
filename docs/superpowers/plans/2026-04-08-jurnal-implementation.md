# Jurnal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an AI-powered daily journaling web app where users record thoughts via voice, an AI companion asks follow-up questions, and the system tracks mood trends and proactively follows up on past events.

**Architecture:** Next.js monorepo with API routes. PostgreSQL (Neon) stores users, sessions, messages, and extracted facts with pgvector for embeddings. Gemini 3 Flash powers the AI companion. Google Cloud Speech-to-Text V2 (Chirp 3) handles real-time voice transcription.

**Tech Stack:** Next.js 15, React 19, shadcn/ui, Tailwind CSS 4, NextAuth.js, Neon (PostgreSQL + pgvector), Gemini 3 Flash, gemini-embedding-2-preview, Google Cloud STT V2 (Chirp 3), Vercel

**Spec:** `docs/superpowers/specs/2026-04-08-jurnal-design.md`

---

## File Structure

```
jurnal/
├── app/
│   ├── layout.tsx                    # Root layout: fonts, theme, providers
│   ├── page.tsx                      # Home page (/ route)
│   ├── login/
│   │   └── page.tsx                  # Login page
│   ├── session/
│   │   └── page.tsx                  # Active journaling session
│   ├── history/
│   │   ├── page.tsx                  # Session archive list
│   │   └── [id]/
│   │       └── page.tsx              # Single session detail
│   ├── dashboard/
│   │   └── page.tsx                  # Mood trends dashboard
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts          # NextAuth.js handler
│       ├── sessions/
│       │   ├── route.ts              # GET today's session, POST create session
│       │   ├── [id]/
│       │   │   └── route.ts          # GET session by id
│       │   └── history/
│       │       └── route.ts          # GET paginated session history
│       ├── messages/
│       │   └── route.ts              # POST send message, get AI response
│       ├── close-session/
│       │   └── route.ts              # POST close session (summary + facts)
│       ├── briefing/
│       │   └── route.ts              # GET pre-session context briefing
│       ├── stt-token/
│       │   └── route.ts              # GET short-lived STT access token
│       └── dashboard/
│           └── route.ts              # GET mood trends data
├── lib/
│   ├── db.ts                         # Neon database client (neon serverless)
│   ├── auth.ts                       # NextAuth.js configuration
│   ├── gemini.ts                     # Gemini API client + prompt templates
│   ├── embedding.ts                  # Gemini embedding-2 client
│   ├── prompts.ts                    # System prompts for conversation + closure
│   └── types.ts                      # Shared TypeScript types
├── components/
│   ├── aurora-background.tsx          # Animated aurora gradient background
│   ├── bottom-nav.tsx                 # Bottom tab navigation
│   ├── mood-score.tsx                 # Mood score display (number + color)
│   ├── mood-pills.tsx                 # Mood keyword pills
│   ├── session-card.tsx               # Session summary card (used in home + history)
│   ├── chat-bubble.tsx                # Message bubble (user/assistant variants)
│   ├── voice-recorder.tsx             # Mic button + Chirp 3 streaming integration
│   ├── wave-indicator.tsx             # Animated wave bars during recording
│   ├── progress-dots.tsx              # Session progress dots
│   ├── mood-chart.tsx                 # Line chart for dashboard
│   └── keyword-cloud.tsx              # Keyword frequency pills
├── hooks/
│   ├── use-session-chat.ts            # Chat state + message sending logic
│   └── use-voice-recorder.ts          # Voice recording + STT streaming logic
├── sql/
│   └── migrations/
│       └── 001-initial-schema.sql     # Full database schema
├── .env.local.example                 # Environment variables template
├── next.config.ts                     # Next.js configuration
├── tailwind.config.ts                 # Tailwind with custom theme
└── package.json
```

---

## Task 1: Project Scaffold + Dependencies

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `app/layout.tsx`, `app/page.tsx`, `.env.local.example`, `.gitignore`

- [ ] **Step 1: Create Next.js project**

```bash
cd /Users/francescoguidolin/Documents/Jurnal
npx create-next-app@latest . --typescript --tailwind --eslint --app --src=false --import-alias "@/*" --use-npm
```

Accept defaults. This creates the Next.js scaffold in the current directory.

- [ ] **Step 2: Install dependencies**

```bash
npm install next-auth @neondatabase/serverless @google/genai @google-cloud/speech recharts date-fns
npm install -D @types/node
```

Packages:
- `next-auth`: Authentication with Google
- `@neondatabase/serverless`: Neon PostgreSQL client (serverless-compatible)
- `@google/genai`: Google Gemini API client (LLM + embeddings)
- `@google-cloud/speech`: Google Cloud Speech-to-Text V2 (Chirp 3)
- `recharts`: Charts for mood dashboard
- `date-fns`: Date formatting utilities

- [ ] **Step 3: Install shadcn/ui**

```bash
npx shadcn@latest init -d
```

Then install the components we need:

```bash
npx shadcn@latest add button card input scroll-area tabs avatar separator skeleton
```

- [ ] **Step 4: Configure custom theme in tailwind.config.ts**

Replace the contents of `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Libre Baskerville", "Georgia", "serif"],
        sans: ["DM Sans", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        background: "#0a0a0a",
        foreground: "rgba(255, 255, 255, 0.85)",
        muted: "rgba(255, 255, 255, 0.5)",
        "muted-foreground": "rgba(255, 255, 255, 0.35)",
        violet: {
          DEFAULT: "rgb(120, 80, 220)",
          light: "rgba(160, 130, 240, 0.8)",
          dim: "rgba(120, 80, 220, 0.5)",
        },
        teal: {
          DEFAULT: "rgb(60, 180, 160)",
          light: "rgba(60, 180, 160, 0.7)",
          dim: "rgba(60, 180, 160, 0.5)",
        },
        pink: {
          DEFAULT: "rgb(200, 100, 150)",
          light: "rgba(200, 130, 160, 0.7)",
        },
        card: {
          DEFAULT: "rgba(255, 255, 255, 0.03)",
          border: "rgba(255, 255, 255, 0.06)",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

- [ ] **Step 5: Create .env.local.example**

```bash
# Auth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# Database (Neon)
DATABASE_URL=

# Google AI (Gemini)
GOOGLE_AI_API_KEY=

# Google Cloud Speech-to-Text
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_CLOUD_STT_API_KEY=
```

- [ ] **Step 6: Create root layout with fonts and dark theme**

Replace `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { DM_Sans, Libre_Baskerville } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600"],
});

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Jurnal",
  description: "Il tuo diario personale con AI companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className="dark">
      <body
        className={`${dmSans.variable} ${libreBaskerville.variable} font-sans bg-background text-foreground antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Add base CSS**

Replace `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-card-border;
  }
  body {
    @apply bg-background text-foreground;
    min-height: 100dvh;
  }
}
```

- [ ] **Step 8: Create placeholder home page**

Replace `app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <h1 className="font-serif text-3xl text-foreground">Jurnal</h1>
    </main>
  );
}
```

- [ ] **Step 9: Verify dev server starts**

```bash
npm run dev
```

Expected: Server starts on http://localhost:3000, shows "Jurnal" centered on dark background.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with dependencies and theme"
```

---

## Task 2: Database Schema + Neon Setup

**Files:**
- Create: `sql/migrations/001-initial-schema.sql`, `lib/db.ts`, `lib/types.ts`

- [ ] **Step 1: Create the migration SQL file**

Create `sql/migrations/001-initial-schema.sql`:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sessions table (one per day per user)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  transcript TEXT,
  summary TEXT,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 100),
  mood_keywords TEXT[] DEFAULT '{}',
  embedding vector(768),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Fact types enum
CREATE TYPE fact_type AS ENUM ('event', 'emotion', 'person', 'theme', 'insight');

-- Fact status enum
CREATE TYPE fact_status AS ENUM ('active', 'followed_up', 'expired');

-- Facts table (AI memory)
CREATE TABLE facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  type fact_type NOT NULL,
  content TEXT NOT NULL,
  reference_date DATE,
  tags TEXT[] DEFAULT '{}',
  status fact_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for key queries
CREATE INDEX idx_sessions_user_date ON sessions(user_id, date DESC);
CREATE INDEX idx_facts_user_reference_date ON facts(user_id, reference_date) WHERE status = 'active';
CREATE INDEX idx_facts_user_tags ON facts USING GIN(tags) WHERE status = 'active';
CREATE INDEX idx_messages_session ON messages(session_id, created_at);
```

- [ ] **Step 2: Run migration on Neon**

Use the Neon MCP tool to create a project (if not existing) and run the migration:

```bash
# Read the migration file and execute via Neon MCP run_sql
```

Use `mcp__Neon__create_project` to create the Neon project named "jurnal", then use `mcp__Neon__run_sql` to execute the migration SQL.

Save the connection string to `.env.local` as `DATABASE_URL`.

- [ ] **Step 3: Create database client**

Create `lib/db.ts`:

```ts
import { neon } from "@neondatabase/serverless";

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  return neon(process.env.DATABASE_URL);
}
```

- [ ] **Step 4: Create shared types**

Create `lib/types.ts`:

```ts
export type FactType = "event" | "emotion" | "person" | "theme" | "insight";
export type FactStatus = "active" | "followed_up" | "expired";
export type MessageRole = "user" | "assistant";

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  date: string;
  transcript: string | null;
  summary: string | null;
  mood_score: number | null;
  mood_keywords: string[];
  created_at: string;
}

export interface Fact {
  id: string;
  user_id: string;
  session_id: string;
  type: FactType;
  content: string;
  reference_date: string | null;
  tags: string[];
  status: FactStatus;
  created_at: string;
}

export interface Message {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

export interface SessionBriefing {
  todayFollowUps: Fact[];
  moodTrend: { date: string; mood_score: number; mood_keywords: string[] }[];
  correlatedFacts: Fact[];
}

export interface SessionClosure {
  summary: string;
  mood_score: number;
  mood_keywords: string[];
  facts: {
    type: FactType;
    content: string;
    reference_date: string | null;
    tags: string[];
  }[];
}

export interface AiResponse {
  message: string;
  session_complete: boolean;
}
```

- [ ] **Step 5: Commit**

```bash
git add sql/ lib/db.ts lib/types.ts
git commit -m "feat: add database schema, Neon client, and TypeScript types"
```

---

## Task 3: Authentication (NextAuth.js + Google)

**Files:**
- Create: `lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `app/login/page.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create NextAuth configuration**

Create `lib/auth.ts`:

```ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getDb } from "./db";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const sql = getDb();
      await sql`
        INSERT INTO users (email, name)
        VALUES (${user.email!}, ${user.name!})
        ON CONFLICT (email) DO UPDATE SET name = ${user.name!}
      `;
      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        const sql = getDb();
        const rows = await sql`
          SELECT id FROM users WHERE email = ${session.user.email}
        `;
        if (rows.length > 0) {
          (session as any).userId = rows[0].id;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
```

- [ ] **Step 2: Create NextAuth route handler**

Create `app/api/auth/[...nextauth]/route.ts`:

```ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

- [ ] **Step 3: Create session provider wrapper**

Add a client-side provider. Modify `app/layout.tsx` — wrap `{children}` in the SessionProvider:

```tsx
import type { Metadata } from "next";
import { DM_Sans, Libre_Baskerville } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600"],
});

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Jurnal",
  description: "Il tuo diario personale con AI companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className="dark">
      <body
        className={`${dmSans.variable} ${libreBaskerville.variable} font-sans bg-background text-foreground antialiased`}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
```

Note: `SessionProvider` is a client component. If Next.js complains, create a separate `components/providers.tsx` with `"use client"` and wrap there instead.

- [ ] **Step 4: Create login page**

Create `app/login/page.tsx`:

```tsx
"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 p-6">
      <div className="text-center">
        <h1 className="font-serif text-4xl text-foreground mb-2">Jurnal</h1>
        <p className="text-muted text-sm">Il tuo diario personale</p>
      </div>
      <Button
        variant="outline"
        size="lg"
        className="gap-2 bg-card border-card-border text-foreground hover:bg-white/5"
        onClick={() => signIn("google", { callbackUrl: "/" })}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Accedi con Google
      </Button>
    </main>
  );
}
```

- [ ] **Step 5: Verify login flow**

```bash
npm run dev
```

Navigate to http://localhost:3000/login. The page should show "Jurnal" title and a "Accedi con Google" button. Clicking it should redirect to Google OAuth (will fail without real credentials, but the flow should initiate).

- [ ] **Step 6: Commit**

```bash
git add lib/auth.ts app/api/auth/ app/login/ app/layout.tsx
git commit -m "feat: add Google auth with NextAuth.js"
```

---

## Task 4: Gemini AI Client + Prompts

**Files:**
- Create: `lib/gemini.ts`, `lib/embedding.ts`, `lib/prompts.ts`

- [ ] **Step 1: Create Gemini client**

Create `lib/gemini.ts`:

```ts
import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
  if (!client) {
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error("GOOGLE_AI_API_KEY is not set");
    }
    client = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });
  }
  return client;
}

export async function chatWithGemini(
  systemPrompt: string,
  messages: { role: "user" | "model"; content: string }[]
): Promise<string> {
  const ai = getGemini();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    })),
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.8,
      topP: 0.95,
      responseMimeType: "application/json",
    },
  });
  return response.text ?? "";
}

export async function generateClosure(
  systemPrompt: string,
  transcript: string
): Promise<string> {
  const ai = getGemini();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: transcript }] }],
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.5,
      responseMimeType: "application/json",
    },
  });
  return response.text ?? "";
}
```

- [ ] **Step 2: Create embedding client**

Create `lib/embedding.ts`:

```ts
import { getGemini } from "./gemini";

export async function embedText(text: string): Promise<number[]> {
  const ai = getGemini();
  const result = await ai.models.embedContent({
    model: "gemini-embedding-2-preview",
    contents: text,
    config: {
      outputDimensionality: 768,
    },
  });
  return result.embedding?.values ?? [];
}
```

- [ ] **Step 3: Create system prompts**

Create `lib/prompts.ts`:

```ts
import type { SessionBriefing } from "./types";

export function buildConversationPrompt(briefing: SessionBriefing): string {
  const followUps = briefing.todayFollowUps
    .map((f) => `- ${f.content} (menzionato il ${f.created_at.split("T")[0]})`)
    .join("\n");

  const moodTrend = briefing.moodTrend
    .map(
      (m) =>
        `- ${m.date}: mood ${m.mood_score}/100 [${m.mood_keywords.join(", ")}]`
    )
    .join("\n");

  const relatedFacts = briefing.correlatedFacts
    .map((f) => `- [${f.type}] ${f.content} (tags: ${f.tags.join(", ")})`)
    .join("\n");

  return `Sei Jurnal, un companion di journaling personale. Il tuo ruolo è aiutare l'utente a esplorare i suoi pensieri e le sue emozioni della giornata attraverso domande aperte e riflessive.

## Regole
- Fai UNA domanda alla volta, breve (1-2 frasi)
- Usa un tono caldo, informale, in italiano
- NON sei un terapeuta: non diagnosticare, non prescrivere, non dare consigli medici
- Se l'utente dà risposte brevi o vuole chiudere, rispetta i suoi confini
- Collega naturalmente ai pensieri passati quando rilevante ("la scorsa settimana mi avevi detto che...")
- Dopo 3-5 scambi, chiudi la sessione

## Contesto di oggi

### Eventi da follow-up (menzionati in sessioni precedenti con data oggi)
${followUps || "Nessun evento per oggi."}

### Trend mood ultimi giorni
${moodTrend || "Nessuna sessione precedente."}

### Fatti correlati recenti
${relatedFacts || "Nessun fatto correlato."}

## Formato risposta
Rispondi SEMPRE in JSON valido con questa struttura:
{
  "message": "La tua domanda o risposta all'utente",
  "session_complete": false
}

Imposta "session_complete" a true quando è il momento di chiudere la sessione (dopo 3-5 scambi, o se l'utente vuole finire). Quando chiudi, il messaggio deve essere un saluto caloroso che chiude la conversazione.`;
}

export function buildClosurePrompt(): string {
  return `Sei Jurnal. Ti viene fornita la trascrizione completa della sessione di journaling di oggi. Il tuo compito è produrre un riassunto strutturato.

## Regole
- Il riassunto deve essere in italiano, 2-3 paragrafi, in terza persona
- Il mood_score va da 1 (molto negativo) a 100 (molto positivo)
- Le mood_keywords sono 3-5 parole che descrivono lo stato emotivo
- I facts sono informazioni salienti da ricordare per sessioni future
- Per ogni fact con una data futura, includi reference_date in formato YYYY-MM-DD
- I tags devono essere parole chiave singole, lowercase

## Formato risposta
Rispondi SEMPRE in JSON valido con questa struttura:
{
  "summary": "Riassunto di 2-3 paragrafi",
  "mood_score": 72,
  "mood_keywords": ["keyword1", "keyword2", "keyword3"],
  "facts": [
    {
      "type": "event|emotion|person|theme|insight",
      "content": "Descrizione del fatto",
      "reference_date": "YYYY-MM-DD o null",
      "tags": ["tag1", "tag2"]
    }
  ]
}`;
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/gemini.ts lib/embedding.ts lib/prompts.ts
git commit -m "feat: add Gemini AI client, embeddings, and system prompts"
```

---

## Task 5: API Routes — Briefing + Sessions

**Files:**
- Create: `app/api/briefing/route.ts`, `app/api/sessions/route.ts`, `app/api/sessions/[id]/route.ts`, `app/api/sessions/history/route.ts`

- [ ] **Step 1: Create helper to get authenticated user ID**

Add to `lib/auth.ts` (append):

```ts
import { getServerSession } from "next-auth";

export async function getAuthenticatedUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session as any)?.userId ?? null;
}
```

- [ ] **Step 2: Create briefing API route**

Create `app/api/briefing/route.ts`:

```ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthenticatedUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sql = getDb();

  const [todayFollowUps, moodTrend, recentFacts] = await Promise.all([
    sql`
      SELECT * FROM facts
      WHERE user_id = ${userId}
        AND reference_date = CURRENT_DATE
        AND status = 'active'
    `,
    sql`
      SELECT date, mood_score, mood_keywords FROM sessions
      WHERE user_id = ${userId} AND mood_score IS NOT NULL
      ORDER BY date DESC LIMIT 7
    `,
    sql`
      SELECT * FROM facts
      WHERE user_id = ${userId} AND status = 'active'
      ORDER BY created_at DESC LIMIT 20
    `,
  ]);

  return NextResponse.json({
    todayFollowUps,
    moodTrend,
    correlatedFacts: recentFacts,
  });
}
```

- [ ] **Step 3: Create sessions API route (today + create)**

Create `app/api/sessions/route.ts`:

```ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthenticatedUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sql = getDb();
  const rows = await sql`
    SELECT * FROM sessions
    WHERE user_id = ${userId} AND date = CURRENT_DATE
    LIMIT 1
  `;

  return NextResponse.json({ session: rows[0] ?? null });
}

export async function POST() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sql = getDb();

  // Check if session already exists today
  const existing = await sql`
    SELECT id FROM sessions
    WHERE user_id = ${userId} AND date = CURRENT_DATE
  `;

  if (existing.length > 0) {
    return NextResponse.json({ session: existing[0] });
  }

  const rows = await sql`
    INSERT INTO sessions (user_id, date)
    VALUES (${userId}, CURRENT_DATE)
    RETURNING *
  `;

  return NextResponse.json({ session: rows[0] });
}
```

- [ ] **Step 4: Create session detail API route**

Create `app/api/sessions/[id]/route.ts`:

```ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthenticatedUserId } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sql = getDb();

  const [sessions, messages] = await Promise.all([
    sql`SELECT * FROM sessions WHERE id = ${id} AND user_id = ${userId}`,
    sql`SELECT * FROM messages WHERE session_id = ${id} ORDER BY created_at`,
  ]);

  if (sessions.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ session: sessions[0], messages });
}
```

- [ ] **Step 5: Create history API route**

Create `app/api/sessions/history/route.ts`:

```ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthenticatedUserId } from "@/lib/auth";

export async function GET(req: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const offset = parseInt(searchParams.get("offset") ?? "0");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const sql = getDb();
  const rows = await sql`
    SELECT id, date, summary, mood_score, mood_keywords, created_at
    FROM sessions
    WHERE user_id = ${userId} AND summary IS NOT NULL
    ORDER BY date DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  return NextResponse.json({ sessions: rows });
}
```

- [ ] **Step 6: Commit**

```bash
git add app/api/briefing/ app/api/sessions/ lib/auth.ts
git commit -m "feat: add API routes for briefing, sessions, and history"
```

---

## Task 6: API Routes — Messages + Session Closure

**Files:**
- Create: `app/api/messages/route.ts`, `app/api/close-session/route.ts`

- [ ] **Step 1: Create messages API route**

Create `app/api/messages/route.ts`:

```ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthenticatedUserId } from "@/lib/auth";
import { chatWithGemini } from "@/lib/gemini";
import { buildConversationPrompt } from "@/lib/prompts";
import type { AiResponse, SessionBriefing } from "@/lib/types";

export async function POST(req: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { session_id, content, briefing } = (await req.json()) as {
    session_id: string;
    content: string;
    briefing: SessionBriefing;
  };

  const sql = getDb();

  // Save user message
  await sql`
    INSERT INTO messages (session_id, role, content)
    VALUES (${session_id}, 'user', ${content})
  `;

  // Get conversation history
  const messages = await sql`
    SELECT role, content FROM messages
    WHERE session_id = ${session_id}
    ORDER BY created_at
  `;

  // Build Gemini messages (map 'assistant' to 'model' for Gemini API)
  const geminiMessages = messages.map((m) => ({
    role: (m.role === "assistant" ? "model" : "user") as "user" | "model",
    content: m.content as string,
  }));

  // Get AI response
  const systemPrompt = buildConversationPrompt(briefing);
  const responseText = await chatWithGemini(systemPrompt, geminiMessages);

  let aiResponse: AiResponse;
  try {
    aiResponse = JSON.parse(responseText);
  } catch {
    aiResponse = { message: responseText, session_complete: false };
  }

  // Save assistant message
  await sql`
    INSERT INTO messages (session_id, role, content)
    VALUES (${session_id}, 'assistant', ${aiResponse.message})
  `;

  return NextResponse.json(aiResponse);
}
```

- [ ] **Step 2: Create close-session API route**

Create `app/api/close-session/route.ts`:

```ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthenticatedUserId } from "@/lib/auth";
import { generateClosure } from "@/lib/gemini";
import { embedText } from "@/lib/embedding";
import { buildClosurePrompt } from "@/lib/prompts";
import type { SessionClosure } from "@/lib/types";

export async function POST(req: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { session_id } = (await req.json()) as { session_id: string };

  const sql = getDb();

  // Get all messages for the session
  const messages = await sql`
    SELECT role, content FROM messages
    WHERE session_id = ${session_id}
    ORDER BY created_at
  `;

  // Build transcript
  const transcript = messages
    .map((m) => `${m.role === "user" ? "Utente" : "Jurnal"}: ${m.content}`)
    .join("\n\n");

  // Generate closure with Gemini
  const closureText = await generateClosure(buildClosurePrompt(), transcript);

  let closure: SessionClosure;
  try {
    closure = JSON.parse(closureText);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse AI response" },
      { status: 500 }
    );
  }

  // Generate embedding for the summary
  const embedding = await embedText(closure.summary);
  const embeddingStr = `[${embedding.join(",")}]`;

  // Update session with summary, mood, and embedding
  await sql`
    UPDATE sessions SET
      transcript = ${transcript},
      summary = ${closure.summary},
      mood_score = ${closure.mood_score},
      mood_keywords = ${closure.mood_keywords},
      embedding = ${embeddingStr}::vector
    WHERE id = ${session_id} AND user_id = ${userId}
  `;

  // Insert extracted facts
  for (const fact of closure.facts) {
    await sql`
      INSERT INTO facts (user_id, session_id, type, content, reference_date, tags)
      VALUES (
        ${userId},
        ${session_id},
        ${fact.type}::fact_type,
        ${fact.content},
        ${fact.reference_date},
        ${fact.tags}
      )
    `;
  }

  // Mark followed-up facts as followed_up
  await sql`
    UPDATE facts SET status = 'followed_up'
    WHERE user_id = ${userId}
      AND reference_date = CURRENT_DATE
      AND status = 'active'
  `;

  return NextResponse.json({
    summary: closure.summary,
    mood_score: closure.mood_score,
    mood_keywords: closure.mood_keywords,
    facts_count: closure.facts.length,
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/messages/ app/api/close-session/
git commit -m "feat: add message handling and session closure API routes"
```

---

## Task 7: API Route — Dashboard Data

**Files:**
- Create: `app/api/dashboard/route.ts`

- [ ] **Step 1: Create dashboard API route**

Create `app/api/dashboard/route.ts`:

```ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getAuthenticatedUserId } from "@/lib/auth";

export async function GET(req: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") ?? "30");

  const sql = getDb();

  const [moodData, keywordData] = await Promise.all([
    sql`
      SELECT date, mood_score, mood_keywords
      FROM sessions
      WHERE user_id = ${userId}
        AND mood_score IS NOT NULL
        AND date >= CURRENT_DATE - ${days}::integer
      ORDER BY date ASC
    `,
    sql`
      SELECT unnest(mood_keywords) as keyword, COUNT(*) as count
      FROM sessions
      WHERE user_id = ${userId}
        AND mood_score IS NOT NULL
        AND date >= CURRENT_DATE - ${days}::integer
      GROUP BY keyword
      ORDER BY count DESC
      LIMIT 15
    `,
  ]);

  // Calculate trend
  let trend: string | null = null;
  if (moodData.length >= 7) {
    const recent = moodData.slice(-7);
    const older = moodData.slice(-14, -7);
    if (older.length > 0) {
      const recentAvg =
        recent.reduce((s, r) => s + (r.mood_score as number), 0) / recent.length;
      const olderAvg =
        older.reduce((s, r) => s + (r.mood_score as number), 0) / older.length;
      const diff = Math.round(recentAvg - olderAvg);
      if (diff > 3) trend = `Questa settimana stai meglio della scorsa (+${diff})`;
      else if (diff < -3) trend = `Questa settimana il mood è più basso della scorsa (${diff})`;
      else trend = "Il tuo mood è stabile rispetto alla scorsa settimana";
    }
  }

  return NextResponse.json({
    moodData,
    keywords: keywordData,
    trend,
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/dashboard/
git commit -m "feat: add dashboard API route with mood trends and keywords"
```

---

## Task 8: Shared UI Components

**Files:**
- Create: `components/aurora-background.tsx`, `components/bottom-nav.tsx`, `components/mood-score.tsx`, `components/mood-pills.tsx`, `components/session-card.tsx`, `components/chat-bubble.tsx`, `components/wave-indicator.tsx`, `components/progress-dots.tsx`

- [ ] **Step 1: Create aurora background component**

Create `components/aurora-background.tsx`:

```tsx
"use client";

export function AuroraBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div
        className="absolute -top-20 -left-10 -right-10 h-72 blur-[60px] animate-pulse"
        style={{
          background: `
            radial-gradient(ellipse at 30% 50%, rgba(120, 80, 220, 0.15) 0%, transparent 60%),
            radial-gradient(ellipse at 70% 30%, rgba(60, 180, 160, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 80%, rgba(200, 100, 150, 0.07) 0%, transparent 50%)
          `,
          animationDuration: "8s",
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Create bottom navigation**

Create `components/bottom-nav.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Clock, BarChart3 } from "lucide-react";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/history", label: "Storico", icon: Clock },
  { href: "/dashboard", label: "Trend", icon: BarChart3 },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-card-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 px-4 py-1 text-xs transition-colors ${
                isActive ? "text-teal" : "text-muted-foreground"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Create mood score component**

Create `components/mood-score.tsx`:

```tsx
interface MoodScoreProps {
  score: number;
  size?: "sm" | "lg";
}

export function MoodScore({ score, size = "sm" }: MoodScoreProps) {
  const color =
    score >= 70
      ? "text-teal"
      : score >= 40
        ? "text-violet-light"
        : "text-pink";

  return (
    <span
      className={`font-sans font-light ${color} ${
        size === "lg" ? "text-6xl" : "text-2xl"
      }`}
    >
      {score}
    </span>
  );
}
```

- [ ] **Step 4: Create mood pills component**

Create `components/mood-pills.tsx`:

```tsx
interface MoodPillsProps {
  keywords: string[];
}

const sentimentColor = (keyword: string): string => {
  const positive = ["sereno", "felice", "grato", "motivato", "sollevato", "energico", "contento", "fiducioso"];
  const negative = ["ansioso", "triste", "stanco", "frustrato", "arrabbiato", "preoccupato", "stressato"];

  const lower = keyword.toLowerCase();
  if (positive.some((p) => lower.includes(p)))
    return "bg-teal/10 text-teal-light border-teal/15";
  if (negative.some((n) => lower.includes(n)))
    return "bg-pink/10 text-pink-light border-pink/15";
  return "bg-violet/10 text-violet-light border-violet/15";
};

export function MoodPills({ keywords }: MoodPillsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {keywords.map((kw) => (
        <span
          key={kw}
          className={`rounded-full border px-3 py-1 text-xs ${sentimentColor(kw)}`}
        >
          {kw}
        </span>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Create session card component**

Create `components/session-card.tsx`:

```tsx
import { MoodScore } from "./mood-score";
import { MoodPills } from "./mood-pills";

interface SessionCardProps {
  date: string;
  summary: string | null;
  moodScore: number | null;
  moodKeywords: string[];
  onClick?: () => void;
}

export function SessionCard({
  date,
  summary,
  moodScore,
  moodKeywords,
  onClick,
}: SessionCardProps) {
  const formattedDate = new Date(date).toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border border-card-border bg-card p-4 text-left transition-colors hover:bg-white/[0.04]"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-teal-dim">
          {formattedDate}
        </span>
        {moodScore && <MoodScore score={moodScore} />}
      </div>
      {summary && (
        <p className="mb-3 line-clamp-2 font-serif text-sm leading-relaxed text-muted">
          {summary}
        </p>
      )}
      {moodKeywords.length > 0 && <MoodPills keywords={moodKeywords} />}
    </button>
  );
}
```

- [ ] **Step 6: Create chat bubble component**

Create `components/chat-bubble.tsx`:

```tsx
interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatBubble({ role, content }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`mb-4 ${isUser ? "ml-10" : ""}`}>
      {!isUser && (
        <span className="mb-1 block text-[10px] font-medium uppercase tracking-widest text-violet-dim">
          Jurnal
        </span>
      )}
      <div
        className={`rounded-2xl p-4 ${
          isUser
            ? "rounded-br-sm border border-teal/10 bg-teal/[0.06]"
            : "rounded-bl-sm border border-violet/10 bg-violet/[0.06]"
        }`}
      >
        <p className="text-sm leading-relaxed text-muted">{content}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Create wave indicator component**

Create `components/wave-indicator.tsx`:

```tsx
"use client";

export function WaveIndicator() {
  return (
    <div className="flex items-center gap-[3px] h-10">
      {[12, 24, 36, 28, 18, 32, 14].map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-sm"
          style={{
            height: `${h}px`,
            background: "linear-gradient(to top, rgba(120,80,220,0.6), rgba(60,180,160,0.8))",
            animation: `wave 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.08}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 8: Create progress dots component**

Create `components/progress-dots.tsx`:

```tsx
interface ProgressDotsProps {
  total: number;
  current: number;
}

export function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 w-2 rounded-full ${
            i < current
              ? "bg-teal-dim"
              : i === current
                ? "bg-violet-dim shadow-[0_0_8px_rgba(120,80,220,0.3)]"
                : "bg-white/[0.08]"
          }`}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 9: Commit**

```bash
git add components/
git commit -m "feat: add shared UI components (aurora, nav, mood, chat, indicators)"
```

---

## Task 9: Voice Recorder Hook + STT Token Route

**Files:**
- Create: `hooks/use-voice-recorder.ts`, `app/api/stt-token/route.ts`, `components/voice-recorder.tsx`

- [ ] **Step 1: Create STT token API route**

This route generates a short-lived access token for the client to connect directly to Google Cloud STT. For the MVP, we pass through the API key. In production, this should be a proper service account token.

Create `app/api/stt-token/route.ts`:

```ts
import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    apiKey: process.env.GOOGLE_CLOUD_STT_API_KEY,
  });
}
```

- [ ] **Step 2: Create voice recorder hook**

Create `hooks/use-voice-recorder.ts`:

```ts
"use client";

import { useState, useRef, useCallback } from "react";

interface UseVoiceRecorderReturn {
  isRecording: boolean;
  transcript: string;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetTranscript: () => void;
}

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  const startRecording = useCallback(async () => {
    // Use Web Speech API as primary method (works on Chrome/Safari mobile)
    // Falls back gracefully if not available
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback: prompt user to type instead
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "it-IT";
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalTranscript = "";

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript(finalTranscript + interim);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setTranscript("");
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  return { isRecording, transcript, startRecording, stopRecording, resetTranscript };
}
```

Note: This uses the Web Speech API for the MVP. To upgrade to Chirp 3 streaming, replace the internals of this hook with a WebSocket connection to a proxy API route that streams to Google Cloud STT V2. The hook interface stays the same — `startRecording`, `stopRecording`, `transcript`.

- [ ] **Step 3: Create voice recorder component**

Create `components/voice-recorder.tsx`:

```tsx
"use client";

import { Mic, Square } from "lucide-react";
import { WaveIndicator } from "./wave-indicator";

interface VoiceRecorderProps {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function VoiceRecorder({ isRecording, onStart, onStop }: VoiceRecorderProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      {isRecording && <WaveIndicator />}
      <button
        onClick={isRecording ? onStop : onStart}
        className={`flex h-[72px] w-[72px] items-center justify-center rounded-full border transition-all ${
          isRecording
            ? "border-pink/30 bg-pink/20 shadow-[0_4px_30px_rgba(200,100,150,0.2)]"
            : "border-white/10 bg-gradient-to-br from-violet/40 to-teal/40 shadow-[0_4px_30px_rgba(120,80,220,0.2)]"
        }`}
      >
        {isRecording ? (
          <Square className="h-6 w-6 fill-pink text-pink" />
        ) : (
          <Mic className="h-7 w-7 text-white/90" />
        )}
      </button>
      <span className="text-xs text-muted-foreground">
        {isRecording ? "Ti sto ascoltando..." : "Tocca per parlare"}
      </span>
    </div>
  );
}
```

- [ ] **Step 4: Install lucide-react if not present**

```bash
npm install lucide-react
```

- [ ] **Step 5: Commit**

```bash
git add hooks/ app/api/stt-token/ components/voice-recorder.tsx
git commit -m "feat: add voice recording with Web Speech API and recorder UI"
```

---

## Task 10: Session Chat Hook

**Files:**
- Create: `hooks/use-session-chat.ts`

- [ ] **Step 1: Create session chat hook**

Create `hooks/use-session-chat.ts`:

```ts
"use client";

import { useState, useCallback } from "react";
import type { AiResponse, Message, SessionBriefing } from "@/lib/types";

interface UseSessionChatReturn {
  messages: Pick<Message, "role" | "content">[];
  isLoading: boolean;
  isComplete: boolean;
  questionCount: number;
  sendMessage: (content: string) => Promise<void>;
  closeSession: () => Promise<{
    summary: string;
    mood_score: number;
    mood_keywords: string[];
  } | null>;
}

export function useSessionChat(
  sessionId: string | null,
  briefing: SessionBriefing | null
): UseSessionChatReturn {
  const [messages, setMessages] = useState<Pick<Message, "role" | "content">[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!sessionId || !briefing || isComplete) return;

      setMessages((prev) => [...prev, { role: "user", content }]);
      setIsLoading(true);

      try {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, content, briefing }),
        });

        const data: AiResponse = await res.json();

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message },
        ]);
        setQuestionCount((c) => c + 1);

        if (data.session_complete) {
          setIsComplete(true);
        }
      } catch (error) {
        console.error("Failed to send message:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, briefing, isComplete]
  );

  const closeSession = useCallback(async () => {
    if (!sessionId) return null;

    try {
      const res = await fetch("/api/close-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });

      return await res.json();
    } catch (error) {
      console.error("Failed to close session:", error);
      return null;
    }
  }, [sessionId]);

  return {
    messages,
    isLoading,
    isComplete,
    questionCount,
    sendMessage,
    closeSession,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add hooks/use-session-chat.ts
git commit -m "feat: add session chat hook for message flow and session closure"
```

---

## Task 11: Home Page

**Files:**
- Create: `app/page.tsx` (replace placeholder)

- [ ] **Step 1: Build the home page**

Replace `app/page.tsx`:

```tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuroraBackground } from "@/components/aurora-background";
import { BottomNav } from "@/components/bottom-nav";
import { SessionCard } from "@/components/session-card";
import { MoodScore } from "@/components/mood-score";
import { MoodPills } from "@/components/mood-pills";
import { VoiceRecorder } from "@/components/voice-recorder";
import type { Session as JurnalSession } from "@/lib/types";

export default function Home() {
  const { data: authSession, status } = useSession();
  const router = useRouter();
  const [todaySession, setTodaySession] = useState<JurnalSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/sessions")
        .then((r) => r.json())
        .then((data) => {
          setTodaySession(data.session);
          setLoading(false);
        });
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet border-t-transparent" />
      </main>
    );
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buongiorno";
    if (hour < 18) return "Buon pomeriggio";
    return "Buonasera";
  };

  const userName = authSession?.user?.name?.split(" ")[0] ?? "";

  const handleStartSession = async () => {
    const res = await fetch("/api/sessions", { method: "POST" });
    const data = await res.json();
    if (data.session) {
      router.push("/session");
    }
  };

  // Session already completed today
  if (todaySession?.summary) {
    return (
      <main className="relative min-h-dvh pb-20">
        <AuroraBackground />
        <div className="relative z-10 mx-auto max-w-md px-6 pt-12">
          <p className="mb-1 text-sm text-teal-dim">{greeting()}, {userName}</p>
          <h1 className="mb-8 font-serif text-2xl text-foreground">
            La tua giornata
          </h1>

          <div className="mb-6 text-center">
            <MoodScore score={todaySession.mood_score!} size="lg" />
            <p className="mt-1 text-xs text-muted-foreground">mood di oggi</p>
            <div className="mt-3 flex justify-center">
              <MoodPills keywords={todaySession.mood_keywords} />
            </div>
          </div>

          <div className="rounded-2xl border border-card-border bg-card p-5">
            <p className="font-serif text-sm leading-relaxed text-muted">
              {todaySession.summary}
            </p>
          </div>
        </div>
        <BottomNav />
      </main>
    );
  }

  // No session yet — show start
  return (
    <main className="relative min-h-dvh pb-20">
      <AuroraBackground />
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6">
        <p className="mb-1 text-sm text-teal-dim">{greeting()}, {userName}</p>
        <h1 className="mb-12 font-serif text-3xl text-foreground">
          Come ti senti stasera?
        </h1>
        <VoiceRecorder
          isRecording={false}
          onStart={handleStartSession}
          onStop={() => {}}
        />
      </div>
      <BottomNav />
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add home page with session status and start flow"
```

---

## Task 12: Session Page (Active Journaling)

**Files:**
- Create: `app/session/page.tsx`

- [ ] **Step 1: Build the session page**

Create `app/session/page.tsx`:

```tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { AuroraBackground } from "@/components/aurora-background";
import { ChatBubble } from "@/components/chat-bubble";
import { VoiceRecorder } from "@/components/voice-recorder";
import { ProgressDots } from "@/components/progress-dots";
import { MoodScore } from "@/components/mood-score";
import { MoodPills } from "@/components/mood-pills";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { useSessionChat } from "@/hooks/use-session-chat";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import type { SessionBriefing } from "@/lib/types";

export default function SessionPage() {
  const { status } = useSession();
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [briefing, setBriefing] = useState<SessionBriefing | null>(null);
  const [textInput, setTextInput] = useState("");
  const [closureResult, setClosureResult] = useState<{
    summary: string;
    mood_score: number;
    mood_keywords: string[];
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { isRecording, transcript, startRecording, stopRecording, resetTranscript } =
    useVoiceRecorder();
  const { messages, isLoading, isComplete, questionCount, sendMessage, closeSession } =
    useSessionChat(sessionId, briefing);

  // Load session and briefing
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      Promise.all([
        fetch("/api/sessions", { method: "POST" }).then((r) => r.json()),
        fetch("/api/briefing").then((r) => r.json()),
      ]).then(([sessionData, briefingData]) => {
        setSessionId(sessionData.session.id);
        setBriefing(briefingData);
      });
    }
  }, [status, router]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, transcript]);

  // Handle voice recording stop — send transcribed text
  const handleStopRecording = () => {
    stopRecording();
    if (transcript.trim()) {
      sendMessage(transcript.trim());
      resetTranscript();
    }
  };

  // Handle text submit
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      sendMessage(textInput.trim());
      setTextInput("");
    }
  };

  // Handle session closure
  useEffect(() => {
    if (isComplete && !closureResult) {
      closeSession().then((result) => {
        if (result) setClosureResult(result);
      });
    }
  }, [isComplete, closureResult, closeSession]);

  if (!sessionId || !briefing) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet border-t-transparent" />
      </main>
    );
  }

  // Session complete — show summary
  if (closureResult) {
    return (
      <main className="relative min-h-dvh">
        <AuroraBackground />
        <div className="relative z-10 mx-auto max-w-md px-6 pt-16 pb-8">
          <div className="mb-8 text-center">
            <MoodScore score={closureResult.mood_score} size="lg" />
            <p className="mt-1 text-xs text-muted-foreground">mood di oggi</p>
            <div className="mt-3 flex justify-center">
              <MoodPills keywords={closureResult.mood_keywords} />
            </div>
          </div>

          <div className="rounded-2xl border border-card-border bg-card p-5">
            <p className="font-serif text-sm leading-relaxed text-muted">
              {closureResult.summary}
            </p>
          </div>

          <Button
            variant="outline"
            className="mt-6 w-full border-card-border bg-card text-foreground hover:bg-white/5"
            onClick={() => router.push("/")}
          >
            Torna alla home
          </Button>
        </div>
      </main>
    );
  }

  // Active session
  return (
    <main className="relative flex min-h-dvh flex-col">
      <AuroraBackground />

      {/* Header */}
      <div className="relative z-10 px-6 pt-6 pb-2">
        <ProgressDots total={5} current={questionCount} />
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto px-6 pb-4"
      >
        {messages.map((msg, i) => (
          <ChatBubble key={i} role={msg.role} content={msg.content} />
        ))}

        {/* Live transcript while recording */}
        {isRecording && transcript && (
          <div className="ml-10 mb-4 rounded-2xl rounded-br-sm border border-teal/10 bg-teal/[0.06] p-4 opacity-60">
            <p className="text-sm leading-relaxed text-muted">{transcript}</p>
          </div>
        )}

        {isLoading && (
          <div className="mb-4">
            <span className="text-[10px] font-medium uppercase tracking-widest text-violet-dim">
              Jurnal
            </span>
            <div className="mt-1 flex gap-1">
              <div className="h-2 w-2 animate-pulse rounded-full bg-violet-dim" />
              <div className="h-2 w-2 animate-pulse rounded-full bg-violet-dim [animation-delay:0.2s]" />
              <div className="h-2 w-2 animate-pulse rounded-full bg-violet-dim [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="relative z-10 border-t border-card-border bg-background/80 backdrop-blur-xl px-6 py-4">
        {messages.length === 0 ? (
          /* First message — prominent mic */
          <div className="flex flex-col items-center">
            <p className="mb-4 font-serif text-lg text-foreground">
              Raccontami della tua giornata
            </p>
            <VoiceRecorder
              isRecording={isRecording}
              onStart={startRecording}
              onStop={handleStopRecording}
            />
          </div>
        ) : (
          /* Subsequent — mic + text input */
          <div className="flex items-center gap-3">
            <button
              onClick={isRecording ? handleStopRecording : startRecording}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all ${
                isRecording
                  ? "border-pink/30 bg-pink/20"
                  : "border-white/10 bg-white/5"
              }`}
            >
              {isRecording ? (
                <div className="h-3 w-3 rounded-sm bg-pink" />
              ) : (
                <svg className="h-4 w-4 text-muted" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 7h2v-2c3.93-.5 7-3.88 7-7.95h-2c0 3.31-2.69 6-6 6s-6-2.69-6-6H4c0 4.07 3.07 7.45 7 7.95V21z" />
                </svg>
              )}
            </button>
            <form onSubmit={handleTextSubmit} className="flex flex-1 gap-2">
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Scrivi qui..."
                className="border-card-border bg-card text-foreground placeholder:text-muted-foreground"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                disabled={!textInput.trim() || isLoading}
                className="text-muted hover:text-foreground"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/session/
git commit -m "feat: add active session page with voice recording and AI chat"
```

---

## Task 13: History Page

**Files:**
- Create: `app/history/page.tsx`, `app/history/[id]/page.tsx`

- [ ] **Step 1: Build history list page**

Create `app/history/page.tsx`:

```tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuroraBackground } from "@/components/aurora-background";
import { BottomNav } from "@/components/bottom-nav";
import { SessionCard } from "@/components/session-card";
import type { Session } from "@/lib/types";

export default function HistoryPage() {
  const { status } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/sessions/history")
        .then((r) => r.json())
        .then((data) => {
          setSessions(data.sessions);
          setLoading(false);
        });
    }
  }, [status, router]);

  return (
    <main className="relative min-h-dvh pb-20">
      <AuroraBackground />
      <div className="relative z-10 mx-auto max-w-md px-6 pt-12">
        <h1 className="mb-8 font-serif text-2xl text-foreground">Storico</h1>

        {loading ? (
          <div className="flex justify-center pt-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet border-t-transparent" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-center text-muted">
            Nessuna sessione ancora. Inizia il tuo primo diario!
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((s) => (
              <SessionCard
                key={s.id}
                date={s.date}
                summary={s.summary}
                moodScore={s.mood_score}
                moodKeywords={s.mood_keywords}
                onClick={() => router.push(`/history/${s.id}`)}
              />
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
```

- [ ] **Step 2: Build session detail page**

Create `app/history/[id]/page.tsx`:

```tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AuroraBackground } from "@/components/aurora-background";
import { ChatBubble } from "@/components/chat-bubble";
import { MoodScore } from "@/components/mood-score";
import { MoodPills } from "@/components/mood-pills";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Session, Message } from "@/lib/types";

export default function SessionDetailPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated" && params.id) {
      fetch(`/api/sessions/${params.id}`)
        .then((r) => r.json())
        .then((data) => {
          setSession(data.session);
          setMessages(data.messages);
        });
    }
  }, [status, router, params.id]);

  if (!session) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet border-t-transparent" />
      </main>
    );
  }

  const formattedDate = new Date(session.date).toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="relative min-h-dvh">
      <AuroraBackground />
      <div className="relative z-10 mx-auto max-w-md px-6 pt-6 pb-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 text-muted-foreground hover:text-foreground"
          onClick={() => router.push("/history")}
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Storico
        </Button>

        <p className="mb-1 text-xs uppercase tracking-wide text-teal-dim">
          {formattedDate}
        </p>

        {session.mood_score && (
          <div className="mb-6 flex items-center gap-4">
            <MoodScore score={session.mood_score} size="lg" />
            <MoodPills keywords={session.mood_keywords} />
          </div>
        )}

        {session.summary && (
          <div className="mb-8 rounded-2xl border border-card-border bg-card p-5">
            <p className="font-serif text-sm leading-relaxed text-muted">
              {session.summary}
            </p>
          </div>
        )}

        {messages.length > 0 && (
          <>
            <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Conversazione
            </h2>
            {messages.map((msg) => (
              <ChatBubble key={msg.id} role={msg.role} content={msg.content} />
            ))}
          </>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/history/
git commit -m "feat: add history page with session list and detail view"
```

---

## Task 14: Dashboard Page

**Files:**
- Create: `app/dashboard/page.tsx`, `components/mood-chart.tsx`, `components/keyword-cloud.tsx`

- [ ] **Step 1: Create mood chart component**

Create `components/mood-chart.tsx`:

```tsx
"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface MoodChartProps {
  data: { date: string; mood_score: number }[];
}

export function MoodChart({ data }: MoodChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("it-IT", {
      day: "numeric",
      month: "short",
    }),
  }));

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted}>
          <XAxis
            dataKey="label"
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip
            contentStyle={{
              background: "#1a1a1a",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              fontSize: "12px",
              color: "rgba(255,255,255,0.8)",
            }}
            formatter={(value: number) => [`${value}/100`, "Mood"]}
          />
          <defs>
            <linearGradient id="moodGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgb(120, 80, 220)" />
              <stop offset="100%" stopColor="rgb(60, 180, 160)" />
            </linearGradient>
          </defs>
          <Line
            type="monotone"
            dataKey="mood_score"
            stroke="url(#moodGradient)"
            strokeWidth={2}
            dot={{ fill: "rgb(60, 180, 160)", r: 3 }}
            activeDot={{ r: 5, fill: "rgb(120, 80, 220)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: Create keyword cloud component**

Create `components/keyword-cloud.tsx`:

```tsx
interface KeywordCloudProps {
  keywords: { keyword: string; count: number }[];
}

export function KeywordCloud({ keywords }: KeywordCloudProps) {
  const maxCount = Math.max(...keywords.map((k) => k.count), 1);

  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map(({ keyword, count }) => {
        const opacity = 0.4 + (count / maxCount) * 0.6;
        return (
          <span
            key={keyword}
            className="rounded-full border border-violet/15 bg-violet/10 px-3 py-1 text-xs text-violet-light"
            style={{ opacity }}
          >
            {keyword}
            <span className="ml-1 text-muted-foreground">{count}</span>
          </span>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Build dashboard page**

Create `app/dashboard/page.tsx`:

```tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuroraBackground } from "@/components/aurora-background";
import { BottomNav } from "@/components/bottom-nav";
import { MoodChart } from "@/components/mood-chart";
import { KeywordCloud } from "@/components/keyword-cloud";

interface DashboardData {
  moodData: { date: string; mood_score: number; mood_keywords: string[] }[];
  keywords: { keyword: string; count: number }[];
  trend: string | null;
}

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetch(`/api/dashboard?days=${days}`)
        .then((r) => r.json())
        .then(setData);
    }
  }, [status, router, days]);

  return (
    <main className="relative min-h-dvh pb-20">
      <AuroraBackground />
      <div className="relative z-10 mx-auto max-w-md px-6 pt-12">
        <h1 className="mb-8 font-serif text-2xl text-foreground">Trend</h1>

        {/* Period selector */}
        <div className="mb-6 flex gap-2">
          {[
            { label: "7g", value: 7 },
            { label: "30g", value: 30 },
            { label: "90g", value: 90 },
          ].map((period) => (
            <button
              key={period.value}
              onClick={() => setDays(period.value)}
              className={`rounded-full px-4 py-1.5 text-xs transition-colors ${
                days === period.value
                  ? "bg-violet/20 text-violet-light border border-violet/20"
                  : "bg-card text-muted-foreground border border-card-border"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        {!data ? (
          <div className="flex justify-center pt-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet border-t-transparent" />
          </div>
        ) : data.moodData.length === 0 ? (
          <p className="text-center text-muted">
            Non ci sono ancora dati. Inizia a scrivere il tuo diario!
          </p>
        ) : (
          <>
            {/* Trend insight */}
            {data.trend && (
              <div className="mb-6 rounded-2xl border border-card-border bg-card p-4">
                <p className="text-sm text-muted">{data.trend}</p>
              </div>
            )}

            {/* Mood chart */}
            <div className="mb-8 rounded-2xl border border-card-border bg-card p-4">
              <h2 className="mb-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Mood nel tempo
              </h2>
              <MoodChart data={data.moodData} />
            </div>

            {/* Keywords */}
            {data.keywords.length > 0 && (
              <div className="rounded-2xl border border-card-border bg-card p-4">
                <h2 className="mb-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  Emozioni ricorrenti
                </h2>
                <KeywordCloud keywords={data.keywords} />
              </div>
            )}
          </>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/ components/mood-chart.tsx components/keyword-cloud.tsx
git commit -m "feat: add dashboard page with mood chart and keyword cloud"
```

---

## Task 15: Final Integration + Polish

**Files:**
- Modify: `app/layout.tsx`, `.gitignore`

- [ ] **Step 1: Update .gitignore**

Append to the existing `.gitignore`:

```
.env.local
.superpowers/
```

- [ ] **Step 2: Create providers wrapper (fix SessionProvider client component issue)**

If `app/layout.tsx` throws an error because `SessionProvider` is a client component used in a server component, create `components/providers.tsx`:

```tsx
"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

Then update `app/layout.tsx` to use it:

```tsx
import type { Metadata } from "next";
import { DM_Sans, Libre_Baskerville } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600"],
});

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Jurnal",
  description: "Il tuo diario personale con AI companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className="dark">
      <body
        className={`${dmSans.variable} ${libreBaskerville.variable} font-sans bg-background text-foreground antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify the full app builds**

```bash
npm run build
```

Expected: Build succeeds with no errors. Fix any TypeScript or import issues.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: final integration, providers wrapper, and gitignore"
```

---

## Task 16: Environment Setup + First Deploy

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: Set up Neon database**

Use the Neon MCP tools to:
1. Create project "jurnal" if not exists
2. Run the migration SQL from `sql/migrations/001-initial-schema.sql`
3. Get the connection string and save to `.env.local` as `DATABASE_URL`

- [ ] **Step 2: Set up Google OAuth**

1. Go to Google Cloud Console → APIs & Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Set authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Save client ID and secret to `.env.local`

- [ ] **Step 3: Set up Google AI API key**

1. Go to Google AI Studio (aistudio.google.com)
2. Create API key
3. Save to `.env.local` as `GOOGLE_AI_API_KEY`

- [ ] **Step 4: Generate NextAuth secret**

```bash
openssl rand -base64 32
```

Save output to `.env.local` as `NEXTAUTH_SECRET`.

- [ ] **Step 5: Verify app runs end-to-end locally**

```bash
npm run dev
```

Test: Login → Start session → Record voice → AI responds → Session closes → Summary appears → Check history → Check dashboard.

- [ ] **Step 6: Deploy to Vercel**

```bash
npx vercel --prod
```

Set environment variables in Vercel dashboard or via CLI:

```bash
vercel env add DATABASE_URL production
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
vercel env add GOOGLE_AI_API_KEY production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production  # Set to production URL
```

- [ ] **Step 7: Update Google OAuth redirect URI**

Add the Vercel production URL to authorized redirect URIs:
`https://<your-app>.vercel.app/api/auth/callback/google`

- [ ] **Step 8: Commit any final config changes**

```bash
git add -A
git commit -m "chore: finalize environment setup and deploy configuration"
```
