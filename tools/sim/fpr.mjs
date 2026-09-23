#!/usr/bin/env node
/** fpr.mjs — how often does the analysis call a null run significant?
 *  Runs the simulator with effect=0 across many seeds and counts p<0.05.
 *  If this is near 5% the test is calibrated. If it is higher, the analysis
 *  is over-calling and a single show is not evidence.
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
const N = parseInt(process.argv[2] || '200', 10)
const players = process.argv[3] || '110'
const effect = process.argv[4] || '0'
let sigMean = 0, sigShape = 0, means = []
for (let s = 1000; s < 1000 + N; s++) {
  execSync(`node simulate.mjs --edition ../../public/editions/S2026E09.json ` +
           `--players ${players} --seed ${s} --effect ${effect} --out /tmp/_fpr.json`, { stdio: 'ignore' })
  const out = execSync(`node analyze.mjs /tmp/_fpr.json`).toString()
  const m = out.match(/mean=(-?[\d.]+)pp.*?p=([\d.e+-]+)/s)
  const ds = [...out.matchAll(/d(\d)\s+mean=\s*(-?[\d.]+)pp/g)].map(x => parseFloat(x[2]))
  if (m) { means.push(parseFloat(m[1])); if (parseFloat(m[2]) < 0.05) sigMean++ }
  // shape prediction: advantage strictly increases with difficulty
  if (ds.length === 3 && ds[0] < ds[1] && ds[1] < ds[2]) sigShape++
}
const mu = means.reduce((a,b)=>a+b,0)/means.length
console.log(`${N} runs, ${players} players, effect ${effect}`)
console.log(`  mean difference across runs: ${mu.toFixed(2)}pp (should sit near 0)`)
console.log(`  detected (p<0.05)                     : ${sigMean}/${N} = ${(100*sigMean/N).toFixed(1)}%`)
console.log(`  matched the SHAPE prediction d1<d2<d3:   ${sigShape}/${N} = ${(100*sigShape/N).toFixed(1)}%`)
