# Jurnal — Documentazione di Progetto

## Panoramica

**Jurnal** e una piattaforma web di journaling personale potenziata dall'intelligenza artificiale, focalizzata sul benessere emotivo e l'auto-riflessione. L'utente registra i propri pensieri quotidiani tramite voce o testo, riceve domande di follow-up personalizzate da un companion AI, e traccia l'andamento dell'umore nel tempo.

La piattaforma e interamente in lingua italiana — sia nell'interfaccia utente che nelle interazioni con l'AI.

---

## Utenti Target

Persone che cercano un'esperienza di journaling strutturato con supporto AI: appassionati di benessere mentale, chi preferisce il journaling vocale, e chi vuole tracciare pattern emotivi nel tempo.

---

## Funzionalita Core

### 1. Journaling Vocale e Testuale

L'utente avvia una sessione giornaliera dalla home page. L'input puo avvenire in due modi:

- **Voce**: tramite il Web Speech API del browser (lingua: `it-IT`). La trascrizione appare in tempo reale durante la registrazione grazie a `interimResults: true`.
- **Testo**: tramite un campo di input tradizionale.

Ogni sessione e limitata a **una al giorno** per utente (vincolo UNIQUE su `user_id + date` nel database).

### 2. Conversazione AI

Dopo ogni messaggio dell'utente, l'AI risponde con una domanda di follow-up o un commento empatico. Il companion AI:

- Fa **una domanda alla volta**, in modo naturale e non invadente
- Chiude la sessione dopo **3-5 scambi** (segnalato dal campo `session_complete` nella risposta)
- Tiene conto del **contesto precedente**: follow-up su eventi menzionati in sessioni passate, trend dell'umore, fatti rilevanti

Il contesto viene costruito tramite l'endpoint `/api/briefing`, che fornisce:
- Follow-up pendenti per la data odierna (fatti con `reference_date = today`)
- Trend umore degli ultimi 7 giorni
- Ultimi 20 fatti attivi dell'utente

### 3. Chiusura Sessione e Analisi

Quando la conversazione si conclude, il sistema genera automaticamente:

- **Summary**: un riassunto di 2-3 paragrafi della sessione
- **Mood Score**: un punteggio da 1 a 100 che rappresenta l'umore complessivo
- **Mood Keywords**: 3-5 parole chiave emotive (es. "sereno", "ansioso", "motivato")
- **Facts**: fatti strutturati estratti dalla conversazione

I fatti estratti sono categorizzati per tipo:
| Tipo | Descrizione | Esempio |
|------|-------------|---------|
| `event` | Evento menzionato | "colloquio di lavoro venerdi" |
| `emotion` | Stato emotivo | "ansia per la presentazione" |
| `person` | Persona menzionata | "discussione con Marco" |
| `theme` | Tema ricorrente | "equilibrio lavoro-vita" |
| `insight` | Riflessione personale | "mi rendo conto che evito il conflitto" |

Ogni fatto puo avere una `reference_date` (per follow-up futuri) e `tags` (per ricerca semantica).

### 4. Sistema di Memoria AI

Il sistema mantiene una **memoria persistente** dell'utente attraverso la tabella `facts`:

- Dopo ogni sessione, i fatti vengono estratti e salvati con stato `active`
- I fatti con `reference_date` futura vengono presentati come follow-up nella sessione corrispondente
- Quando un follow-up viene affrontato, il suo stato cambia a `followed_up`
- I fatti hanno un indice GIN sui `tags` per ricerca efficiente

Questo permette al companion AI di ricordare eventi, persone, emozioni e temi tra una sessione e l'altra, creando continuita nel percorso di journaling.

### 5. Embedding Semantici

Alla chiusura di ogni sessione, il summary viene trasformato in un **vettore a 768 dimensioni** tramite il modello Gemini Embedding 2 Preview. Il vettore viene salvato nella colonna `sessions.embedding` (tipo `vector(768)` tramite pgvector).

Questo abilita future funzionalita di:
- Ricerca semantica tra sessioni ("trova sessioni simili a questa")
- Correlazione di pattern emotivi su base semantica
- Raggruppamento tematico automatico

### 6. Dashboard Analitica

La dashboard (`/dashboard`) offre:

- **Grafico Mood Trend**: visualizzazione dell'andamento del mood score su 7, 30 o 90 giorni tramite un LineChart con gradiente
- **Trend Insight**: confronto tra la media degli ultimi 7 giorni e i 7 giorni precedenti, con indicazione di miglioramento o peggioramento
- **Keyword Cloud**: nuvola di parole che mostra le keyword emotive piu frequenti, con opacita proporzionale alla frequenza (max 15 keyword)

