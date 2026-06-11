// Nerd Nite Fort Collins — show state machine flight plan
// Each state has an id, display label, checklist items, and moduleActions.
// owner: 'boss' | 'crew' | 'tech' | 'auto'
// moduleActions.trivia: 'unlock' | 'freeze' | undefined
//   unlock → leaderboard accepts scores
//   freeze → leaderboard locked permanently
//   undefined → no change to trivia state

export const NN_STATES = [
  {
    id: 'pre_show',
    label: 'Pre-Show',
    moduleActions: {},
    checklist: [
      { key: 'speakers_arrived',  label: 'Speakers confirmed arrived',      owner: 'boss' },
      { key: 'mic_check',         label: 'Mic check complete',              owner: 'tech' },
      { key: 'trivia_loaded',     label: 'Trivia loaded for tonight',       owner: 'boss' },
      { key: 'day_of_post',       label: 'Day-of post live on socials',     owner: 'crew' },
      { key: 'projector_test',    label: 'Projector test done',             owner: 'boss' },
    ],
  },
  {
    id: 'doors_open',
    label: 'Doors Open',
    moduleActions: {},
    checklist: [
      { key: 'music_on',          label: 'Pre-show music playing',          owner: 'auto' },
      { key: 'bar_briefed',       label: 'Bar staff briefed on trivia',     owner: 'boss' },
    ],
  },
  {
    id: 'intro',
    label: 'Intro',
    moduleActions: {},
    checklist: [
      { key: 'on_stage',          label: 'Justin on stage',                 owner: 'boss' },
    ],
  },
  {
    id: 'trivia_open',
    label: 'Trivia Live',
    moduleActions: { trivia: 'unlock' },
    checklist: [
      { key: 'trivia_unlocked',   label: 'Trivia live on audience phones',  owner: 'auto' },
      { key: 'qr_visible',        label: 'QR code visible from stage',      owner: 'boss' },
    ],
  },
  {
    id: 'speaker_1',
    label: 'Speaker 1',
    moduleActions: {},
    checklist: [
      { key: 'introduced',        label: 'Speaker introduced',              owner: 'boss' },
    ],
  },
  {
    id: 'qa_1',
    label: 'Q&A',
    moduleActions: {},
    checklist: [
      { key: 'floor_open',        label: 'Floor open for questions',        owner: 'boss' },
    ],
  },
  {
    id: 'break',
    label: 'Break',
    moduleActions: {},
    checklist: [
      { key: 'break_announced',   label: '15 min break announced',          owner: 'boss' },
      { key: 'music_on',          label: 'Intermission music on',           owner: 'auto' },
      { key: 'spk2_ready',        label: 'Speaker 2 confirmed ready',       owner: 'boss' },
      { key: 'scores_tallied',    label: 'Trivia scores tallied',           owner: 'auto' },
    ],
  },
  {
    id: 'return',
    label: 'Return',
    moduleActions: {},
    checklist: [
      { key: 'back_on_stage',     label: 'Back on stage',                   owner: 'boss' },
    ],
  },
  {
    id: 'winners',
    label: 'Winners',
    moduleActions: { trivia: 'freeze' },
    checklist: [
      { key: 'board_on_screen',   label: 'Leaderboard on projector',        owner: 'auto' },
      { key: 'winners_announced', label: 'Trivia winners announced',        owner: 'boss' },
    ],
  },
  {
    id: 'this_month',
    label: 'This Month',
    moduleActions: {},
    checklist: [
      { key: 'segment_done',      label: 'This Month in Science done',      owner: 'boss' },
    ],
  },
  {
    id: 'speaker_2',
    label: 'Speaker 2',
    moduleActions: {},
    checklist: [
      { key: 'introduced',        label: 'Speaker introduced',              owner: 'boss' },
    ],
  },
  {
    id: 'qa_2',
    label: 'Q&A',
    moduleActions: {},
    checklist: [
      { key: 'floor_open',        label: 'Floor open for questions',        owner: 'boss' },
    ],
  },
  {
    id: 'wrap',
    label: 'Wrap',
    moduleActions: { trivia: 'freeze' },
    checklist: [
      { key: 'thanks_given',      label: 'Thank speakers and audience',     owner: 'boss' },
      { key: 'next_show',         label: 'Next show date announced',        owner: 'boss' },
      { key: 'outro_music',       label: 'Outro music playing',             owner: 'auto' },
    ],
  },
]

export const STATE_IDS = NN_STATES.map(s => s.id)

// Flat map of stateId → moduleActions for quick lookup in hooks
export const MODULE_ACTIONS = Object.fromEntries(
  NN_STATES.map(s => [s.id, s.moduleActions ?? {}])
)

export function getState(id) {
  return NN_STATES.find(s => s.id === id) ?? NN_STATES[0]
}

export function getNextState(id) {
  const idx = NN_STATES.findIndex(s => s.id === id)
  return idx >= 0 && idx < NN_STATES.length - 1 ? NN_STATES[idx + 1] : null
}
