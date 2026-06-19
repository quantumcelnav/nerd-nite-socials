# Nerdometer — Product Plan

**Tagline:** How nerdy are you, really?
**Owner:** Justin Fritz, Nerd Nite Fort Collins Boss
**Live:** https://nerd-nite-socials.vercel.app
**Repo:** https://github.com/quantumcelnav/nerd-nite-socials

---

## Product Vision

Nerdometer is a live-show trivia game tied to Nerd Nite Fort Collins events. Each edition is scoped to a specific show — talk titles, speakers, and questions authored per event, interspersed with the Nerd Nite origin story narrated by Justin. The game runs on audience phones during the show, with a live leaderboard gated to people in the room via a per-show nonce URL. Past editions stay playable forever at permanent URLs.

Open source (CC BY 4.0) — designed so any Nerd Nite city can fork and run their own edition.

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Vite + React | Mobile-first, PWA |
| Hosting | Vercel | Git push → auto-deploy ~90s |
| Database | Supabase | Scores + emails + show_state; real-time subscriptions |
| Style | Courier New, dark navy/cyan/orange | Monospace retro throughout |

**Supabase tables:**
- `scores` — id, edition, name, score, max_score, mode, hidden, **nonce**, created_at
- `emails` — id, email, subscribed, created_at
- `show_state` — edition (PK), frozen, **show_nonce**, **dashboard_enabled**, current_state, state_entered_at, wired_modules, created_at
- `show_checklist` — edition, state_id, item_key, completed, updated_at
- `show_comms` — edition, sender, message, created_at

**⚠ Schema note:** `scores.nonce` column was added manually on 2026-06-18 (show night). No schema.sql exists yet — `supabase/schema.sql` needs to be written before the next fresh install.

**Supabase free tier note:** Projects pause after 7 days of inactivity. Visit the site the day before each show to pre-wake the DB.

---

## Show Lifecycle

| Phase | How | Leaderboard |
|---|---|---|
| Ticket sales day | Push edition JSON without nonce | Practice mode (no writes) |
| Show night | Cockpit → ⚡ GENERATE nonce | Live (nonce URL required) |
| Testing pre-show | Play with nonce URL, then → ✕ RESET SCORES | Clears test scores |
| During trivia | Cockpit / Admin → Freeze toggle | Locked instantly via show_state |
| After trivia | Leave frozen | Frozen for history |
| Post-show cleanup | Admin panel → Hide bad names | Hidden from all views |
| Next show | Create S2026E07.json, prepend to index.json, push | New show goes live |
| Forever | /S2026E06 stays playable | Frozen, historical |

**Nonce source of truth (important):** `show_state.show_nonce` takes precedence over `edition.json` nonce. Cockpit GENERATE writes to DB. Leaderboard and live-mode detection both read DB first. Keep them in sync — after generating via cockpit, the build nonce in edition.json no longer matters for the live show.

---

## Special Routes

| URL | Renders |
|---|---|
| `/` | Home — current show (latest in index.json) |
| `/S2026E06` | That show's game + leaderboard, forever |
| `/?n=<nonce>` | Live mode — enables leaderboard write |
| `/?qr=1` | Full-screen QR projector slide |
| `/?hof=1` | Hall of Fame — top scorer per edition |
| `/?admin=<token>` | Admin panel — freeze toggle, hide/restore |
| `/S2026E06?admin=<token>` | Admin panel for a specific past show |

---

## Edition Data Structure

All edition files live in `public/editions/`. The `editions/` folder at repo root is the **author workspace** — draft and review files there, then copy to `public/editions/` when ready.

```
public/editions/index.json          ← [{slug, label}] newest first
public/editions/S2026E06.json       ← full edition data, served at runtime
editions/TEMPLATE.json              ← fill-in-the-blank starting point
```

`src/data/edition.json` — EditionContext fallback only (used when fetch fails in dev). Do not edit for show updates.

