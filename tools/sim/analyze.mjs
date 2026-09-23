#!/usr/bin/env node
/**
 * analyze.mjs — does hearing the talk change performance on questions written
 * from its abstract before it was delivered?
 *
 * Design note. Every player answers the heard round AND the unheard round, so
 * the data are PAIRED. Each player is their own control, which removes
 * between-player variance in general knowledge and attention -- by far the
 * largest nuisance term in a bar. An unpaired comparison here would be weaker
 * and wrong.
 *
 * Two tests are run deliberately. The paired t gives an effect size and an
 * interval; the sign-flip permutation test assumes nothing about the
 * distribution. If they disagree, trust the permutation and say so.
 *
 * The house round is the control condition. It is about Nerd Nite itself, so
 * hearing either talk cannot help. If the house round moves between groups,
 * something other than the talks is driving the result.
 *
 *   node analyze.mjs plays.json
 *   node analyze.mjs --supabase --edition S2026E09      (reads live scores)
 */
import fs from 'node:fs'

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i+1] : d }

// ---------------------------------------------------------------- statistics
const mean = a => a.reduce((s, x) => s + x, 0) / a.length
const sd = a => { const m = mean(a); return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)) }

/** Regularised incomplete beta, continued fraction. Needed for an exact t p-value. */
function betacf(a, b, x) {
  const FPMIN = 1e-30, EPS = 3e-12
  let qab = a+b, qap = a+1, qam = a-1, c = 1, d = 1 - qab*x/qap
  if (Math.abs(d) < FPMIN) d = FPMIN
  d = 1/d; let h = d
  for (let m = 1; m <= 300; m++) {
    const m2 = 2*m
    let aa = m*(b-m)*x/((qam+m2)*(a+m2))
    d = 1 + aa*d; if (Math.abs(d) < FPMIN) d = FPMIN
    c = 1 + aa/c; if (Math.abs(c) < FPMIN) c = FPMIN
    d = 1/d; h *= d*c
    aa = -(a+m)*(qab+m)*x/((a+m2)*(qap+m2))
    d = 1 + aa*d; if (Math.abs(d) < FPMIN) d = FPMIN
    c = 1 + aa/c; if (Math.abs(c) < FPMIN) c = FPMIN
    d = 1/d; const del = d*c; h *= del
    if (Math.abs(del-1) < EPS) break
  }
  return h
}
const lgamma = z => { // Lanczos
  const g = [676.5203681218851,-1259.1392167224028,771.32342877765313,
             -176.61502916214059,12.507343278686905,-0.13857109526572012,
             9.9843695780195716e-6,1.5056327351493116e-7]
  if (z < 0.5) return Math.log(Math.PI/Math.sin(Math.PI*z)) - lgamma(1-z)
  z -= 1; let x = 0.99999999999980993
  for (let i = 0; i < g.length; i++) x += g[i]/(z+i+1)
  const t = z + g.length - 0.5
  return 0.5*Math.log(2*Math.PI) + (z+0.5)*Math.log(t) - t + Math.log(x)
}
function ibeta(a, b, x) {
  if (x <= 0) return 0
  if (x >= 1) return 1
  const bt = Math.exp(lgamma(a+b) - lgamma(a) - lgamma(b) + a*Math.log(x) + b*Math.log(1-x))
  return x < (a+1)/(a+b+2) ? bt*betacf(a,b,x)/a : 1 - bt*betacf(b,a,1-x)/b
}
/** two-tailed p for Student's t */
const tp = (t, df) => ibeta(df/2, 0.5, df/(df + t*t))

function pairedT(diffs) {
  const n = diffs.length, m = mean(diffs), s = sd(diffs)
  const se = s/Math.sqrt(n), t = m/se, df = n-1
  return { n, mean: m, sd: s, se, t, df, p: tp(t, df),
           ci: [m - 1.96*se, m + 1.96*se], d: m/s }
}
/** sign-flip permutation: assumption-free null for paired data */
function permTest(diffs, iters = 20000, seed = 7) {
  let a = seed >>> 0
  const rnd = () => { a = (a + 0x6D2B79F5)>>>0; let t = Math.imul(a ^ (a>>>15), 1|a)
    t = (t + Math.imul(t ^ (t>>>7), 61|t)) ^ t; return ((t ^ (t>>>14))>>>0)/4294967296 }
  const obs = Math.abs(mean(diffs))
  let hits = 0
  for (let i = 0; i < iters; i++) {
    const m = mean(diffs.map(d => rnd() < 0.5 ? -d : d))
    if (Math.abs(m) >= obs) hits++
  }
  return { iters, p: (hits + 1) / (iters + 1) }
}

