/**
 * Nerdometer Edition Generator
 * Uses local Ollama + Gemma 4:27b to generate a full edition.json from talk info.
 *
 * Prerequisites:
 *   - Ollama running locally: https://ollama.com
 *   - Gemma model pulled: `ollama pull gemma3:27b`
 *
 * Usage:
 *   node scripts/generate-edition.mjs
 *
 * Then edit the EDITION_INPUT below with your actual talk info and run.
 * Output is written to src/data/edition.json (review before deploying).
 */

import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, '../src/data/edition.json')
const OLLAMA_URL = 'http://localhost:11434/api/generate'
const MODEL = 'gemma3:27b'

// ─── EDIT THIS FOR EACH EVENT ────────────────────────────────────────────────
const EDITION_INPUT = {
  edition: 'June 2026',
  date: '2026-06-XX',
  venue: 'TBD, Fort Collins CO',
  talks: [
    {
      title: 'Your Talk Title Here',
      speaker: 'Speaker Name',
      summary: 'A 2-3 sentence description of what the talk covers. The more detail you give, the better the questions will be.',
    },
    {
      title: 'Second Talk Title',
      speaker: 'Second Speaker',
      summary: 'Summary of this talk.',
    },
    {
      title: 'Third Talk Title',
      speaker: 'Third Speaker',
      summary: 'Summary of this talk.',
    },
  ],
  // Origin story segment for this edition (Justin writes these manually)
  originStory: [
    { text: 'Justin\'s intro segment before Round 1...' },
    { text: 'Segment before Round 2...' },
    { text: 'Segment before Round 3...' },
    { text: 'Outro after all talks — the closing message.' },
  ],
}
// ─────────────────────────────────────────────────────────────────────────────

const QUESTION_PROMPT = (talk) => `
You are writing trivia questions for Nerdometer, a game played at Nerd Nite Fort Collins events.
Nerd Nite is a monthly bar event where smart people give 20-minute talks on topics they love.

Write exactly 3 trivia questions about the following talk. Follow the difficulty rules precisely.

TALK: "${talk.title}" by ${talk.speaker}
SUMMARY: ${talk.summary}

DIFFICULTY RULES:
- Question 1 (Accessible, 100 points): Anyone with general knowledge could get this. No expertise needed.
- Question 2 (Nerdy, 300 points): Requires genuine interest in the topic. A curious person who read about it could get this.
- Question 3 (Deep Cut, 900 points): Only someone who really knows this field deeply, or who paid very close attention to this specific talk, would get this right.

ALSO for each question, write a one-sentence "funFact" that reveals something surprising or delightful about the correct answer. This appears after the player answers.

Respond ONLY with valid JSON in this exact format — no markdown, no explanation:
{
  "questions": [
    {
      "difficulty": 1,
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 0,
      "funFact": "One fascinating sentence about the correct answer."
    },
    {
      "difficulty": 2,
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 2,
      "funFact": "One fascinating sentence about the correct answer."
    },
    {
      "difficulty": 3,
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 1,
      "funFact": "One fascinating sentence about the correct answer."
    }
  ]
}

Rules for options:
- All 4 options must be plausible — no obviously wrong answers
- The correct answer index (0-3) should vary across questions
- Keep options similar in length and format to each other
`

async function callOllama(prompt) {
  const res = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, prompt, stream: false }),
  })
  if (!res.ok) throw new Error(`Ollama error: ${res.status} ${res.statusText}`)
  const data = await res.json()
  return data.response
}

function extractJSON(text) {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON found in response')
  return JSON.parse(match[0])
}

async function generateTalk(talk, idx) {
  console.log(`\n⚡ Generating questions for talk ${idx + 1}: "${talk.title}"...`)
  const raw = await callOllama(QUESTION_PROMPT(talk))
  const parsed = extractJSON(raw)

  if (!parsed.questions || parsed.questions.length !== 3) {
    throw new Error(`Expected 3 questions for "${talk.title}", got ${parsed.questions?.length}`)
  }

  return {
    id: idx + 1,
    title: talk.title,
    speaker: talk.speaker,
    questions: parsed.questions,
  }
}

async function main() {
  console.log('🧠 Nerdometer Edition Generator')
  console.log(`📡 Model: ${MODEL} via Ollama at ${OLLAMA_URL}`)
  console.log(`📋 Edition: ${EDITION_INPUT.edition} — ${EDITION_INPUT.talks.length} talks\n`)

  // Verify Ollama is running
  try {
    await fetch('http://localhost:11434/api/tags')
  } catch {
    console.error('❌ Ollama is not running. Start it with: ollama serve')
    process.exit(1)
  }

  const talks = []
  for (let i = 0; i < EDITION_INPUT.talks.length; i++) {
    const talk = await generateTalk(EDITION_INPUT.talks[i], i)
    talks.push(talk)
    console.log(`✓ "${talk.title}" — ${talk.questions.length} questions generated`)
  }

  const output = {
    edition: EDITION_INPUT.edition,
    date: EDITION_INPUT.date,
    venue: EDITION_INPUT.venue,
    talks,
    originStory: EDITION_INPUT.originStory,
  }

  writeFileSync(OUT_PATH, JSON.stringify(output, null, 2))
  console.log(`\n✅ Written to ${OUT_PATH}`)
  console.log('\n📝 Next steps:')
  console.log('  1. Review the generated questions for accuracy')
  console.log('  2. Share with speakers for approval')
  console.log('  3. Edit funFacts for voice/tone')
  console.log('  4. Run: npm run dev — to test')
  console.log('  5. Commit and deploy\n')
}

main().catch(err => {
  console.error('❌ Generation failed:', err.message)
  process.exit(1)
})
