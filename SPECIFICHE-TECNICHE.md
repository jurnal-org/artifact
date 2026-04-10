# Jurnal — Specifiche Tecniche e Infrastrutturali

---

## Tech Stack

| Layer | Tecnologia | Versione |
|-------|-----------|----------|
| Framework | Next.js (App Router) | 16.2.3 |
| Runtime | React | 19.2.4 |
| Linguaggio | TypeScript (strict mode) | 5.x |
| UI Library | shadcn/ui (Base UI) | latest |
| Styling | Tailwind CSS | 4.x (PostCSS-based) |
| Charts | Recharts | 3.8.1 |
| Icons | Lucide React | 1.7.0 |
| Animazioni | tw-animate-css | 1.4.0 |
| Auth | NextAuth.js | 4.24.13 |
| Database | PostgreSQL (Neon serverless) | 17 |
| Vector DB | pgvector extension | - |
| AI LLM | Google Gemini 3 Flash Preview | gemini-3-flash-preview |
| AI Embeddings | Google Gemini Embedding 2 Preview | gemini-embedding-2-preview |
| STT | Web Speech API (browser native) | - |
| AI SDK | @google/genai | 1.49.0 |
| DB Client | @neondatabase/serverless | 1.0.2 |
| Deploy | Vercel (serverless) | - |
| Linting | ESLint | 9.x |
| Bundler | Turbopack | built-in Next.js |
| Compiler | React Compiler (Babel plugin) | - |
| Class Utils | clsx + tailwind-merge + cva | 2.1.1 / 3.5.0 / 0.7.1 |

---

## Architettura

```
Browser (Client)
    |
    |-- Next.js Pages (SSR/CSR)
    |-- Web Speech API (STT)
    |-- NextAuth Session (JWT)
    |
    v
Vercel Edge Network
    |
    |-- Next.js API Routes (serverless functions)
    |       |
    |       |-- NextAuth (Google OAuth)
    |       |-- Gemini API (chat, closure, embeddings)
    |       |-- Neon PostgreSQL (data persistence)
    |       |
    v       v
Google Cloud           Neon Database
(Gemini API)           (PostgreSQL + pgvector)
```

### Pattern Architetturale
- **Monorepo**: frontend e backend nello stesso repository
- **Serverless**: nessun server persistente, tutto gira su Vercel Functions
- **API Routes**: ogni endpoint e una serverless function isolata
- **Client-side state**: React hooks (useState, custom hooks), nessun state manager globale
- **Auth**: JWT-based via NextAuth, session arricchita con `userId`

---

## Database

### Provider
**Neon** — PostgreSQL serverless con connection pooling automatico.

| Parametro | Valore |
|-----------|--------|
| Regione | aws-us-west-2 |
| Database | neondb |
| Pooler endpoint | ep-long-frog-ak9p1jcy-pooler.c-3.us-west-2.aws.neon.tech |
| Direct endpoint | ep-long-frog-ak9p1jcy.c-3.us-west-2.aws.neon.tech |
| SSL | Required |
| Extensions | pgvector |

### Schema

#### Tabella `users`
```sql
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT UNIQUE NOT NULL,
    name        TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabella `sessions`
```sql
CREATE TABLE sessions (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES users(id),
    date           DATE NOT NULL DEFAULT CURRENT_DATE,
    transcript     TEXT,
    summary        TEXT,
    mood_score     INTEGER CHECK (mood_score >= 1 AND mood_score <= 100),
    mood_keywords  TEXT[],
    embedding      vector(768),
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);
-- Index: idx_sessions_user_date (user_id, date DESC)
```

#### Tabella `messages`
```sql
CREATE TABLE messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  UUID NOT NULL REFERENCES sessions(id),
    role        TEXT NOT NULL,           -- 'user' | 'assistant'
    content     TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
