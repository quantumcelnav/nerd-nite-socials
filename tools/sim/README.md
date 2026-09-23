# tools/sim — simulated plays, and the analysis they exist to validate

The format puts the audience in two states inside one sitting: informed about
the talk they just heard, uninformed about the one still to come. That
comparison is the whole design. Until shows have run under per-round scoring
there is no data to develop the analysis against, and an analysis developed
against nothing is one that cannot tell signal from noise.

So the simulator generates plays with a **known** ground-truth effect, and the
analysis has to pass in both directions: recover the effect when it is there,
find nothing when it is not.

## Use

```bash
# a show where hearing the talk helps
node simulate.mjs --edition ../../public/editions/S2026E09.json \
                  --players 110 --seed 11 --effect 0.28 --out runs/signal.json

# the same show where it does not
node simulate.mjs --edition ../../public/editions/S2026E09.json \
                  --players 110 --seed 12 --effect 0 --out runs/null.json

node analyze.mjs runs/signal.json
node analyze.mjs runs/null.json

# against real shows, once 001_round_scores.sql is applied
VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... \
  node analyze.mjs --supabase --edition S2026E09
```

`fpr.mjs N PLAYERS EFFECT` repeats a condition many times. With effect 0 it
measures the false-positive rate; with an effect it measures power.

## What it established

| | |
|---|---|
| False-positive rate, 200 null runs | 2.0% against a nominal 5% — calibrated, slightly conservative |
| Shape prediction by chance | 11.0% — corroborating, not a filter on its own |
| Power at 50 players, effect 0.28 | 96.7% |
| Power at 50 players, effect 0.10 | 16.0% |

The operational consequence is in `paper/abstract-predictability.md`: one show
can detect a large effect and cannot rule one out.

## The player model, and its assumptions

Base accuracy by difficulty is 0.82 / 0.50 / 0.22, anchored on the authoring
rubric in `PLANNING.md` rather than on measurement. Hearing the talk helps
unevenly on purpose — barely on Accessible, most on Deep Cut — because a flat
boost would make "the talk landed" indistinguishable from "the round was
easier". Players vary in engagement and prior subject knowledge, a minority are
specialists, about 8% do not finish, and the guessing floor is 0.25 for four
options.

**These are assumptions about audiences, not observations of one.** They are
the first thing real data should overturn.

Seeds are fixed, so every figure in the paper reproduces exactly.
