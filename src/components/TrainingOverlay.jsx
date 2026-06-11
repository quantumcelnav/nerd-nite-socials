import '../training.css'

const TRAINING = {
  'SUPER BOSS': {
    tagline: 'You run the show. Justin or Senne.',
    sections: [
      {
        head: 'State Machine',
        items: [
          'The show has 13 states — Pre-Show through Wrap.',
          'Orange dot = where you are. Click any node to preview its checklist.',
          '→ ADVANCE moves to the next state when all checklist items are clear.',
          '← RETREAT goes back if something needs a redo.',
          'BOSS: CHECK ALL + ADVANCE overrides all blocking items and advances. Use it when the show needs to move and the formality doesn\'t.',
        ],
      },
      {
        head: 'Checklist',
        items: [
          'Each state has items owned by BOSS, CREW, TECH, or AUTO.',
          'AUTO items check themselves when the state advances.',
          'Click any non-auto item to check it. Click again to uncheck — it shows when it was last checked.',
          'Blocking items prevent advance. Your call whether that matters right now.',
        ],
      },
      {
        head: 'Nonce + QR',
        items: [
          '⚡ GENERATE creates the show nonce — the secret key for tonight\'s trivia.',
          'The QR slide updates live the moment you generate. Open it on the projector before doors.',
          '↻ REGEN starts a fresh leaderboard. Use it if test scores pollute the board before the show.',
          'QR SLIDE ↗ opens the projection slide in a new tab.',
        ],
      },
      {
        head: 'Comms',
        items: [
          'Boss-to-boss text channel. All roles can see and send.',
          'SYSTEM messages are automatic — nonce URLs post here when generated.',
          'Set your name once. It saves.',
        ],
      },
      {
        head: 'Modules',
        items: [
          'TRIVIA WIRED: the state machine controls trivia freeze/unfreeze automatically.',
          'TRIVIA STANDALONE: you control the freeze manually in the admin panel.',
          'Wired is cleaner. Standalone is safer if you want manual control.',
        ],
      },
      {
        head: 'If the network drops',
        items: [
          'The cockpit keeps running on local state.',
          '↑ SYNC appears when changes are pending — it retries when you\'re back online.',
          '🖨 PACK opens the printable ShowPack — full runsheet, lineup, leaderboard, hand signals.',
          'Print it before doors. One copy per boss.',
        ],
      },
    ],
  },

  'BOSS': {
    tagline: 'You advance states and own your checklist items. Jamie or Hannah.',
    sections: [
      {
        head: 'State Machine',
        items: [
          'Orange dot = the live show state. Click any node to preview its checklist.',
          '→ ADVANCE moves to the next state when your checklist items are clear.',
          '← RETREAT goes back if something needs a redo.',
          'BOSS: CHECK ALL + ADVANCE is the override. Use it when the show needs to move.',
          'Don\'t advance mid-talk or mid-laugh. Advance in the transitions.',
        ],
      },
      {
        head: 'Checklist',
        items: [
          'Items marked BOSS are yours. Check them when they\'re done.',
          'CREW and TECH items belong to others — you can see them but they\'re not your job.',
          'AUTO items check themselves.',
          'Unchecked BOSS items block advance — check them or hit the override.',
        ],
      },
      {
        head: 'Comms',
        items: [
          'This is how you talk to Justin, Senne, and crew without crossing the room.',
          'Set your name once. Keep messages short.',
          'SYSTEM messages are automatic — ignore them unless a URL is useful.',
        ],
      },
    ],
  },

  'CREW': {
    tagline: 'You can see the show state and talk to the team. That\'s your job tonight.',
    sections: [
      {
        head: 'What you\'re looking at',
        items: [
          'Orange dot on the track = the live show state.',
          'The checklist shows what\'s been done and what\'s pending in each state.',
          'You can\'t advance states or check items — that\'s the boss role.',
        ],
      },
      {
        head: 'Comms',
        items: [
          'Use this to flag anything to the team without leaving your post.',
          'Set your name. Keep it short.',
          'If something is wrong, say so here first.',
        ],
      },
    ],
  },
}

export default function TrainingOverlay({ role, onDismiss }) {
  const guide = TRAINING[role] ?? TRAINING['CREW']

  return (
    <div className="training-backdrop">
      <div className="training-modal">
        <div className="training-header">
          <div>
            <span className="training-role-badge">{role}</span>
            <p className="training-tagline">{guide.tagline}</p>
          </div>
          <button className="training-close" onClick={onDismiss}>✕</button>
        </div>

        <div className="training-body">
          {guide.sections.map(section => (
            <div key={section.head} className="training-section">
              <h3 className="training-section-head">{section.head}</h3>
              <ul className="training-list">
                {section.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="training-footer">
          <button className="training-got-it" onClick={onDismiss}>
            GOT IT — SHOW ME THE COCKPIT
          </button>
          <span className="training-reopen-hint">
            Hit ? in the header to reopen this anytime.
          </span>
        </div>
      </div>
    </div>
  )
}
