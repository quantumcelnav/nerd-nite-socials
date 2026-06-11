const OWNER_LABELS = { boss: 'BOSS', crew: 'CREW', tech: 'TECH', auto: 'AUTO' }

function fmtTime(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChecklistPanel({ currentState, currentStateId, checklist, onToggle, isPreviewing, previewLabel }) {
  if (!currentState?.checklist?.length) {
    return <div className="cl-empty">No checklist for this state.</div>
  }

  return (
    <div className="cl-panel">
      <h2 className="cl-heading">
        {isPreviewing
          ? <><span className="cl-preview-badge">PREVIEW</span> {previewLabel?.toUpperCase()}</>
          : <>CHECKLIST — {currentState.label.toUpperCase()}</>
        }
      </h2>
      {isPreviewing && (
        <p className="cl-preview-note">Read-only — click a node to return to live view</p>
      )}
      <ul className="cl-list">
        {currentState.checklist.map(item => {
          const entry  = checklist[`${currentStateId}:${item.key}`]
          const done   = !!entry?.completed
          const prevAt = !done ? fmtTime(entry?.completedAt) : null
          const isAuto = item.owner === 'auto'
          const locked = isPreviewing || isAuto || !onToggle
          return (
            <li
              key={item.key}
              className={`cl-item ${done ? 'cl-item--done' : ''} ${locked ? 'cl-item--locked' : ''}`}
              onClick={locked ? undefined : () => onToggle(currentStateId, item.key)}
              role={locked ? undefined : 'checkbox'}
              aria-checked={done}
              tabIndex={locked ? undefined : 0}
              onKeyDown={locked ? undefined : e => e.key === ' ' && onToggle(currentStateId, item.key)}
            >
              <span className="cl-check">{done ? '✓' : '○'}</span>
              <span className="cl-label">
                {item.label}
                {prevAt && <span className="cl-prev-note">prev {prevAt}</span>}
              </span>
              <span className={`cl-owner cl-owner--${item.owner}`}>{OWNER_LABELS[item.owner]}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
