import { useEffect, useRef, useState } from 'react'

export default function StateMachine({
  allStates, currentStateId, currentStateIdx, viewingStateId,
  nextState, prevState, stateEnteredAt, onAdvance, onRetreat, onNodeClick,
  canAdvance, blockingItems, isPreviewing,
}) {
  const [elapsed, setElapsed] = useState(0)
  const trackRef = useRef(null)

  useEffect(() => {
    if (!stateEnteredAt) return
    const tick = () => setElapsed(Math.floor((Date.now() - stateEnteredAt.getTime()) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [stateEnteredAt])

  // Keep live node visible when show advances
  useEffect(() => {
    const node = trackRef.current?.querySelector('.sm-node--live')
    node?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [currentStateIdx])

  function fmt(secs) {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const currentState = allStates[currentStateIdx]

  return (
    <div className="sm-wrap">
      <div className="sm-track" ref={trackRef}>
        {allStates.map((state, idx) => {
          const past     = idx < currentStateIdx
          const live     = state.id === currentStateId
          const viewing  = state.id === viewingStateId
          const future   = idx > currentStateIdx
          return (
            <div
              key={state.id}
              className={[
                'sm-node',
                past    ? 'sm-node--past'    : '',
                live    ? 'sm-node--live'    : '',
                viewing ? 'sm-node--viewing' : '',
                future  ? 'sm-node--future'  : '',
              ].join(' ').trim()}
              onClick={() => onNodeClick?.(state.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onNodeClick?.(state.id)}
              title={live ? 'LIVE' : viewing ? 'PREVIEW' : state.label}
            >
              {idx > 0 && <div className="sm-connector" />}
              <div className="sm-dot">
                {live && <span className="sm-live-pip" />}
              </div>
              <span className="sm-node-label">{state.label}</span>
              {viewing && !live && <span className="sm-preview-tag">VIEW</span>}
            </div>
          )
        })}
      </div>

      <div className="sm-banner">
        <div className="sm-banner-left">
          <div className="sm-banner-live">
            <span className="sm-live-dot" />
            <span className="sm-banner-state">{currentState?.label}</span>
            {stateEnteredAt && <span className="sm-banner-timer">{fmt(elapsed)}</span>}
          </div>
          {isPreviewing && (
            <div className="sm-banner-preview">
              <span className="sm-preview-label">PREVIEW</span>
              <span className="sm-preview-state">
                {allStates.find(s => s.id === viewingStateId)?.label}
              </span>
            </div>
          )}
        </div>

        <div className="sm-banner-right">
          {prevState && onRetreat && (
            <button
              className="sm-retreat"
              onClick={onRetreat}
              title={`Go back to ${prevState.label}`}
            >
              ← {prevState.label}
            </button>
          )}
          {nextState ? (
            <button
              className={`sm-advance ${canAdvance ? 'sm-advance--ready' : 'sm-advance--blocked'}`}
              onClick={canAdvance ? onAdvance : undefined}
              disabled={!canAdvance}
              title={!canAdvance ? `Blocked: ${blockingItems.map(i => i.label).join(', ')}` : `Advance to ${nextState.label}`}
            >
              {canAdvance
                ? `→ ${nextState.label}`
                : `● ${blockingItems.length} blocking`}
            </button>
          ) : (
            <span className="sm-complete">SHOW COMPLETE</span>
          )}
        </div>
      </div>
    </div>
  )
}
