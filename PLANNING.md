# Nerdometer — Product Plan

**Tagline:** How nerdy are you, really?
**Owner:** Justin Fritz, Nerd Nite Fort Collins Boss
**Live:** https://nerd-nite-socials.vercel.app

---

## Product Vision

Nerdometer is a live-show trivia game tied to Nerd Nite Fort Collins events. Each edition is scoped to a specific show: talk titles, speakers, and questions are authored per event, interspersed with the Nerd Nite origin story narrated by Justin. The game runs on audience phones during the show, with a live leaderboard gated to people actually in the room via a per-show nonce URL.

The tool is open source (CC BY 4.0) — designed so any Nerd Nite city can fork it and run their own edition.

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Vite + React | Mobile-first, PWA |
| Hosting | Vercel | Git push → auto-deploy ~90s |
| Database | Supabase | Scores + emails, real-time subscriptions |
| Style | Courier New, dark navy/cyan/orange | Monospace retro throughout |

**Supabase free tier note:** Projects pause after 7 days of inactivity. Visit the site the day before each show to pre-wake the DB. Supabase Pro ($25/mo) removes this if it becomes a problem.

---

## Show Workflow (one file, one push)

1. Edit `src/data/edition.json` — new show info, talks, questions, nonce
2. `git push origin main`
3. Vercel deploys in ~90 seconds — production is live
4. After show: remove nonce field from edition.json, push → leaderboard freezes

Full runbook: `HOSTING.md`

---

## Architecture

