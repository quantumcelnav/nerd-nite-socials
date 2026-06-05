# Nerdometer — Product Plan

**Tagline:** How nerdy are you, really?

**Owner:** Justin Fritz, Nerd Nite Fort Collins Boss

---

## Product Vision

Nerdometer is a trivia game tied directly to Nerd Nite Fort Collins events. Each iteration is scoped to a specific event: Justin provides the speaker names and talk topics, and the game generates targeted trivia around those talks — interspersed with the Nerd Nite origin story, narrated by Justin himself.

The game is a community engagement tool and a celebration of the talks. Players prove their nerd credentials, climb the leaderboard, and learn more about the people and ideas on stage.

---

## Iteration Model

Each Nerd Nite event spawns a new edition of Nerdometer:

1. Justin provides talk titles, speaker names, and topic summaries
2. Trivia questions are authored around those talks
3. Origin story segments are woven between rounds
4. Players play, score, and hit the leaderboard
5. After the event, the edition is archived; the next edition begins

---

## Game Structure

### Rounds
- Each round corresponds to one talk from the event
- Players answer trivia questions about that talk's topic
- Between rounds: a segment of the Nerd Nite origin story, narrated by Justin

### Scoring
- Points per correct answer (speed bonus TBD)
- Running score shown throughout
- Final score submitted to global leaderboard at the end

### Origin Story Segments
- Short narrative cards presented between rounds
- Justin is the narrator/presenter — first-person voice
- Tells the story of how Nerd Nite Fort Collins came to be
- Goal: players finish the game knowing what Nerd Nite is and why it matters

---

## Stack

- **Frontend:** Vite + React (mobile-first)
- **Hosting:** Vercel
- **Leaderboard:** Supabase (global, persistent, per-edition)
- **Content:** JSON-driven per edition (talk info, questions, origin story segments)

---

## Design / Style

- **Product name:** Nerdometer (used in-app branding, not "Nerd Nite Socials")
- **Colors:** Dark navy/teal `#1a2f3a`, cyan `#00b8d9`, burnt orange `#e05c1a`, off-white `#f5f5f0`
- **Font:** Courier New throughout — bold headers, italic for narrative/Justin's voice
- **Layout:** Mobile-first, bold stacked color blocks, touch-friendly (min 48px targets)
- **Desktop:** Two-column grid panels at 768px+

---

## Content Schema (per edition)

```json
{
  "edition": "June 2026",
  "talks": [
    {
      "id": 1,
      "title": "Talk Title",
      "speaker": "Speaker Name",
      "summary": "Brief topic description",
      "questions": [
        {
          "question": "Question text?",
          "options": ["A", "B", "C", "D"],
          "answer": 0
        }
      ]
    }
  ],
  "originStory": [
    {
      "after_talk": 0,
      "text": "Justin's narration segment..."
    }
  ]
}
```

---

## Pages / Views

1. **Home** — Nerdometer branding, current edition, Play button, leaderboard preview
2. **Game** — Question flow with round indicators, origin story cards between rounds
3. **Score Submit** — Enter name/handle after game ends
4. **Leaderboard** — Full top scores for current edition
5. **Archive** — Past editions (future)

---

## Milestones

1. [x] Scaffold Vite + React, deploy to Vercel
2. [ ] Rebrand app to Nerdometer
3. [ ] Build game flow (question → answer → score → next)
4. [ ] Origin story cards between rounds
5. [ ] Score submission + Supabase leaderboard
6. [ ] First real edition with Justin's content
7. [ ] Social links
8. [ ] Archive / past editions

---

## Open Questions

- How many questions per talk? (3–5 is typical for trivia games)
- Speed bonus for fast answers, or pure accuracy?
- Origin story: how many segments, how long?
- Social platforms to link (Instagram, Facebook, Meetup?)
- Any audio/sound effects?
