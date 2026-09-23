# Nerdometer — Roadmap

Written 2026-09-23, prompted by Roblox Everywhere. Companion to `PLANNING.md`,
which holds the product plan and the authoring methodology. This is about where
the thing goes, not how it works.

---

## 0. On Roblox Everywhere, since that is what prompted this

**Wrong vehicle. The problem it solves is one we do not have.**

Roblox announced that selected creators will be able to ship games as branded
standalone apps on Steam, Google Play and the App Store, still running on
Roblox's engine and infrastructure. Browser play lands end of 2026, offline solo
mid-2027. Revenue share matches the in-app rate, though nobody has explained how
that survives Steam's own 30%.

Five reasons it is not for us:

1. **We already ship a standalone app.** `vite.config.js` sets
   `display: 'standalone'` and the PWA installs straight from the browser. No
   store, no review, no platform cut.
2. **The friction model is inverted.** The whole move is: scan a QR at a bar,
   playing in three seconds, no install and no account. Roblox very likely needs
   an account, and certainly needs an install. At a venue with sixty people and
   one show, install friction is fatal.
3. **Audience mismatch.** Roblox skews young. Nerd Nite is adults in a bar, and
   the brand rules require the venue serve alcohol.
4. **It is a rewrite.** Luau and a 3D engine, for what is a form with four
   buttons and a leaderboard.
5. **The median Roblox creator earned $1,500 last year** while the top ten
   averaged $65.7 million. That distribution is the actual offer.

**What the news does signal**, and this part is worth keeping: the platform
layer is commoditising. Roblox is unbundling itself because distribution stopped
being the moat. That is the same movement that makes a QR code and a web app a
complete product, and it argues for staying exactly where we are.

If native packaging ever matters, Capacitor wraps the existing React app for
both stores in days. That is the escape hatch, and it does not cost a rewrite.

---

## 1. What we actually have

Worth being explicit, because the assets are unusual and easy to undervalue.

| Asset | Detail |
|---|---|
| Authored corpus | 18 editions, 123 questions, every one tied to a real expert talk |
| A live venue and audience | Monthly, Wolverine Farm, an existing crowd |
| A distribution network | Nerd Nite runs in 100+ cities on the same format |
| A fork path already built | CC BY 4.0, affiliate re-skinning documented |
| An experiment nobody else runs | Questions authored from abstracts before the talk |

That last one is the only genuinely novel thing here, and it is the one thing
not yet finished.

---

## 2. Horizon 1 — finish the instrument (weeks)

**Per-round scoring. This is the blocker and nothing else in this document
matters without it.**

Scores currently store a single total, so a result cannot be decomposed into the
house round, the talk the audience heard, and the talk they had not yet seen.
The format was designed to create exactly that comparison and the database
cannot see it. Fix is recorded in `PLANNING.md`: add the jsonb column in
Supabase first, then the two code changes, in that order.

Also here:
- Speaker sign-off loop on questions, which the plan already requires and the
  process does not yet enforce.
- Slide-deck-steered authoring, the rule already written: the deck says where in
  the field to aim, never what the answer is.

## 3. Horizon 2 — Melbourne is a distribution event (3 weeks)

Justin is a billed presenter at Nerd Nite Melbourne on **14 October 2026**, in
front of another chapter's audience *and* its organisers. That is the single
best fork-acquisition moment available and it has a date on it.

What "ready to hand over" means:
- A one-page "run this at your chapter" that is shorter than the current guide.
- A fork that boots on a fresh Vercel and Supabase in under an hour.
- The affiliate path tested once, by someone who is not Justin, before the 14th.

Failing to prepare this turns a distribution event back into a talk.

## 3.5 The big picture — what is actually being measured

Worth stating before the horizons, because it changes what they are for.

**Live events sell presence. Nobody has ever measured what presence delivers.**
Every conference, every lecture series, every venue rests on an unmeasured
assertion that being in the room does something a summary cannot. The entire
economics of showing up depends on that gap, and it has never had a number.

Irreducibility is that number, and Nerd Nite Fort Collins is sitting in a bar
with the instrument already built.

**That makes it a key performance indicator, not a report card.** If the product
is the experience, then the fraction of a talk that exists only in the room is
not a side effect of programming. It is the thing being sold. We would be the
first event we are aware of that can say what its own product delivered, in a
number, on the night.

**The timing is not incidental.** The anxiety everywhere is that summarisation
got cheap, so why attend anything. The answer is not to argue. It is to measure
which content survives compression and which does not, then programme for the
part that does not. High-irreducibility content is resistant to summary by
construction. That is the compressibility criterion from `tca-trilogy` pointed
at an audience instead of at a trajectory.

For a programme committee this changes the question from "is this a good talk"
to "will anyone need to be here for it" — which is the question they are
actually trying to answer and currently answer by feel.

**The honest limit.** None of this is true yet. It is a good story resting on
123 questions and zero rounds of per-round data. It becomes real after three
shows and not before. If the effect turns out small, the finding is that Nerd
Nite talks compress better than anyone wanted to believe, and publishing that
would take more nerve than publishing the flattering version.

## 4. Horizon 3 — the corpus becomes the asset (months)

Once per-round scoring lands, every show produces a row of real data: an expert
talk, questions written from its abstract before delivery, and measured audience
performance on heard versus unheard material.

That is a dataset nobody else has, because nobody else runs the experiment. It
answers a question with actual customers: **how much of a talk is predictable
from its abstract?** Conference programme committees, CFP reviewers, and anyone
commissioning science communication all guess at this today.

It also lands squarely on TCA's own thesis. "Can a validated model of a domain
be built without possessing the results the trajectory produced" is the
compressibility criterion from `tca-trilogy/art-of-art`. An abstract is a lossy
compression of a talk. Measuring the loss is basis selection with an audience
attached, and it is adjacent to `canonical-bench`.

## 5. Horizon 4 — generalise the pattern (year+)

The product is not trivia. Trivia is the delivery mechanism.

The pattern is: **a live expert event, an audience holding phones, questions
authored before the talk, and a measurement of what actually landed.** That
generalises to conferences, university lecture series, corporate all-hands, and
CPD where attendance has to be evidenced.

Sell the instrument, not the game. The instrument answers "did this talk deliver
what it promised", which is a question institutions already pay consultants to
guess at.

## 6. What not to do

- **Do not chase platforms.** PWA already gives install without a storefront.
  Every hour spent on Roblox, native wrappers or app stores is an hour not spent
  on the measurement, which is the only defensible part.
- **Do not broaden the trivia.** General trivia apps are a commodity market with
  free incumbents. The value is that these questions are tied to a specific talk
  by a specific expert on a specific night.
- **Do not scale chapters before the fork is tested once.** A broken fork at
  another chapter costs more reputation than a slow rollout costs opportunity.

---

## 7. Ordered, with the gates

1. Per-round scoring. Supabase column first. **Gates everything.**
2. Melbourne handover pack, before 14 October. **Has a hard date.**
3. One outside chapter running a fork successfully.
4. Three shows of clean per-round data.
5. Write up the you-had-to-be-there result. That is a paper, and
   `tca-publications` is where it goes.
6. Only then consider whether this is a product or stays an instrument.