### 7. Storico Sessioni

La pagina `/history` mostra l'elenco cronologico di tutte le sessioni completate:

- Lista paginata (20 sessioni per pagina)
- Ogni card mostra: data, mood score, anteprima del summary, keyword
- Click per visualizzare il dettaglio completo: trascritto integrale (messaggi utente/AI), summary, mood score, keyword

---

## Flusso Utente

```
Login (Google OAuth)
    |
    v
Home Page
    |-- Nessuna sessione oggi --> Pulsante "Inizia" (microfono)
    |-- Sessione completata --> Mostra summary + mood + keywords
    |
    v
Sessione Attiva (/session)
    |
    |-- 1. L'utente parla o scrive
    |-- 2. Il sistema trascrive (se voce) e invia all'AI
    |-- 3. L'AI risponde con una domanda
    |-- 4. Ripeti per 3-5 scambi
    |-- 5. L'AI segnala completamento
    |
    v
Chiusura Automatica
    |-- Genera summary, mood_score, mood_keywords
    |-- Estrae facts (eventi, emozioni, persone, temi, insight)
    |-- Crea embedding del summary
    |-- Mostra riepilogo all'utente
    |
    v
Navigazione
    |-- /history --> Storico sessioni
    |-- /dashboard --> Analytics e trend
```

---

## Progresso Sessione

La sessione e scandita da **5 step** visualizzati tramite progress dots:

1. Domanda iniziale dell'AI
2. Primo scambio
3. Secondo scambio
4. Terzo scambio
5. Chiusura e riepilogo

Il dot corrente e evidenziato con un'animazione glowing viola, quelli completati sono teal attenuato, quelli futuri sono sbiaditi.

---

## Design e UX

### Tema Visivo
- **Modalita**: Dark theme (attiva di default)
- **Palette**: Viola (`rgb(120,80,220)`), Teal (`rgb(60,180,160)`), Pink (`rgb(200,100,150)`)
- **Font**: DM Sans (sans-serif, per testo UI) + Libre Baskerville (serif, per titoli/accent)
- **Background**: Aurora animata con gradienti radiali viola/teal/pink con animazione pulse

### Componenti Chiave
- **Aurora Background**: sfondo animato con gradienti che pulsano
- **Voice Recorder**: pulsante microfono con animazione wave durante la registrazione
- **Chat Bubbles**: bolle di chat colorate per utente (outline) e AI (filled viola)
- **Mood Score**: numero grande con colore a fasce (teal >=70, viola >=40, pink <40)
- **Mood Pills**: pillole keyword con colore basato sul sentimento (positive=teal, negative=pink, neutral=viola)
- **Bottom Nav**: navigazione fissa a 3 tab (Home, Storico, Trend)

### Responsive
L'interfaccia e progettata mobile-first con navigazione bottom-tab, adatta all'uso su smartphone come diario quotidiano.

---

## Logica di Business

### Una Sessione al Giorno
Il vincolo `UNIQUE(user_id, date)` garantisce una sola sessione per utente per giorno. L'endpoint `POST /api/sessions` esegue un upsert: se la sessione esiste gia, la restituisce; se no, ne crea una nuova.

### Briefing Pre-Sessione
Prima di iniziare la conversazione, il frontend chiama `/api/briefing` per ottenere il contesto. Questo viene incorporato nel system prompt dell'AI, permettendo al companion di:
- Fare follow-up su eventi menzionati in sessioni precedenti
- Commentare il trend dell'umore
- Collegare temi ricorrenti

### Mood Scoring
Il mood score e un intero da 1 a 100 generato dall'AI analizzando il tono complessivo della conversazione:
- **70-100**: stato emotivo positivo (colore teal)
- **40-69**: stato neutro o misto (colore viola)
- **1-39**: stato emotivo difficile (colore pink)

### Keyword Sentiment
Le mood keywords sono classificate come:
- **Positive**: parole come "sereno", "felice", "motivato" → colore teal
- **Negative**: parole come "ansioso", "triste", "stressato" → colore pink
- **Neutral**: parole come "riflessivo", "stanco", "incerto" → colore viola

La classificazione avviene lato client tramite liste di parole predefinite nel componente `MoodPills`.

### Trend Analysis
Il dashboard calcola il trend confrontando:
- Media mood score degli **ultimi 7 giorni**
- Media mood score dei **7 giorni precedenti**

La differenza indica se l'umore sta migliorando, peggiorando, o e stabile.
