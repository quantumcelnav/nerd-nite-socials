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

1. [x] Scaffold Vite + React, push to GitHub
2. [x] Rebrand to Nerdometer, Courier New style system
3. [x] Game flow: origin cards → trivia rounds → score submit → leaderboard
4. [x] Reaction GIFs on correct/wrong answer
5. [x] Logarithmic scoring: Accessible (100) / Nerdy (300) / Deep Cut (900)
6. [x] Nerdometer % tier system: Curious Muggle → Nerd Nite Boss
7. [ ] Refactor Game.jsx to useReducer (before adding real content)
8. [ ] Deploy to Vercel
9. [ ] Supabase leaderboard (replace mock scores)
10. [ ] Real episode editions — past shows playtested with speaker review
11. [ ] Edition switcher on home screen
12. [ ] Justin host presence on origin cards
13. [ ] Real social links
14. [ ] Hero image (Nerd Nite mascot / branded art)

---

## Test Plan

### Manual Playtest Checklist (run before every commit)
- [ ] Home screen loads, all three sections visible
- [ ] "Play Now" starts the game at the origin story card
- [ ] Origin story cards advance correctly between all rounds
- [ ] All 9 questions display (3 per talk, 3 talks)
- [ ] Correct answer: green highlight, reaction GIF, correct point value awarded
- [ ] Wrong answer: red highlight, reaction GIF, score unchanged
- [ ] Difficulty badge shown per question (Accessible / Nerdy / Deep Cut)
- [ ] Progress bar advances across all questions
- [ ] Score accumulates correctly across rounds
- [ ] Outro origin card appears after final question
- [ ] Score submit screen shows correct %, tier name, and fill bar
- [ ] Leaderboard screen loads and "Back to Home" works
- [ ] Full replay from home works without refresh

### Scoring Verification
| Scenario | Expected % | Expected Tier |
|---|---|---|
| All correct | 100% | Nerd Nite Boss |
| All Deep Cuts correct, rest wrong | ~69% | Certified Nerd |
| Only Accessibles correct | ~23% | Apprentice Nerd |
| All wrong | 0% | Curious Muggle |

### Speaker Review Process (per edition)
1. Justin drafts talk summaries and sends to Claude
2. Claude writes 3 questions per talk (Accessible / Nerdy / Deep Cut)
3. Justin plays through the edition
4. Questions shared with speaker for accuracy review
5. Speaker approves or requests edits
6. Edition locked and deployed

### Edge Cases to Watch
- Fast tapping: answer buttons disabled after first selection ✓
- GIF load failure: img gracefully shows nothing (no crash)
- Empty name on score submit: button disabled ✓
- Game state after replay: all state resets cleanly (needs verification)

---

## Open Questions

- Social platforms to link (Instagram, Facebook, Meetup?)
- Any audio/sound effects?
- Fun facts after each answer (requires content per question from Justin)
