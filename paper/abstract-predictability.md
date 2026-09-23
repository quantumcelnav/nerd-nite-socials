# How Much of a Talk Is Predictable From Its Abstract?

**A live-audience instrument, and a simulation study of whether it can measure anything.**

Justin Fritz, The Canonical Art · Nerd Nite Fort Collins
Draft 2026-09-23

> **ALL RESULTS IN THIS DRAFT ARE SYNTHETIC.** No audience data has been
> collected under per-round scoring yet. Every number below comes from
> `tools/sim/simulate.mjs`, a player model with a known ground-truth effect.
> The purpose of this draft is to establish whether the instrument *could*
> detect the effect it is built to look for, and how large an audience it
> needs. Re-run `tools/sim/analyze.mjs --supabase` against real shows and the
> numbers replace themselves. The design, the method and the limitations are
> real; the findings are not yet.

---

## Abstract

A conference abstract is a lossy compression of a talk. How lossy is an open
question that programme committees, reviewers and science communicators answer
by intuition. We describe a live instrument that measures it directly: trivia
questions written from a talk's abstract *before* delivery, played by an
audience that has heard one talk and not yet heard another, inside a single
sitting. Each player is their own control. A simulation study shows the design
is well calibrated (false-positive rate 2.0% against a nominal 5% across 200
null runs) and adequately powered for a large effect at a single show's
attendance (96.7% power at 50 players for a 0.28 effect), but badly
underpowered for a modest one (16.0% at the same attendance for a 0.10 effect).
The practical consequence is that one show can detect a strong result and
cannot rule one out.

---

## 1. The question

If a talk were fully predictable from its abstract, attending it would add no
information. If it were wholly unpredictable, the abstract would be decoration.
Real talks sit somewhere between, and nobody measures where.

This matters in three places. Programme committees select talks from abstracts.
Reviewers score work they have not seen delivered. Anyone commissioning science
communication is buying a gap between promise and delivery that nobody has
sized.

Framed for The Canonical Art's own thesis, this is the compressibility
criterion from *art-of-art* with an audience attached: a trajectory is
compressible exactly when a validated model of the domain can be built without
possessing the results the trajectory produced. An abstract claims to be such a
model. The audience is the validator.

## 2. The instrument

Nerdometer is a web application played on audience phones during a live Nerd
Nite show. Each edition carries three rounds of three questions, on a
1-2-3 difficulty ladder worth 100, 300 and 900 points.

The design move is the running order:

```
  Talk 1 delivered  ──▶  ALL THREE ROUNDS PLAYED  ──▶  Talk 2 delivered
                              │
              ┌───────────────┼───────────────┐
        Round 1 HOUSE    Round 2 HEARD    Round 3 UNHEARD
     (about Nerd Nite)  (Talk 1's topic)  (Talk 2's topic)
          control         informed          uninformed
```

Every question in rounds 2 and 3 is authored from the speaker's title and
abstract, before either speaker takes the stage, under identical conditions.
The only thing that differs at play time is whether the audience has heard the
talk. Round 1 is about Nerd Nite itself and cannot be helped by either talk, so
it functions as a control for general engagement on the night.

Because every player answers both round 2 and round 3, the data are **paired**.
Each player is their own control, which removes between-player variance in
general knowledge and attention — the dominant nuisance term in a bar.

## 3. Method

**Primary comparison.** Per-player accuracy on the heard round minus accuracy
on the unheard round. Tested with a paired *t*-test for an effect size and
interval, and independently with a sign-flip permutation test (20,000
resamples) which assumes nothing about the distribution. Where they disagree,
the permutation result governs.

**Shape prediction.** The advantage should grow with difficulty. An Accessible
question is answerable without the talk; a Deep Cut is where the talk supplies
the answer. A flat advantage across difficulties would indicate the rounds
simply differed in difficulty rather than that the talk landed. This is why
per-question detail is retained rather than only per-round totals.

**Control.** House-round accuracy should not track the talks.

Data are stored per question in `scores.round_scores`
(`supabase/migrations/001_round_scores.sql`).

## 4. Simulation study

