# "You Had to be There" — Nerd Nite Melbourne #71

Wed 14 Oct 2026, Howler, Brunswick. 15 min target, 20 ceiling, then 5–10 of Q&A.

```
make            slides.pdf   the deck, 14 frames, 16:9
make notes      notes.pdf    lectern copy: every beat, timing and warning
make images     regenerate the placeholder meta-images
make clean      drop build/, keep img/ and the PDFs
```

## The images are placeholders and are meant to be swapped

Every photograph in the deck is currently a **meta-image**: a rendered PNG that
describes the picture that belongs in that slot. To replace one:

1. Overwrite `img/<name>.png` with the real photograph.
2. Delete `img/<name>.placeholder`.
3. `make`.

Nothing in `body.tex` changes. `make images` will never overwrite a file whose
`.placeholder` marker is gone, so swapped-in photographs survive a regeneration.

| slot | wants |
|---|---|
| `p01-room` | the Fort Collins room mid-talk, audience faces lit |
| `p02-justin` | him at the mic, mid-sentence, not a headshot |
| `p03-trajectories` | many tracks arriving at one point |
| `p04-donner` | Hannah on stage, or her S2025E01 poster |
| `p05-mars` | a rover alone, empty horizon, no people |
| `p06-john` | John at the Wolverine, dressed as himself |
| `p07-organ-build` | audience hands assembling organ parts |
| `p08-organ-play` | Joel at the keyboard **and** the volunteer pumping |

`p08` is the one that matters most. Without the volunteer in frame the last
beat loses its evidence.

## Structure

| | | |
|---|---|---|
| 1 | Introduction, trajectories, thank you | 2:30 |
| 2 | What the talk covers | 0:45 |
| 3 | The flip | 1:30 |
| 4 | The catalogue — Hannah, then Berlioz | 3:00 |
| 5 | Name the recursion. Ask why. **Don't answer** | 0:45 |
| 6 | Mars | 1:45 |
| 7 | The abstract we didn't fix | 1:30 |
| 8 | The night we built the organ | 2:00 |
| 9 | The turn, the close | 0:30 |
| | | **14:15** |

Forty-five seconds of margin. **First cut: Berlioz** (one frame, 0:30). Second:
trim the introduction. **Items 5, 7 and 8 are the spine and never get cut.**

Reasoning, alternatives and the material behind each beat:
[`../../NN_Melbourn_Oct26_YHTBT_trajectories.md`](../../NN_Melbourn_Oct26_YHTBT_trajectories.md)

## Hard rules, all of them paid for

- **One image or one line per frame.** The delivery is extemporaneous; a
  bulleted slide becomes a teleprompter and flattens it.
- **Item 5 asks a question and does not answer it.** Resolve the "why" there
  and Mars becomes a restatement and the middle goes flat.
- **Do not read John's abstract aloud.** It makes John the joke in front of
  other bosses. The beat needs the decision, not the exhibit.
- **Item 8: one flat sentence about being moved, then stop.** The second
  sentence is the sentimentality that kills it.
- **Do not generalise item 8.** Not "and that's what Nerd Nite does." No
  instruction to the room, not once.
- **Say "a volunteer," not "an audience member."** Somebody put their hand up.
- **The close has no slide.** Frame 14 is deliberately empty. A slide reading
  "You are." does the work for him and robs it.
- Military past tense, never the opening position.

## Still his

1. The opening twenty seconds — an instance of the phrase failing.
2. The exact wording of the question ending item 5.
3. Whether the HoloLens parallel goes into item 7. One sentence either way.
4. Whether the NASA voice radio appears at all — optional now that the
   abstract's debt is paid by the Nerd Nite material itself.

## Build notes

- **Beamer reserves the colour names `bg` and `fg`.** Defining our own
  collided silently: the text frames rendered white-on-orange while the image
  frames looked fine, because the images are dark. The palette is `nn*`.
- 16:9 (`aspectratio=169`). **AV is still unconfirmed with Howler.** 16:9
  letterboxes safely on a 4:3 projector; the reverse does not.
- `notes.pdf` is the lectern copy. Print it or keep it on a phone. It carries
  the timings, the cumulative clock, and every warning above at the frame it
  applies to.
