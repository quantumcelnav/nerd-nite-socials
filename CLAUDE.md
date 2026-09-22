# nerd-nite-socials — the Nerdometer

Live-show trivia for Nerd Nite Fort Collins, played on audience phones during
the show. `PLANNING.md` is the product plan and the authority; read it before
changing behaviour.

## Show-night shape

Three rounds: the house round on Nerd Nite itself, then one round per speaker.
Trivia runs **between the two talks**, which is deliberate — it puts the
audience informed on one talk and uninformed on the other, and the gap is the
measurement. Question-authoring rules are in `PLANNING.md`.

## The nonce is the whole safety model

One value gates whether a score is recorded and whether it appears on the
board. It is generated in the cockpit, stored in `show_state`, and read by
three consumers: the QR slide, the phone, the leaderboard. **All three must
treat it identically.** A sanitisation mismatch between the gate and the writer
silently lost scores until 2026-09-17; the regression case is in the Suite B
test plan and should stay there.

## Known gap

Scores store a total only. There is no per-round breakdown, so the
heard-versus-unheard experiment cannot actually be measured yet. The fix and
its strict ordering are written up in `PLANNING.md`: add the Supabase column
first, deploy code second, or every score insert fails.

## Conventions

- Editions are JSON in `public/editions/`, newest prepended to `index.json`.
- Push to `staging` for a Vercel preview; merge to `main` to go live.
- An edition with no `nonce` field is practice mode. That is the safe resting
  state and is why pushing early is harmless.
- Commits follow the TCA sign-off convention in `~/.claude/CLAUDE.md`.
