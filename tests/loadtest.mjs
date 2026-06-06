#!/usr/bin/env node
/**
 * Nerdometer load test — simulates concurrent players submitting scores.
 *
 * All test scores are inserted with hidden=true so they:
 *   • Don't appear on the live leaderboard
 *   • Are deletable via --cleanup (uses the delete_hidden_scores RLS policy)
 *
 * Usage:
 *   node tests/loadtest.mjs                           # 300 players, concurrency 50
 *   node tests/loadtest.mjs --players 1000 --concurrency 100
 *   node tests/loadtest.mjs --edition S2025E06        # target a specific show
 *   node tests/loadtest.mjs --cleanup                 # delete all LoadBot_* test scores
 *
 * Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from .env.local
 * (or environment variables).
 */

import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── constants ───────────────────────────────────────────────────────────────

const VERCEL_BASE = 'https://nerd-nite-socials.vercel.app'
const TEST_PREFIX  = 'LoadBot'

const POINTS   = { 1: 100, 2: 300, 3: 900 }
// Realistic answer-correct probabilities per difficulty tier
const HIT_RATE = { 1: 0.62, 2: 0.45, 3: 0.25 }

const HANDLE_POOL = [
  'NerdBot', 'DeepCut', 'QuizOwl', 'ByteBrain', 'DataDancer',
  'QuantumNerd', 'ScienceOwl', 'NeuronFire', 'WaveForm', 'CuriousMuggle',
  'BrainWave', 'NerdLord', 'FactHammer', 'ThinkTank', 'ProtonPunch',
  'CurveBall', 'FermiBoy', 'LabRat', 'GravWave', 'DarkMatter',
]

// ── env ─────────────────────────────────────────────────────────────────────

function loadEnv() {
  const envFile = join(__dirname, '..', '.env.local')
  const raw = {}
  if (existsSync(envFile)) {
    for (const line of readFileSync(envFile, 'utf8').split('\n')) {
      const eq = line.indexOf('=')
      if (eq > 0) raw[line.slice(0, eq).trim()] = line.slice(eq + 1).trim()
    }
  }
  return {
    url: raw.VITE_SUPABASE_URL  ?? process.env.VITE_SUPABASE_URL  ?? '',
    key: raw.VITE_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? '',
  }
}

// ── args ─────────────────────────────────────────────────────────────────────

function parseArgs() {
  const argv = process.argv.slice(2)
  const opts = { players: 300, concurrency: 50, edition: null, cleanup: false }
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--players')     opts.players     = parseInt(argv[++i], 10)
    if (argv[i] === '--concurrency') opts.concurrency = parseInt(argv[++i], 10)
    if (argv[i] === '--edition')     opts.edition     = argv[++i]
    if (argv[i] === '--cleanup')     opts.cleanup     = true
  }
  return opts
}

// ── semaphore ────────────────────────────────────────────────────────────────

function makeSemaphore(limit) {
  let active = 0
  const queue = []

  function next() {
    if (queue.length && active < limit) {
      active++
      queue.shift()()
    }
  }

  return async function run(fn) {
    if (active < limit) {
      active++
    } else {
      await new Promise(resolve => queue.push(resolve))
    }
    try {
      return await fn()
    } finally {
      active--
      next()
    }
  }
}

// ── simulation ───────────────────────────────────────────────────────────────

function simulatePlay(talks) {
  let score = 0
  let maxScore = 0
  for (const talk of talks) {
    for (const q of talk.questions) {
      maxScore += POINTS[q.difficulty]
      if (Math.random() < HIT_RATE[q.difficulty]) score += POINTS[q.difficulty]
    }
  }
  return { score, maxScore }
}

// ── network ──────────────────────────────────────────────────────────────────

async function fetchEditionData(slug) {
  const url = slug
    ? `${VERCEL_BASE}/editions/${slug}.json`
    : `${VERCEL_BASE}/editions/index.json`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`GET ${url} → HTTP ${res.status}`)
  const data = await res.json()

  if (!slug) {
    // index.json — recurse with first (current) edition
    return fetchEditionData(data[0].slug)
  }
  return data
}