### Edition JSON schema

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
        { "difficulty": 1, "question": "...", "options": ["A","B","C","D"], "answer": 0 },
        { "difficulty": 2, "question": "...", "options": ["A","B","C","D"], "answer": 0 },
        { "difficulty": 3, "question": "...", "options": ["A","B","C","D"], "answer": 0 }
      ]
    }
  ],
  "originStory": [
    { "text": "Narrative card shown before round 1..." },
    { "text": "Narrative card shown before round 2..." },
    { "text": "Narrative card shown before round 3..." },
    { "text": "Outro card after final question..." }
  ]
}
```

**Scoring:**
| difficulty | label | points |
|---|---|---|
| 1 | Accessible | 100 |
| 2 | Nerdy | 300 |
| 3 | Deep Cut | 900 |

Max per show (3 talks × 3 questions): 3,900 pts. "Nerd Nite Boss" = 97%+.

---

## What's Built

| Feature | Status |
|---|---|
| Vite + React, PWA, Vercel auto-deploy | ✅ |
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
| Per-show nonce in edition JSON | ✅ |
| Freeze toggle (admin panel, instant, real-time) | ✅ |
| Admin panel hide/restore scores | ✅ |
| Hard delete from admin panel | ✅ |
| Targeted slur blocklist | ✅ |
| Supabase keepalive ping on load | ✅ |
| Archive playback (permanent URLs) | ✅ |
| Episode dropdown with labels | ✅ |
| Error boundary | ✅ |
| CC BY 4.0 license | ✅ |
| HOSTING.md host runbook | ✅ |

---

## Version Tags

| Tag | Commit | Notes |
|---|---|---|
| `show/S2026E06` | 08290d0 | S2026E06 live show, June 18 2026 — first Nerdometer show |

Convention: `show/S2026EXX` for every live show. Tag before pushing post-show changes.

---

## Known Issues / Polish (post-S2026E06)

### P0 — Fix before next show
- **RESET SCORES unreliable**: bulk `UPDATE scores SET hidden=true WHERE nonce=X` may be blocked by Supabase RLS policy. Needs a dedicated policy or a server-side function. Workaround: run SQL manually in Supabase console.
- **No schema.sql**: fresh install requires manually running ALTER TABLE commands. Write `supabase/schema.sql` with full table + policy definitions.
- **Nonce column missing from HOSTING.md setup**: add the `ALTER TABLE scores ADD COLUMN nonce text` step to the initial setup section.

### P1 — Nonce system simplification
The nonce lives in two places (edition.json + show_state.show_nonce) and the fallback logic caused confusion on show night. Proposed simplification:
- Cockpit GENERATE is the only way to set a live nonce (DB only)
- edition.json never has a nonce field — remove it from the schema
- Leaderboard only filters by nonce when `show_state.show_nonce` is explicitly set
- Practice mode = no nonce in show_state; scores don't submit

### P2 — Regression testing
See Test Plan section below. Automate with Playwright.

---

## Next Steps

### 1. Reaction GIFs
Justin creating episode-agnostic NNFC GIFs with Qwen image edit.
- Drop into `src/assets/gifs/correct.gif` and `src/assets/gifs/wrong.gif`
- Update `src/data/reactions.js` to point at them
- `ReactionGif.jsx` is already wired — no other code changes needed

### 2. Past show archive

15 editions authored and live in `public/editions/`. Sources: `fortcollins.nerdnite.com` for episode metadata.

**TODO — question accuracy pass:**
Questions were written from website summaries, not full talk abstracts. Before any show gets heavy traffic, pull the full abstract from the website post and tighten questions to the speaker's specific angle. Speaker review emails sent separately — corrections will come back for each show.

**Shows not yet authored (website has abstracts):**
- S2025E01–E05, S2025E09–E10
- S2026E02–E05

Workflow: fetch abstract → write questions → create JSON → prepend to index.json → push → verify at `/S20XXE00`.

### 3. Multiple nonces (future)
Change `nonce` to `nonces: ["abc", "def"]` array. 2-line change to useNonce.js.

### 4. Speaker question review (process)
All questions should be sent to speakers for accuracy sign-off before going live.

---

## Design Decisions

| Decision | Choice | Reason |
|---|---|---|
| Host-controlled vs self-paced | Self-paced | Bar format; sync is operationally risky |
| Nonce location | edition JSON | One file, one push; Vercel env var was two-step |
| Freeze mechanism | Supabase show_state | Instant, real-time, no git push required |
| GIF generation | Manual (Justin) | AI GIF quality inconsistent; Qwen gives control |
| Database | Supabase (keep) | Real-time + RLS + free tier |
| Leaderboard moderation | Soft-delete (hidden) | Recoverable; audit trail |
| Archive format | public/editions/*.json | Static files, served at runtime |

---

## Prize / Tiebreaker

High score wins a prize. Ties resolved by host-run coin-flip elimination: ~half eliminated each round until one remains. Stage ceremony — no app logic. Live leaderboard is the source of truth.

---

## Test Plan

### Automated regression tests (Playwright — to be written)

Each test suite maps to a feature. Any push to main should run all suites. A broken suite blocks deploy.

**Suite A — Game flow (golden path)**
- Home loads with correct edition title and date
- Start trivia → 9 questions answered → score screen shows correct score
- Start What Is It → completes without error
- Origin story cards appear between rounds (3 cards)
- Full replay from score screen resets all state

**Suite B — Nonce / live mode**
- Without `?n=`: score screen shows practice mode message, no name input
- With correct `?n=<nonce>`: name input appears, submit enabled
- With wrong `?n=`: practice mode (not live)
- After submit: score appears on leaderboard filtered to that nonce
- Scores from a different nonce do NOT appear on leaderboard

**Suite C — Leaderboard**
- Leaderboard shows only scores matching active nonce
- Hidden scores do not appear
- Real-time: new score submitted in tab 2 appears in tab 1 without refresh
- Frozen leaderboard: submit form replaced with "closed" message

**Suite D — Admin**
- Freeze toggle: sets frozen=true in DB, score submit blocked immediately
- Hide score: score disappears from public leaderboard, still in admin list
- Restore score: score reappears on public leaderboard
- RESET SCORES: all scores for nonce hidden in one action

**Suite E — Routes**
- `/S2026E06` loads the correct archived edition
- `/?qr=1` renders QR slide with correct URL
- `/?hof=1` renders Hall of Fame with at least one entry
- Episode dropdown navigates between editions correctly

### Pre-show manual checklist (until Playwright is wired)
- [ ] Wake Supabase: visit production URL the day before
- [ ] Play full game with `?n=<nonce>`, confirm score appears on leaderboard
- [ ] Test RESET SCORES, confirm leaderboard clears
- [ ] QR slide renders with correct nonce URL
- [ ] Freeze toggle works
- [ ] Poster image loads

### Scoring spot-check
| Scenario | Expected % | Expected Tier |
|---|---|---|
| All correct | 100% | Nerd Nite Boss |
| All Deep Cuts correct only | ~69% | Certified Nerd |
| Only Accessibles correct | ~23% | Apprentice Nerd |
| All wrong | 0% | Curious Muggle |
