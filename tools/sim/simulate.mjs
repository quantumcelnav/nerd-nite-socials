#!/usr/bin/env node
/**
 * simulate.mjs — synthesise audience plays of a Nerdometer edition.
 *
 * Why this exists: the format puts the audience in two states inside one
 * sitting, informed about the talk they just heard and uninformed about the one
 * still to come. The whole design is that comparison. Until enough real shows
 * have run under per-round scoring there is no data to develop the analysis
 * against, and writing an analysis with no data to test it on is how you ship
 * one that cannot tell signal from noise.
 *
 * So: generate plays from a player model with a KNOWN ground-truth effect,
 * then check the analysis recovers it. Run it again with the effect set to zero
 * and check the analysis reports nothing. An analysis that cannot fail the
 * second test is not measuring anything.
 *
 *   node simulate.mjs --edition ../../public/editions/S2026E09.json \
 *                     --players 60 --seed 1 --effect 0.28 --out plays.json
 *
 *   --effect 0   null run: hearing the talk confers no advantage
 */
import fs from 'node:fs'
import path from 'node:path'

const POINTS = { 1: 100, 2: 300, 3: 900 }
const TIEBREAKER_MAX = 100
const GUESS_FLOOR = 0.25            // four options

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 ? process.argv[i + 1] : def
}

/** mulberry32 — small, seeded, reproducible. A paper needs reruns to match. */
function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6D2B79F5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const gauss = (r, mu, sd) => {
  const u = Math.max(r(), 1e-9), v = r()
  return mu + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x))

/**
 * Base probability of a correct answer by difficulty, for a median player who
 * has NOT heard the talk. Anchored on the authoring rubric in PLANNING.md:
 * Accessible is "anyone in the room", Nerdy is "a curious attentive audience
 * member", Deep Cut is "only a real subject-matter nerd".
 */
const BASE = { 1: 0.82, 2: 0.50, 3: 0.22 }

/**
 * How much hearing the talk helps, by difficulty. Deliberately NOT uniform:
 * an Accessible question is answerable without the talk, so hearing it adds
 * little. A Deep Cut is where the talk supplies the answer. If this were flat
 * the analysis could not distinguish "the talk landed" from "the round was
 * easy", which is exactly the confound the per-question data exists to break.
 */
const HEARD_SHAPE = { 1: 0.25, 2: 1.0, 3: 1.15 }

function makePlayer(r, subjects) {
  const prior = {}
  for (const s of subjects) {
    // most people are not domain nerds; a minority are, strongly
    prior[s] = r() < 0.18 ? clamp(gauss(r, 0.30, 0.10), 0, 0.55) : clamp(gauss(r, 0.02, 0.04), 0, 0.2)
  }
  return {
    engagement: clamp(gauss(r, 0, 0.11), -0.35, 0.35),  // attention / general knowledge
    prior,
    attrition: r(),                                     // do they finish the game
  }
}

function pCorrect(player, q, { heard, subject, effect }) {
  let p = BASE[q.difficulty] + player.engagement + (player.prior[subject] || 0)
  if (heard) p += effect * HEARD_SHAPE[q.difficulty]
  return clamp(p, GUESS_FLOOR, 0.98)
}

function main() {
  const editionPath = arg('edition', '../../public/editions/S2026E09.json')
  const nPlayers = parseInt(arg('players', '60'), 10)
  const seed = parseInt(arg('seed', '1'), 10)
  const effect = parseFloat(arg('effect', '0.28'))
  const heardRound = parseInt(arg('heard-round', '2'), 10)   // 1-indexed
  const outPath = arg('out', 'plays.json')

  const ed = JSON.parse(fs.readFileSync(path.resolve(editionPath), 'utf8'))
  const subjects = ed.talks.map(t => t.title)
  const r = rng(seed)
  const rows = []

  for (let i = 0; i < nPlayers; i++) {
    const player = makePlayer(r, subjects)
    // ~8% of a bar audience starts and does not finish; drop them, as a real
    // leaderboard would never see the row
    if (player.attrition < 0.08) continue

    const rounds = ed.talks.map((talk, idx) => {
      const roundNo = idx + 1
      const isHouse = roundNo === 1
      const heard = !isHouse && roundNo === heardRound
      const subject = talk.title
      const questions = talk.questions.map(q => ({
        difficulty: q.difficulty,
        correct: r() < pCorrect(player, q, { heard, subject, effect }),
      }))
      return {
        round: roundNo,
        subject,
        speaker: talk.speaker,
        condition: isHouse ? 'house' : heard ? 'heard' : 'unheard',
        score: questions.reduce((s, q) => s + (q.correct ? POINTS[q.difficulty] : 0), 0),
        max: talk.questions.reduce((s, q) => s + POINTS[q.difficulty], 0),
        questions,
      }
    })

    const trivia = rounds.reduce((s, x) => s + x.score, 0)
    const maxTrivia = rounds.reduce((s, x) => s + x.max, 0)
    const bonus = Math.round(clamp(gauss(r, 0.45 + player.engagement, 0.30), 0, 1) * TIEBREAKER_MAX)

    rows.push({
      edition: ed.edition,
      name: `sim${String(i).padStart(3, '0')}`,
      score: trivia + bonus,
      max_score: maxTrivia + TIEBREAKER_MAX,
      mode: 'trivia',
      nonce: `sim-${seed}`,
      round_scores: { rounds, tiebreaker: { score: bonus, max: TIEBREAKER_MAX } },
    })
  }

  const meta = {
    generated: new Date().toISOString(),
    edition: ed.edition,
    seed, players_requested: nPlayers, players_finished: rows.length,
    ground_truth: { effect, heard_round: heardRound, heard_shape: HEARD_SHAPE, base: BASE },
    note: 'SYNTHETIC. Generated by tools/sim/simulate.mjs. Not audience data.',
  }
  fs.writeFileSync(outPath, JSON.stringify({ meta, rows }, null, 2))
  console.log(`${outPath}: ${rows.length}/${nPlayers} finished, edition ${ed.edition}, ` +
              `seed ${seed}, ground-truth effect ${effect}`)
}

main()
