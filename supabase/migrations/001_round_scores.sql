-- 001_round_scores.sql — per-round score retention
--
-- Run this in the Supabase SQL editor BEFORE or AFTER deploying the code;
-- ScoreSubmit retries without the column if it is missing, so deploy order
-- no longer matters. That defensiveness is deliberate: the previous plan
-- required column-first and a wrong order failed every score insert silently.
--
-- Shape written by the app:
--   {
--     "rounds": [
--       { "round": 1, "subject": "Nerd Nite Fort Collins", "speaker": "Justin Fritz",
--         "score": 1300, "max": 1300,
--         "questions": [ { "difficulty": 1, "correct": true }, ... ] }
--     ],
--     "tiebreaker": { "score": 67, "max": 100 }
--   }
--
-- Per-question detail is kept on purpose. The experiment compares a talk the
-- audience heard against one they had not, and difficulty is a confound: a
-- round can look strong because its Accessible question was easy rather than
-- because the talk landed. Only per-question data separates those.

alter table scores add column if not exists round_scores jsonb;

-- Index for the analysis queries; jsonb_path_ops is enough for containment.
create index if not exists scores_round_scores_idx
  on scores using gin (round_scores jsonb_path_ops);

comment on column scores.round_scores is
  'Per-round and per-question detail. See supabase/migrations/001_round_scores.sql.';
