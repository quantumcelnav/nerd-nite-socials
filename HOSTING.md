# Nerdometer — Host Guide

How to run Nerdometer for your show. The full cycle from prep to post-show.

---

## One-time setup

1. Fork this repo on GitHub
2. Create a free account at [vercel.com](https://vercel.com) and import your fork
3. Create a free Supabase project — run the SQL in `supabase/schema.sql` to create tables
4. In Vercel: **Settings → Environment Variables** — set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
5. Done. Every push to `main` auto-deploys in ~90 seconds.

---

## On ticket sales day — go live early (optional)

Put the game live with teaser questions and no leaderboard. Players can
explore the game in practice mode while they wait for the real show.

1. Create `public/editions/S2026E08.json` with the talk titles and speaker
   names but placeholder or teaser questions. **Leave out the `nonce` field.**
2. Prepend to `public/editions/index.json`:
   ```json
   [
     {"slug": "S2026E08", "label": "S2026E08 — October 2026"},
     {"slug": "S2026E06", "label": "S2026E06 — June 2026"}
   ]
   ```
3. Push to main — home screen shows the new show in practice mode.

Everyone can play. No scores submit. Leaderboard shows "No scores yet."
On show night, swap in the real questions + nonce and push. Same slug, same URL.

---

## Before every show — prep (1–2 days out)

### 1. Wake Supabase

Visit your production URL the day before the show. This wakes the Supabase database
if it has been idle. First query after a week of inactivity takes ~30 seconds —
you do not want that to happen in front of a crowd.

### 2. Branch off main

```bash
git checkout main && git pull
git checkout -b staging
```

### 3. Create your edition file

```bash
cp editions/TEMPLATE.json public/editions/S2026E08.json
```

### 4. Fill in your show details

Edit `public/editions/S2026E08.json`:

- `edition` — your show code, e.g. `"S2026E08"`
- `nonce` — generate with `openssl rand -hex 3`, e.g. `"f3a9c1"` (this is your secret live URL)
- `date` — full date string, e.g. `"Thursday, October 15, 2026"`
- `venue` — your venue name
- `doorsOpen` / `talksStart` — show times
- `admission` — ticket price string
- `ticketUrl` — your Humanitix / Eventbrite link (or remove the field)
- `talks` — 3 talks, each with 3 questions (see scoring below)
- `poster` — filename of your poster image (see step 6)
- `originStory` — 4 cards shown between game rounds + outro

**Scoring:**

| difficulty | label | points |
|---|---|---|
| 1 | Accessible | 100 |
| 2 | Nerdy | 300 |
| 3 | Deep Cut | 900 |

Max score per show (3 talks × 3 questions): 3,900 pts.
"Nerd Nite Boss" tier = 97%+ = requires getting all 3 Deep Cut questions right.

### 5. Register the edition in the index

Open `public/editions/index.json` and prepend your new slug:

```json
["S2026E08", "S2026E07", "S2026E06"]
```

The home screen always shows the first entry. Past shows stay in the list
and are accessible at their permanent URLs.

### 6. Add your poster (optional)

Drop your poster image into `src/assets/` named `poster_s2026e08.jpg`.
Then set `"poster": "poster_s2026e08.jpg"` in edition.json.
No poster? Leave the field out — the app hides the section gracefully.

### 7. Push to staging and QA

```bash
git add public/editions/S2026E08.json public/editions/index.json src/assets/poster_s2026e08.jpg
git commit -m "S2026E08 — [topic]"
git push origin staging
```

Vercel builds a preview URL automatically. Open it, play through the game,
check the talks and questions look right.

---

## Show night

### 30 minutes before doors — go live

Merge staging to main:

```bash
git checkout main
git merge staging
git push origin main
```

Production deploys in ~90 seconds with tonight's show and your nonce baked in.

Your audience URL (the one on the QR code) is:
```
https://your-site.com/?n=f3a9c1
```
Replace `f3a9c1` with whatever nonce you set in edition.json.

### At doors-open (6:30pm)

Open on your laptop / projector:
```
https://your-site.com/?qr=1
```

This is your QR slide — full screen, shows the QR code and the live URL.
Leave it up while people are finding seats.

Anyone who scans the QR gets the **LIVE TONIGHT** badge and can submit their
score to the leaderboard. Everyone else can still play but is in practice mode.

### During the show

The game is self-serve — audience plays on their phones between/after talks.

**Bookmark your admin panel before the show:**
```
https://your-site.com/?admin=<your-VITE_ADMIN_TOKEN>
```
Open it on your phone. Any name you Hide disappears from the leaderboard
instantly. Restore brings it back. The edition switcher lets you moderate
past shows too.

Check the live leaderboard at your production URL. To moderate a past show:
```
https://your-site.com/S2026E06?admin=<your-token>
```

---

## After the show — freeze the leaderboard

To lock the leaderboard so no new scores can be added:

1. Remove the `nonce` field from `public/editions/S2026E08.json`
2. Push to main:

```bash
git add public/editions/S2026E08.json
git commit -m "S2026E08 post-show — freeze leaderboard"
git push origin main
```

After deploy, everyone is in practice mode — scores no longer submit.
The leaderboard data stays in Supabase permanently and appears in the Hall of Fame
(`https://your-site.com/?hof=1`).

---

## Hall of Fame

Visit `/?hof=1` to see the all-time leaderboard — top scorer per edition across
every show. Great to display at the start of the next show as a "last time on
Nerd Nite…" slide.

---

## For other Nerd Nites

1. Fork the repo
2. Replace `originStory` content with your city's story
3. Replace the social links in `src/components/PostGame.jsx` with your pages
4. Update the footer / header credit in `src/components/Home.jsx`
5. Follow this guide for every show

Licensed CC BY 4.0 — free to use, adapt, and share with attribution.
Credit: Nerd Nite Fort Collins / Justin Fritz