-- Index: idx_messages_session (session_id, created_at)
```

#### Tabella `facts`
```sql
CREATE TABLE facts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    session_id      UUID NOT NULL REFERENCES sessions(id),
    type            fact_type NOT NULL,   -- ENUM: event, emotion, person, theme, insight
    content         TEXT NOT NULL,
    reference_date  DATE,
    tags            TEXT[],
    status          fact_status DEFAULT 'active', -- ENUM: active, followed_up, expired
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
-- Index: idx_facts_user_reference_date (user_id, reference_date) WHERE status = 'active'
-- Index: idx_facts_user_tags GIN(tags)
```

#### Enums
```sql
CREATE TYPE fact_type AS ENUM ('event', 'emotion', 'person', 'theme', 'insight');
CREATE TYPE fact_status AS ENUM ('active', 'followed_up', 'expired');
```

### Relazioni
```
users 1──N sessions
sessions 1──N messages
sessions 1──N facts
users 1──N facts
```

---

## Autenticazione

### Provider
**Google OAuth 2.0** tramite NextAuth.js

### Flusso
1. L'utente clicca "Accedi con Google" su `/login`
2. NextAuth redirige alla consent screen di Google
3. Google restituisce authorization code
4. Callback `signIn()`:
   - Verifica se l'utente esiste in `users`
   - Se nuovo, lo inserisce (`INSERT ... ON CONFLICT DO NOTHING`)
   - Salva `userId` nella sessione JWT
5. Tutte le API routes verificano l'autenticazione tramite `getAuthenticatedUserId()`

### Configurazione
- **Provider**: Google
- **Session Strategy**: JWT (default NextAuth)
- **Secret**: `NEXTAUTH_SECRET` (crittografia JWT)
- **Pagina login custom**: `/login`

### Protezione Route
Tutte le pagine tranne `/login` controllano la sessione NextAuth:
- Se non autenticato → redirect a `/login`
- Le API routes restituiscono `401 Unauthorized` senza sessione valida
- Eccezione: `/api/health` e pubblico (no auth)

---

## AI e Modelli

### Chat Conversazionale
| Parametro | Valore |
|-----------|--------|
| Modello | `gemini-3-flash-preview` |
| Temperature | 0.8 |
| Top P | 0.95 |
| Max output tokens | 1024 |
| Response MIME type | `application/json` |
| Response schema | `{ message: string, session_complete: boolean }` |

Il system prompt istruisce l'AI a:
- Comportarsi come un companion di journaling caldo e empatico
- Fare una domanda alla volta
- Chiudere dopo 3-5 scambi
- Incorporare il contesto del briefing (follow-up, trend, fatti correlati)

### Chiusura Sessione
| Parametro | Valore |
|-----------|--------|
| Modello | `gemini-3-flash-preview` |
| Temperature | 0.5 |
| Response MIME type | `application/json` |

Output strutturato:
```json
{
    "summary": "string (2-3 paragrafi)",
    "mood_score": "integer (1-100)",
    "mood_keywords": ["string (3-5 keywords)"],
    "facts": [{
        "type": "event|emotion|person|theme|insight",
        "content": "string",
        "reference_date": "YYYY-MM-DD | null",
        "tags": ["string"]
    }]
}
```

### Embeddings
| Parametro | Valore |
|-----------|--------|
| Modello | `gemini-embedding-2-preview` |
| Dimensionalita | 768 |
| Input | Summary della sessione |
| Output | `vector(768)` salvato in pgvector |

---

## API Endpoints

### `GET /api/sessions`
Restituisce la sessione di oggi per l'utente autenticato (o `null`).

### `POST /api/sessions`
Crea la sessione di oggi (o restituisce quella esistente). Upsert basato su `UNIQUE(user_id, date)`.

### `GET /api/sessions/[id]`
Restituisce una sessione specifica con tutti i messaggi ordinati per `created_at`.

### `GET /api/sessions/history`
Lista paginata delle sessioni completate.
- Query params: `offset` (default 0), `limit` (default 20)
- Ordine: `date DESC`
- Filtro: solo sessioni con `summary IS NOT NULL`

### `POST /api/messages`
Invia un messaggio utente e ottiene la risposta AI.
- Input: `{ session_id, content, briefing }`
- Processo:
  1. Inserisce il messaggio utente nel DB
  2. Recupera tutti i messaggi della sessione
  3. Costruisce il contesto con briefing
  4. Chiama Gemini per la risposta
  5. Inserisce la risposta AI nel DB
- Output: `{ message, session_complete }`

### `POST /api/close-session`
Genera la chiusura della sessione.
- Input: `{ session_id }`
- Processo:
  1. Recupera tutti i messaggi
  2. Formatta come trascritto (`Utente: ... / Jurnal: ...`)
  3. Chiama Gemini con il prompt di chiusura
  4. Genera embedding del summary
  5. Aggiorna la sessione con summary, mood_score, mood_keywords, embedding
  6. Inserisce i facts estratti
  7. Marca come `followed_up` i follow-up di oggi
- Output: `{ summary, mood_score, mood_keywords, facts_count }`

### `GET /api/briefing`
Contesto pre-sessione per il system prompt.
- Output: `{ todayFollowUps, moodTrend, correlatedFacts }`

### `GET /api/dashboard`
Dati per la dashboard analitica.
- Query params: `days` (default 30)
- Output: `{ moodData[], keywords[], trend }`
- `moodData`: array di `{ date, mood_score }` per il grafico
- `keywords`: array di `{ keyword, count }` per la word cloud
- `trend`: confronto media ultimi 7gg vs 7gg precedenti

### `GET /api/stt-token`
Restituisce credenziali per STT (attualmente non usato, il client usa Web Speech API).

### `GET /api/health`
Health check pubblico. Verifica la connessione al database.
- Output: `{ status: "healthy"|"unhealthy", timestamp, checks: { database } }`

---

## Speech-to-Text

### Implementazione
Il STT usa il **Web Speech API** nativo del browser — nessun servizio server-side.

| Parametro | Valore |
|-----------|--------|
| API | `window.SpeechRecognition` / `webkitSpeechRecognition` |
| Lingua | `it-IT` (Italiano) |
| Continuous | `true` |
| Interim Results | `true` |

### Hook: `useVoiceRecorder`
- Gestisce il lifecycle di riconoscimento vocale
- Espone: `isRecording`, `transcript`, `startRecording()`, `stopRecording()`
- Mostra risultati intermedi in tempo reale
- Al termine, restituisce il trascritto finale

### Compatibilita
- Chrome/Edge: supporto completo
- Safari: supporto parziale (prefisso `webkit`)
- Firefox: non supportato

---

## Frontend

### Struttura Pagine
```
app/
├── layout.tsx          # Root: font, metadata, Providers wrapper, dark mode
├── page.tsx            # Home (/)
├── login/page.tsx      # Login (/login)
├── session/page.tsx    # Sessione attiva (/session)
├── history/
│   ├── page.tsx        # Lista storico (/history)
│   └── [id]/page.tsx   # Dettaglio sessione (/history/[id])
└── dashboard/page.tsx  # Analytics (/dashboard)
```

### Hook Personalizzati

#### `useVoiceRecorder` (`hooks/use-voice-recorder.ts`)
Gestisce il Web Speech API. Stato: recording on/off, trascritto corrente. Ritorna il testo al termine.

#### `useSessionChat` (`hooks/use-session-chat.ts`)
Gestisce l'intera logica della chat di sessione:
- Creazione sessione (`POST /api/sessions`)
- Invio messaggi (`POST /api/messages`)
- Chiusura sessione (`POST /api/close-session`)
- Conteggio messaggi per i progress dots
- Stato: `messages[]`, `isLoading`, `isComplete`, `closureData`

### Navigazione
Bottom navigation bar fissa con 3 tab:
- **Home** (`/`): icona Home
- **Storico** (`/history`): icona BookOpen
- **Trend** (`/dashboard`): icona TrendingUp

Tab attivo evidenziato con indicatore viola.

### Styling

#### Tailwind CSS v4
La configurazione usa il sistema CSS-based di Tailwind v4 con variabili definite in `globals.css` tramite `@theme`.

#### Palette Colori
```css
--color-violet:     rgb(120, 80, 220);
--color-violet-dim: rgba(120, 80, 220, 0.15);
--color-teal:       rgb(60, 180, 160);
--color-teal-dim:   rgba(60, 180, 160, 0.15);
--color-pink:       rgb(200, 100, 150);
--color-pink-dim:   rgba(200, 100, 150, 0.15);
```

#### Font
- **Sans**: DM Sans (UI text, body)
- **Serif**: Libre Baskerville (titoli, accenti)

#### Dark Mode
Attivo di default tramite `className="dark"` su `<html>`. Non e previsto un light mode.

---

## Infrastruttura e Deploy

### Hosting: Vercel
- **Tipo**: Serverless (ogni API route = function isolata)
- **Build**: `next build` con Turbopack
- **Region**: Auto (match con Neon us-west-2)
- **Deploy**: Automatico su push a GitHub

### Database: Neon
- **Piano**: Serverless PostgreSQL
- **Connection pooling**: Abilitato (endpoint `-pooler`)
- **Branching**: Supportato (non attualmente in uso)
- **Regione**: aws-us-west-2

### Variabili d'Ambiente

| Variabile | Scopo |
|-----------|-------|
| `GOOGLE_CLIENT_ID` | OAuth client ID per Google sign-in |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret |
| `NEXTAUTH_SECRET` | Secret per crittografia JWT |
| `NEXTAUTH_URL` | URL base dell'app (localhost in dev, dominio in prod) |
| `DATABASE_URL` | Connection string PostgreSQL (Neon pooler) |
| `GOOGLE_AI_API_KEY` | API key per Google Gemini (chat + embeddings) |

### Script NPM
```bash
npm run dev      # Server di sviluppo locale (port 3000) con Turbopack
npm run build    # Build di produzione
npm run start    # Avvio server di produzione
npm run lint     # Linting con ESLint 9
```

---

## Configurazione

### `next.config.ts`
```typescript
{
    experimental: {
        reactCompiler: true    // Abilita React Compiler (ottimizza re-render)
    },
    turbopack: {
        root: __dirname        // Root per Turbopack
    }
}
```

### `tsconfig.json`
- Target: ES2017
- Strict mode: abilitato
- JSX: react-jsx (automatic runtime)
- Path alias: `@/*` → root del progetto
- Moduli: bundler resolution

### `components.json`
Configurazione shadcn/ui per generazione componenti. Style: New York, Base color: Neutral.

---

## Struttura File Chiave

```
lib/
├── auth.ts         # Config NextAuth + helper getAuthenticatedUserId()
├── db.ts           # Client Neon (neon() da @neondatabase/serverless)
├── gemini.ts       # Client Gemini: chatWithGemini(), generateClosure()
├── embedding.ts    # Client embedding: generateEmbedding() → number[768]
├── prompts.ts      # System prompts per chat e closure (italiano, JSON output)
├── types.ts        # Interfacce TS: Session, Message, Fact, MoodData, etc.
└── utils.ts        # Utility: cn() per class merging
```

---

## Sicurezza

- **Auth**: OAuth 2.0 (nessuna password gestita direttamente)
- **JWT**: Crittografato con `NEXTAUTH_SECRET`
- **SQL**: Query parametrizzate (nessun rischio SQL injection)
- **CORS**: Gestito da Vercel/Next.js
- **Env vars**: Non esposti al client (solo `NEXT_PUBLIC_*` lo sarebbero)
- **Route protection**: Ogni API route verifica `getAuthenticatedUserId()` che lancia errore se non autenticato
- **Row-level security**: Ogni query filtra per `user_id` dell'utente autenticato

---

## Limiti e Note

1. **Web Speech API**: non supportato su Firefox, funzionalita degradata su Safari
2. **Una sessione/giorno**: vincolo di design, non configurabile
3. **Embedding search**: l'infrastruttura pgvector e pronta ma la ricerca semantica non e ancora implementata nelle API
4. **STT token endpoint**: presente ma non utilizzato (il client usa Web Speech API nativo)
5. **No offline support**: richiede connessione internet per AI e database
6. **No multi-language**: l'interfaccia e i prompt sono solo in italiano