Real shows have not yet run under per-round scoring. Developing an analysis
against no data risks shipping one that cannot distinguish signal from noise,
so the analysis was developed against a player model with a known ground truth
and validated in both directions.

Players vary in engagement and in prior subject knowledge; a minority are
domain specialists. Base accuracy by difficulty is anchored on the authoring
rubric: 0.82, 0.50, 0.22. Roughly 8% of players start and do not finish. A
guessing floor of 0.25 reflects four options.

### 4.1 Recovery of a known effect

Signal run, 111 finishing players, ground-truth effect 0.28 on round 2:

| Condition | Overall | Accessible | Nerdy | Deep Cut |
|---|---|---|---|---|
| House (control) | 59.5% | 84.7% | 58.6% | 35.1% |
| **Heard** | **78.4%** | 92.8% | 85.6% | 56.8% |
| **Unheard** | **60.1%** | 90.1% | 58.6% | 31.5% |

Paired difference **+18.3 percentage points**, 95% CI [12.2, 24.4],
*t*(110) = 5.86, *p* = 5.0 × 10⁻⁸, Cohen's *d* = 0.56. Permutation
*p* = 5.0 × 10⁻⁵. The shape prediction holds: +2.7pp on Accessible (n.s.),
+27.0pp on Nerdy, +25.2pp on Deep Cut. House-round accuracy 59.5%, flat.

### 4.2 Calibration against the null

Two hundred runs with the effect set to zero, 110 players each:

| Measure | Result |
|---|---|
| Mean difference across runs | −0.54pp (unbiased) |
| Called significant at *p*<0.05 | **2.0%** (nominal 5%) |
| Shape prediction matched by chance | 11.0% |

The test is calibrated and slightly conservative. Note the second line: the
shape prediction occurs by chance in one run in nine, so it is corroborating
evidence and not a filter on its own.

### 4.3 Power

Detection rate at *p*<0.05, by attendance and true effect size:

| Players | effect 0.10 | effect 0.18 | effect 0.28 |
|---|---|---|---|
| 30 | — | — | 83.3% |
| 50 | 16.0% | 61.0% | 96.7% |
| 80 | — | — | 99.2% |
| 110 | 28.0% | 90.0% | 100.0% |

## 5. What this means operationally

**A single Nerd Nite show is adequately powered for a large effect and
underpowered for a modest one.** At a typical Fort Collins attendance of
roughly 50 playing, a 0.28 effect is detected 96.7% of the time and a 0.10
effect only 16.0% of the time.

Three consequences:

1. **A null result at one show is not evidence of no effect.** It is evidence
   that the effect, if present, is not large. Say so in that language.
2. **Detecting a modest effect requires pooling.** Roughly 110 players, which
   is two to three Fort Collins shows, for 90% power at 0.18.
3. **Report the interval, never the *p*-value alone.** The interval carries
   the thing a programme committee would actually want.

## 6. Limitations

- **Every number above is synthetic.** The player model encodes assumptions
  about how audiences behave that have not been checked against an audience.
  Its base accuracies come from an authoring rubric, not from measurement.
- **Question difficulty is not calibrated across rounds.** The design assumes a
  Deep Cut on tarot is comparable to a Deep Cut on D&D. It probably is not.
  Pooling across shows averages this out; a single show does not.
- **One author writes all questions.** Author effects and topic familiarity are
  fully confounded with condition at a single show.
- **Order is fixed.** The heard talk is always first. Order effects, fatigue
  and alcohol all load onto the heard round and are not separable without
  alternating the running order between shows, which is worth doing.
- **The unheard round does not measure the abstract.** It measures the abstract
  *plus whatever that player already knew about the subject*. The paired design
  differences out a player's general ability but not their being a D&D
  specialist, and subject expertise is not balanced across rounds by anything.
  This is the largest unaddressed confound in the design.
- **Self-selection.** People who play are not a random sample of attendees,
  and roughly 8% do not finish.
- **The house round controls for engagement, not for topic.** It cannot detect
  a night where one subject simply drew a more expert crowd.

## 7. Next

### 7.1 Finish the human instrument

