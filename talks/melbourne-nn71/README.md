# "You Had to be There" — Nerd Nite Melbourne #71

Wed 14 Oct 2026, Howler, Brunswick. 15 min target, 20 ceiling, then 5–10 of Q&A.

Sixteen slides, 16:9, in **Nerd Nite Fort Collins house style** — he is on that
stage as himself and as the NNFC boss, so the deck wears the show's colours.

```
make            slides.pdf   the deck
make pptx       slides.pptx  for the venue (no notes - see make-pptx.py)
make notes      notes.pdf    lectern copy: every beat, timing and warning
make clean      drop build/
```

**Builds with xelatex**, not pdflatex — the brand face is Courier New via
fontspec.

## Adding the photographs

Every picture in the deck is a `\slot{}` inside the slide layout. Each one
currently draws a labelled box saying what belongs there. **Drop the file in
and it appears** — same size, same position, no edit to `body.tex`:

```
img/p05-donner.jpg      ← just put it there, then `make`
```

`.jpg`, `.png` and `.jpeg` are all picked up. The box dimensions are fixed, so
what you are looking at now is the layout you get with real photographs in it.

| slide | file | wants |
|---|---|---|
| 1 | `img/p01-room` | the Fort Collins room mid-talk, audience faces lit |
| 2 | `img/p02-justin` | him at the NNFC mic, mid-sentence, not posed |
| 4 | `img/p04-field` | the field or the lab — his hands in it |
| 5 | `img/p03-trajectories` | many tracks arriving at one point |
| 8 | `img/p05-donner` | Hannah on stage, or her S2025E01 poster |
| 11 | `img/p06-mars` | a rover alone, empty horizon, no people |
| 13 | `img/p07-john` | John at the Wolverine, dressed as himself |
| 14 | `img/p08-organ-build` | audience hands assembling organ parts |
| 15 | `img/p09-organ-play` | **Joel at the keyboard and the volunteer pumping** |

`p09` is the most important photograph in the deck. Without the volunteer
visible, the last beat loses its evidence.

## Brand

Palette, typeface and logo are lifted from the real poster source
(`NerdNiteFortCollins/POSTERS/S2025E08.tex`) and live in `nnfc.tex`. Do not
invent brand colours; if the poster changes, change `nnfc.tex`.

| | |
|---|---|
| `NNblue` | `0,42,55` — the ground |
| `NNLblue` | `19,218,249` — headings, rules, the signature |
| `NNorange` | `255,97,27` — names and the one line that matters per slide |
| `NNred` `NNpink` | `237,28,37` · `248,164,167` |
| face | Courier New |
| logo | `assets/NNFoCoLogo.pdf`, bottom right on every slide but the close |

**"Be there and be square" is on the title slide on purpose.** The house
tagline is the talk's closing line, already on the wall ten minutes early.
Nobody needs to notice.

## Structure

| | | |
|---|---|---|
| 1–5 | Introduction, the roles, education, trajectories, **thank you** | 2:30 |
| 6 | What the talk covers | 0:45 |
| 7 | The flip | 1:30 |
| 8–9 | Hannah, then Berlioz | 3:00 |
| 10 | Why did that just work? **Don't answer** | 0:45 |
| 11–12 | Mars | 1:45 |
| 13 | The abstract we didn't fix | 1:30 |
| 14–15 | The night we built the organ | 2:00 |
| 16 | The turn, the close | 0:30 |
| | | **14:15** |

Forty-five seconds of margin. **First cut: Berlioz** (slide 9, 0:30). Second:
trim the introduction. **Slides 10, 13 and 15 are the spine and never get cut.**

Reasoning and the material behind each beat:
[`../../NN_Melbourn_Oct26_YHTBT_trajectories.md`](../../NN_Melbourn_Oct26_YHTBT_trajectories.md)

## Hard rules, all of them paid for

- **Slide 10 asks a question and does not answer it.** Resolve the "why" there
  and Mars becomes a restatement and the middle goes flat.
- **Do not read John's abstract aloud.** It makes John the joke in front of
  other bosses. The beat needs the decision, not the exhibit.
- **Slide 15: one flat sentence about being moved, then stop.** The second
  sentence is the sentimentality that kills it.
- **Do not generalise it.** Not "and that's what Nerd Nite does." No
  instruction to the room, not once.
- **Say "a volunteer," not "an audience member."** Somebody put their hand up.
- **The close has no slide.** Slide 16 is deliberately empty — no logo, no
  furniture. A slide reading "You are." would rob it.
- Military past tense, and it sits inside a list on slide 3 that exists to be
  undercut by the next line. Never the opening position.

## Still his

1. The opening twenty seconds — an instance of the phrase failing.
2. The exact wording of the question on slide 10.
3. Whether the HoloLens parallel goes into slide 13. One sentence either way.
4. Whether the NASA voice radio appears at all.

## Build notes

- **xelatex required.** fontspec + Courier New.
- Two-column slides use beamer `columns`, not minipages. The first version used
  minipages at `0.50 + 0.46` of `\textwidth` plus margins, which overflowed and
  silently dropped the photograph below the text instead of beside it.
- `\slot` takes **bare numbers in cm**, `{6.2}{4.4}`. The first version took
  dimensions with units and did arithmetic on them (`4.4cm-1.25`), which tikz
  accepted and placed the labels outside the box.
- Courier New is a wide face. `\large` in a `0.54\textwidth` column overflows
  into the logo bug; `\normalsize` is the safe body size there.
- 16:9. **AV still unconfirmed with Howler** — 16:9 letterboxes safely on a 4:3
  projector, the reverse does not.