// ---------------------------------------------------------------------- data
async function load() {
  if (process.argv.includes('--supabase')) {
    const url = process.env.VITE_SUPABASE_URL, key = process.env.VITE_SUPABASE_ANON_KEY
    if (!url || !key) throw new Error('set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
    const ed = arg('edition', 'S2026E09')
    const r = await fetch(`${url}/rest/v1/scores?select=*&edition=eq.${ed}&round_scores=not.is.null`,
                          { headers: { apikey: key, Authorization: `Bearer ${key}` } })
    const rows = await r.json()
    return { meta: { source: 'supabase', edition: ed }, rows }
  }
  const f = process.argv.find(a => a.endsWith('.json')) || 'plays.json'
  return JSON.parse(fs.readFileSync(f, 'utf8'))
}

const acc = qs => qs.length ? qs.filter(q => q.correct).length / qs.length : null
const byDiff = (qs, d) => qs.filter(q => q.difficulty === d)

async function main() {
  const { meta, rows } = await load()
  const usable = rows.filter(r => r.round_scores?.rounds?.length)
  console.log(`\n=== Nerdometer round analysis ===`)
  console.log(`source      ${meta.source || 'file'}   edition ${meta.edition}`)
  if (meta.ground_truth) console.log(`GROUND TRUTH effect ${meta.ground_truth.effect} on round ${meta.ground_truth.heard_round} (synthetic)`)
  console.log(`players     ${usable.length} with per-round detail (of ${rows.length})\n`)
  if (!usable.length) { console.log('No round_scores rows. Has the migration been applied?'); return }

  // condition-level accuracy
  const cond = { house: [], heard: [], unheard: [] }
  const condD = { house: {1:[],2:[],3:[]}, heard: {1:[],2:[],3:[]}, unheard: {1:[],2:[],3:[]} }
  const paired = [], pairedD = {1:[],2:[],3:[]}, houseAcc = []

  for (const r of usable) {
    const rs = r.round_scores.rounds
    const get = c => rs.find(x => x.condition === c)
    const h = get('heard'), u = get('unheard'), ho = get('house')
    for (const [c, rd] of [['house',ho],['heard',h],['unheard',u]]) {
      if (!rd) continue
      cond[c].push(acc(rd.questions))
      for (const d of [1,2,3]) { const a = acc(byDiff(rd.questions,d)); if (a !== null) condD[c][d].push(a) }
    }
    if (h && u) {
      paired.push(acc(h.questions) - acc(u.questions))
      for (const d of [1,2,3]) {
        const ah = acc(byDiff(h.questions,d)), au = acc(byDiff(u.questions,d))
        if (ah !== null && au !== null) pairedD[d].push(ah - au)
      }
    }
    if (ho) houseAcc.push(acc(ho.questions))
  }

  console.log('Accuracy by condition')
  const col = (x, w) => String(x).padStart(w)
  console.log('condition '.padEnd(10) + col('overall',8) + col('d1',8) + col('d2',8) + col('d3',8))
  for (const c of ['house','heard','unheard']) {
    if (!cond[c].length) continue
    const f = x => x.length ? (mean(x)*100).toFixed(1)+'%' : '-'
    console.log(c.padEnd(10) + col(f(cond[c]),8) + col(f(condD[c][1]),8) +
                col(f(condD[c][2]),8) + col(f(condD[c][3]),8))
  }

  console.log('\nPaired within-player: heard minus unheard')
  const t = pairedT(paired), pm = permTest(paired)
  console.log(`  n=${t.n}  mean=${(t.mean*100).toFixed(1)}pp  95% CI [${(t.ci[0]*100).toFixed(1)}, ${(t.ci[1]*100).toFixed(1)}]pp`)
  console.log(`  t(${t.df})=${t.t.toFixed(3)}  p=${t.p.toExponential(2)}  Cohen's d=${t.d.toFixed(2)}`)
  console.log(`  permutation (${pm.iters} sign flips) p=${pm.p.toExponential(2)}`)

  console.log('\n  by difficulty (the shape prediction: advantage grows with difficulty)')
  for (const d of [1,2,3]) {
    if (!pairedD[d].length) continue
    const s = pairedT(pairedD[d])
    console.log(`    d${d}  mean=${(s.mean*100).toFixed(1).padStart(5)}pp  CI [${(s.ci[0]*100).toFixed(1)}, ${(s.ci[1]*100).toFixed(1)}]  p=${s.p.toExponential(2)}`)
  }

  console.log(`\n  control: house round accuracy ${(mean(houseAcc)*100).toFixed(1)}% ` +
              `(sd ${(sd(houseAcc)*100).toFixed(1)}pp) — should not track the talks\n`)
}
main()
