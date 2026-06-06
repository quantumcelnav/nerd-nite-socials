# Nerdometer — Host Guide

How to run Nerdometer for your show. The full cycle from prep to post-show.

---

## One-time setup

1. Fork this repo on GitHub
2. Create a free account at [vercel.com](https://vercel.com) and import your fork
3. In Vercel: **Settings → Git** — connect your GitHub repo, production branch = `main`
4. Done. Every push to `main` auto-deploys in ~90 seconds.

---

## Before every show — prep (1–2 days out)

### 1. Branch off main

```bash
git checkout main && git pull
git checkout -b staging
```

### 2. Copy the template for your new show

```bash
cp editions/TEMPLATE.json editions/S20XXE00.json
```

Rename it to your actual show code: `S2026E08.json`, `S2027E01.json`, etc.

### 3. Fill in your show details

Edit `editions/S2026E08.json`:

- `edition` — your show code, e.g. `"S2026E08"`
- `date` — full date string, e.g. `"Thursday, October 15, 2026"`
- `venue` — your venue name
- `doorsOpen` / `talksStart` — show times
- `admission` — ticket price string
- `ticketUrl` — your Humanitix / Eventbrite link (or remove the field)
- `talks` — 3 talks, each with 3 questions (see scoring below)
- `poster` — filename of your poster image (see step 5)
- `originStory` — 4 cards shown between game rounds + outro

**Scoring:**

| difficulty | label | points |
|---|---|---|
| 1 | Accessible | 100 |
| 2 | Nerdy | 300 |
| 3 | Deep Cut | 900 |

Max score per show (3 talks × 3 questions): 3,900 pts.
"Nerd Nite Boss" tier = 97%+ = requires getting all 3 Deep Cut questions right.

### 4. Copy the finished JSON to be the live edition

```bash
cp editions/S2026E08.json src/data/edition.json
```

### 5. Add your poster (optional)

Drop your poster image into `src/assets/` named `poster_s2026e08.jpg`.
Then set `"poster": "poster_s2026e08.jpg"` in edition.json.
No poster? Leave the field out — the app hides the section gracefully.

### 6. Push to staging and QA

```bash
git add editions/S2026E08.json src/data/edition.json src/assets/poster_s2026e08.jpg
git commit -m "S2026E08 — [topic]"
git push origin staging
```

Vercel builds a preview URL automatically. Open it, play through the game,
check the talks and questions look right.

---

## Show night

### 30 minutes before doors

**Set the nonce in Vercel:**

1. Generate a random code: `openssl rand -hex 3` (e.g., `f3a9c1`)
2. Vercel → your project → **Settings → Environment Variables**
3. Set `VITE_SHOW_NONCE` = `f3a9c1` (update the existing variable)
4. Vercel redeploys automatically (~90 sec)

**Merge staging to main:**

```bash
git checkout main
git merge staging
git push origin main
```

Production is now live with tonight's show.

### At doors-open (6:30pm)

Open on your laptop / projector:
```
https://your-site.com/?qr=1
```

This is your QR slide — full screen, shows the QR code and the live URL.
Leave it up while people are finding seats.

Your audience URL is:
```
https://your-site.com/?n=f3a9c1
```

Anyone who scans the QR gets the **LIVE TONIGHT** badge and can submit their
score to the leaderboard. Everyone else can still play but is in practice mode.

### During the show

The game is self-serve — audience plays on their phones between/after talks.
Check the leaderboard live at your production URL.

---

## After the show

The nonce from tonight is "used up" — set a new one before the next show
and the old one stops working automatically. No cleanup needed.

The editions archive is already saved in `editions/S2026E08.json` — that file
stays in the repo permanently as the show record.

---

## For other Nerd Nites

1. Fork the repo
2. Replace `originStory` content with your city's story
3. Replace the social links in `src/components/PostGame.jsx` with your pages
4. Update the footer / header credit in `src/components/Home.jsx`
5. Follow this guide for every show

Licensed CC BY 4.0 — free to use, adapt, and share with attribution.
Credit: Nerd Nite Fort Collins / Justin Fritz
