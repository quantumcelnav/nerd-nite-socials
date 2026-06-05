# Nerd Nite Socials — Project Plan

## Overview
A Vite-powered web app hosted on Vercel. Features a game with high score tracking and links to Nerd Nite social media accounts.

---

## Stack
- **Frontend:** Vite + React
- **Hosting:** Vercel
- **High Scores:** Supabase (global leaderboard)

---

## Features

### Game
- [ ] Trivia game — question format and category TBD
- [ ] Score tracking per round
- [ ] Score submission flow (name/handle entry after game ends)

### High Score Storage
- **Supabase (Postgres)** — global leaderboard, sortable, free tier available
- Scores stored with player name, score, and timestamp

### Social Links
- [ ] Links to Nerd Nite social media accounts (platforms TBD)
- [ ] Displayed on main page and/or post-game screen

---

## Pages / Views
- **Home / Game** — main landing page with the game
- **Leaderboard** — top scores (if persistent backend is used)
- **About / Links** — social media links, info about Nerd Nite

---

## Open Questions
- What kind of game? (trivia, arcade, puzzle, etc.)
- Which social platforms to link? (Instagram, Twitter/X, Facebook, etc.)
- Leaderboard scope: local only, or global persistent?
- Any branding/design direction?
- Auth required for score submission, or anonymous?

---

## Milestones
1. [ ] Scaffold Vite app, deploy to Vercel
2. [ ] Build game MVP
3. [ ] Add high score tracking
4. [ ] Add social links
5. [ ] Polish & launch
