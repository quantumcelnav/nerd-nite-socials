# Nerdometer

**How nerdy are you, really?**

A live trivia game built for [Nerd Nite Fort Collins](https://www.facebook.com/profile.php?id=100093506363610). Audience members play on their phones during the show, answer questions about that night's talks, and compete on a live leaderboard — gated to people actually in the room.

Live at: **https://nerd-nite-socials.vercel.app**

---

## What it does

- Two game modes: **Trivia** (talk-specific questions) and **What Is It?** (ontology)
- Questions authored per show around real Nerd Nite talks
- Origin story of Nerd Nite Fort Collins narrated between rounds
- Live leaderboard via Supabase — updates in real time
- Audience access gated by a per-show nonce URL (`?n=<code>`) shown as a QR code
- Hall of Fame (`?hof=1`) — top scorer per edition across all shows
- QR projector slide (`?qr=1`) for display at the venue
- Email capture for show announcements
- Practice mode for anyone without the nonce

---

## Stack

- **Frontend:** Vite + React, PWA
- **Hosting:** Vercel (git push → auto-deploy)
- **Database:** Supabase (PostgreSQL + real-time)
- **Style:** Courier New monospace, dark navy/cyan/orange

---

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in Supabase credentials
npm run dev
```

Without Supabase credentials the app runs in offline mode — game works, leaderboard shows "No scores yet".

---

## Show workflow

Update one file, push once:

1. Edit `src/data/edition.json` — talks, questions, nonce
2. `git push origin main`
3. Vercel deploys in ~90 seconds

Full instructions: **[HOSTING.md](HOSTING.md)**

---

## For other Nerd Nites

This project is designed to be forked:

1. Fork the repo and connect to your own Vercel + Supabase
2. Replace `originStory` in edition.json with your city's story
3. Update social links in `src/components/PostGame.jsx`
4. Update the credit in `src/components/Home.jsx`
5. Follow HOSTING.md for every show

---

## License

[CC BY 4.0](LICENSE) — free to use, adapt, and share with attribution.
Credit: Nerd Nite Fort Collins / Justin Fritz