async function submitScore(sbUrl, sbKey, payload) {
  const t0 = performance.now()
  try {
    const res = await fetch(`${sbUrl}/rest/v1/scores`, {
      method: 'POST',
      headers: {
        apikey: sbKey,
        Authorization: `Bearer ${sbKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
    })
    const ms = performance.now() - t0
    if (res.status === 200 || res.status === 201) return { ok: true, ms }
    const body = await res.text()
    return { ok: false, ms, error: `HTTP ${res.status}: ${body.slice(0, 120)}` }
  } catch (e) {
    return { ok: false, ms: performance.now() - t0, error: e.message }
  }
}

async function deleteTestScores(sbUrl, sbKey) {
  const url = new URL(`${sbUrl}/rest/v1/scores`)
  url.searchParams.set('hidden', 'eq.true')
  // Supabase LIKE filter — searchParams encodes % → %25, Supabase decodes back
  url.searchParams.set('name', `like.${TEST_PREFIX}_%`)

  const res = await fetch(url.toString(), {
    method: 'DELETE',
    headers: {
      apikey: sbKey,
      Authorization: `Bearer ${sbKey}`,
      'Content-Type': 'application/json',
    },
  })
  if (res.status === 200 || res.status === 204) {
    console.log(`Cleanup complete — all ${TEST_PREFIX}_* hidden scores deleted.`)
  } else {
    const body = await res.text()
    console.error(`Cleanup failed: HTTP ${res.status}: ${body}`)
  }
}

// ── report ───────────────────────────────────────────────────────────────────

function printReport(results, opts, elapsedMs) {
  const ok   = results.filter(r => r.ok)
  const fail = results.filter(r => !r.ok)
  const ms   = ok.map(r => r.ms).sort((a, b) => a - b)
  const p    = (frac) => ms[Math.min(Math.floor(frac * ms.length), ms.length - 1)] ?? 0

  const line = '═'.repeat(56)
  console.log(`\n${line}`)
  console.log('  NERDOMETER LOAD TEST RESULTS')
  console.log(line)
  console.log(`  Edition:      ${opts.edition}`)
  console.log(`  Players:      ${opts.players}`)
  console.log(`  Concurrency:  ${opts.concurrency}`)
  console.log(`  Elapsed:      ${(elapsedMs / 1000).toFixed(1)}s`)
  console.log(`  Throughput:   ${(results.length / elapsedMs * 1000).toFixed(1)} req/s`)
  console.log(`  Success:      ${ok.length}/${opts.players}  (${Math.round(100 * ok.length / opts.players)}%)`)

  if (ms.length) {
    console.log('\n  Supabase insert latency:')
    console.log(`    p50   ${p(0.50).toFixed(0)} ms`)
    console.log(`    p95   ${p(0.95).toFixed(0)} ms`)
    console.log(`    p99   ${p(0.99).toFixed(0)} ms`)
    console.log(`    max   ${ms[ms.length - 1].toFixed(0)} ms`)
  }

  if (fail.length) {
    const errMap = {}
    for (const r of fail) {
      const k = (r.error ?? 'unknown').slice(0, 60)
      errMap[k] = (errMap[k] ?? 0) + 1
    }
    console.log(`\n  Errors (${fail.length} total):`)
    for (const [msg, n] of Object.entries(errMap).sort((a, b) => b[1] - a[1]).slice(0, 5)) {
      console.log(`    ${n}×  ${msg}`)
    }
  }

  console.log(`\n  Cleanup: node tests/loadtest.mjs --cleanup`)
  console.log(`${line}\n`)
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs()
  const { url: sbUrl, key: sbKey } = loadEnv()

  if (!sbUrl || !sbKey) {
    console.error('ERROR: Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — check .env.local')
    process.exit(1)
  }

  if (opts.cleanup) {
    await deleteTestScores(sbUrl, sbKey)
    return
  }

  console.log('\nFetching edition data from production…')
  const editionData = await fetchEditionData(opts.edition)
  opts.edition = editionData.edition

  const maxScore = editionData.talks.reduce(
    (sum, t) => sum + t.questions.reduce((s, q) => s + POINTS[q.difficulty], 0), 0
  )
  console.log(`  Edition: ${opts.edition}  ·  ${editionData.talks.length} talks  ·  max ${maxScore} pts`)
  console.log(`\nSimulating ${opts.players} players (concurrency: ${opts.concurrency})…\n`)

  const sem     = makeSemaphore(opts.concurrency)
  const results = []
  const t0      = performance.now()

  const tasks = Array.from({ length: opts.players }, (_, i) => {
    const id     = i + 1
    const handle = HANDLE_POOL[id % HANDLE_POOL.length]
    const name   = `${TEST_PREFIX}_${handle}_${String(id).padStart(4, '0')}`
    const mode   = Math.random() < 0.82 ? 'trivia' : 'ontology'
    const { score, maxScore: mx } = simulatePlay(editionData.talks)

    return sem(async () => {
      const result = await submitScore(sbUrl, sbKey, {
        edition:   opts.edition,
        name,
        score,
        max_score: mx,
        mode,
        hidden:    true,
      })
      results.push(result)
      const done    = results.length
      const elapsed = (performance.now() - t0) / 1000
      const rate    = elapsed > 0 ? (done / elapsed).toFixed(1) : '—'
      process.stdout.write(`  ${done}/${opts.players}  ${rate} req/s\r`)
    })
  })

  await Promise.all(tasks)
  const elapsedMs = performance.now() - t0

  printReport(results, opts, elapsedMs)
}

main().catch(err => {
  console.error(err.message ?? err)
  process.exit(1)
})