1. Apply `001_round_scores.sql` and run three shows.
2. **Alternate the running order** so the heard talk is not always first. Order,
   fatigue and alcohol currently load entirely onto the heard round and are not
   separable from it.
3. Re-run `analyze.mjs --supabase`. Every number in §4 is then measured, and
   this draft becomes a paper.

### 7.2 The same instrument, pointed at a lossy channel

The natural extension is not more trivia. It is that this instrument measures
*any* compression of a talk, and we happen to be building another one.

`novel-to-vr` is, underneath, a media translator: it samples a video, has a
model describe each frame including what is on the speaker's slides,
transcribes the audio, and emits a digest that a language model can consume.
That digest is a compression of the talk, exactly as an abstract is.

**The data processing inequality bounds what it can contain.** For the chain
talk, then video, then digest, I(talk; digest) ≤ I(talk; video). Processing cannot
manufacture information about the source. The digest can only lose.

**Unless the narrator injects, at which point the chain is broken.** A model
describing a frame writes from the video *and* from its own parameters. The
digest stops being a function of the video alone, and the inequality stops
bounding it, because the extra content never came through the channel.

The operational consequence is the part worth stating plainly. **Injected
material is information about the world, not information about this talk.** A
narrator that writes "the speaker is showing a standard Kalman filter block
diagram" may be entirely correct about Kalman filters and entirely wrong about
that slide. The digest becomes more useful and less faithful simultaneously,
and on the page those are indistinguishable.

This is a known failure mode in this organisation, not a hypothetical. A lossy
restatement that reads as complete becomes the reference precisely *because* it
is the legible one, and the divergence surfaces only at first contact with
hardware. A per-frame narrator is that failure automated, with a sampling rate.

### 7.3 The measurement

The Nerdometer already produces the scarce half: question sets authored from an
abstract before delivery, with a measured human baseline under two known
conditions. Adding model arms turns it into a channel-capacity experiment.

| Condition | What it measures |
|---|---|
| Human, heard | Ceiling. What the talk conveyed to a person in the room. |
| Human, unheard | The abstract, plus that player's prior knowledge. |
| Model, abstract only | What is recoverable from the compression alone. |
| Model, digest | What survived the `novel-to-vr` pipeline. |
| Model, verbatim transcript | The least-lossy digest available. |

Digest minus abstract is what the pipeline added. Transcript minus digest is
what it discarded. Neither quantity is currently known for any video-to-text
pipeline we are aware of, and both are obtainable within one show cycle.

### 7.4 Detecting injection without ground truth

The interesting quantity — how much of the digest came from the model rather
than the video — has no ground truth to check against, because nobody
transcribes what was actually on every slide.

A workable proxy: **run the narrator twice on identical frames with different
seeds.** Content that arrived through the channel is stable across runs.
Content drawn from the model's priors varies. Variance localises injection
without requiring anyone to know what the slide truly said. This is the
`stylometric-fingerprint` approach — detect drift from output text alone —
turned on our own pipeline rather than on a vendor's model.

### 7.5 Two cautions on the model arms

**Contamination.** If a talk is public, the model may have seen it. "Abstract
only" then measures retrieval rather than predictability, and the result is
worthless in the exact way it appears strongest. This is precisely the problem
`canonical-bench` exists to address, which argues the model arms belong there
rather than bolted onto this paper.

**Asymmetric priors.** Models do not have uniform prior knowledge across
subjects any more than audiences do. A model arm on tarot and a model arm on
D&D are not comparable without a baseline condition, which is what the
abstract-only arm is for.

### 7.6 The question underneath

If the effect survives, the follow-up is whether a language model can predict
the gap *from the abstract alone* — that is, estimate how much of a talk its
own abstract fails to convey, without seeing the talk.

That is the compressibility criterion stated as an experiment. A trajectory is
compressible exactly when a validated model of the domain can be built without
possessing the results the trajectory produced. An abstract claims to be such a
model. Measuring the residual is measuring the claim.

---

*Instrument, simulator and analysis: `github.com/quantumcelnav/nerd-nite-socials`,
CC BY 4.0. Reproduce §4 with `node tools/sim/simulate.mjs` and
`node tools/sim/analyze.mjs`; seeds are fixed.*