### Nonce system
- `edition.nonce` in edition.json is the per-show secret
- Live URL: `https://nerd-nite-socials.vercel.app/?n=<nonce>`
- Audience gets this URL via QR code at show time
- Without the nonce: practice mode (game works, scores don't submit)
- Nonce comparison strips non-alphanumeric chars (tolerates copy-paste punctuation)

### Leaderboard
- Supabase `scores` table: `edition, name, score, max_score, mode, created_at`
- Filtered by current `edition.edition` string
- Real-time subscription via `postgres_changes` INSERT — board updates live
- Hall of Fame (`/?hof=1`): top scorer per edition, all time

### Edition data
- Current show: `src/data/edition.json`
- Archive: `editions/S20XXE00.json` — permanent record of every show
- Template: `editions/TEMPLATE.json`

### Special routes
| URL param | Renders |
|---|---|
| `?qr=1` | Full-screen QR projector slide |
| `?hof=1` | Hall of Fame — top scorer per edition |
| `?n=<nonce>` | Live mode — enables leaderboard write |

---

## Content Schema (edition.json)

```json
{
  "edition": "S2026E06",
  "nonce": "4hxqp7",
  "poster": "poster_s2026e06.jpg",
  "date": "Thursday, June 18, 2026",
  "venue": "Wolverine Farm Publick House",
  "doorsOpen": "6:30pm",
  "talksStart": "7:00pm",
  "admission": "$8 · Students $4",
  "ticketUrl": "https://events.humanitix.com/...",
  "talks": [
    {
      "id": 1,
      "title": "Talk Title",
      "speaker": "Speaker Name",
      "questions": [
        {
          "difficulty": 1,
          "question": "Question text?",
          "options": ["A", "B", "C", "D"],
          "answer": 0
        }
      ]
    }
  ],
  "originStory": [
    { "text": "Narrative card text..." }
  ]
}
```

**Scoring:**
| difficulty | label | points |
|---|---|---|
| 1 | Accessible | 100 |
| 2 | Nerdy | 300 |
| 3 | Deep Cut | 900 |

Max per show: 3,900 pts. "Nerd Nite Boss" = 97%+.

---

## What's Built

| Feature | Status |
|---|---|
| Vite + React, Vercel git auto-deploy | ✅ |
| Nerdometer branding, Courier New style | ✅ |
| Trivia mode (3 talks × 3 questions) | ✅ |
| "What Is It?" ontology mode | ✅ |
| Origin story cards between rounds | ✅ |
| Logarithmic scoring + tier system | ✅ |
| Score submit with name entry | ✅ |
| Share card (nonce stripped from URL) | ✅ |
| Email capture / social links post-game | ✅ |
| Supabase leaderboard, real-time updates | ✅ |
| Home screen top-3 scores (live) | ✅ |
| Hall of Fame (`/?hof=1`) | ✅ |
| QR projector slide (`/?qr=1`) | ✅ |
| Per-show nonce in edition.json | ✅ |
| Supabase keepalive ping on load | ✅ |
| Edition archive (`editions/`) | ✅ |
| HOSTING.md host runbook | ✅ |
| Error boundary | ✅ |
| PWA support | ✅ |
| CC BY 4.0 license | ✅ |

---

## Next Steps

### 1. Archive Playback (next)
Let players replay any past show after the event — with its real leaderboard.

- Move `editions/*.json` to `public/editions/` (served as static files)
- Replace hardcoded `import edition from '../data/edition.json'` with a React context
- Edition loaded at runtime: `fetch(/editions/${slug}.json)`
- Archive picker at `/?archive=1` — lists all past shows, click to play
- Leaderboard already filtered by edition — works automatically

**Impact:** Major refactor of edition data flow (currently hardcoded in ~8 components). Well-understood scope, ~1 day.

### 2. Reaction GIFs
Justin is creating episode-agnostic NNFC-branded GIFs using Qwen image edit.
Assets: correct answer GIF, wrong answer GIF (at minimum).

Once assets exist:
- Drop GIFs into `src/assets/gifs/`
- Wire into Game.jsx answer feedback — show on correct/wrong

**Impact:** Small code change once assets are ready.

### 3. Multiple Nonces (future)
Change `nonce` to `nonces: ["abc", "def"]` array in edition.json.
Use case: different QR codes for different sections of the bar.
Check: `nonces.includes(param)` instead of `param === nonce`.

**Impact:** 2-line change to useNonce.js + edition.json schema.

### 4. Fun Facts per Question (future)
Show a short fun fact after each answer reveal.
Requires content: one fact per question from Justin/speaker.
Add `"fact": "..."` field to each question in edition.json.

---

## Design Decisions Log

| Decision | Choice | Reason |
|---|---|---|
| Host-controlled vs self-paced | Self-paced | Bar format; sync is operationally risky |
| Nonce location | edition.json | One file, one push; Vercel env var was two-step |
| GIF generation | Manual (Justin) | AI GIF quality inconsistent; Qwen gives control |
| Database | Supabase (keep) | Real-time + RLS + free tier; replacing needs a backend |
| Hosting | Vercel (keep) | Auto-deploy from git; trivial to move if needed |

---

## Test Plan

### Pre-show checklist
- [ ] Visit production URL day before (wakes Supabase)
- [ ] Play through full game on staging with nonce URL
- [ ] Confirm score appears on leaderboard
- [ ] QR slide renders correctly (`/?qr=1`)
- [ ] Poster image loads

### Manual playtest (every push to main)
- [ ] Home loads, top scores show (or "No scores yet")
- [ ] Both game modes start and complete
- [ ] Origin story cards appear between rounds
- [ ] Correct/wrong answer feedback works
- [ ] Score submit: name entry, Submit button, Supabase write confirmed
- [ ] Practice mode message shows without nonce
- [ ] Leaderboard loads and Back to Home works
- [ ] Hall of Fame loads (`/?hof=1`)
- [ ] Full replay without refresh resets state cleanly

### Scoring verification
| Scenario | Expected % | Expected Tier |
|---|---|---|
| All correct | 100% | Nerd Nite Boss |
| All Deep Cuts correct only | ~69% | Certified Nerd |
| Only Accessibles correct | ~23% | Apprentice Nerd |
| All wrong | 0% | Curious Muggle |
