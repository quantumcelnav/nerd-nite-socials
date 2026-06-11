const OWNER_LABELS = { boss: 'BOSS', crew: 'CREW', tech: 'TECH', auto: 'AUTO' }

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
          const done   = !!checklist[`${currentStateId}:${item.key}`]
          const isAuto = item.owner === 'auto'
          const locked = isPreviewing || isAuto
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
              <span className="cl-label">{item.label}</span>
              <span className={`cl-owner cl-owner--${item.owner}`}>{OWNER_LABELS[item.owner]}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
