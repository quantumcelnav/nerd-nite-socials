import { useState } from 'react'
import { useEdition } from '../contexts/EditionContext'
import { useCockpit } from '../hooks/useCockpit'
import { useNetworkStatus } from '../hooks/useNetworkStatus'
import { getState } from '../data/nnStates'
import StateMachine from './StateMachine'
import ChecklistPanel from './ChecklistPanel'
import CommsChannel from './CommsChannel'
import '../cockpit.css'

const COCKPIT_TOKEN  = import.meta.env.VITE_COCKPIT_TOKEN
const SHOWPACK_TOKEN = import.meta.env.VITE_COCKPIT_TOKEN  // same token for now

const MODULE_LABELS = {
  trivia: 'Trivia',
}

export default function Cockpit({ token }) {
  const { edition } = useEdition()
  const slug = edition?.edition
  const {
    allStates, currentState, currentStateId, currentStateIdx,
    nextState, stateEnteredAt, checklist, comms,
    wiredModules, offlinePending,
    advanceState, toggleCheckItem, sendMessage, toggleModule, syncPending,
    canAdvance, blockingItems,
  } = useCockpit(slug)

  const network = useNetworkStatus()
  const isBoss  = COCKPIT_TOKEN && token === COCKPIT_TOKEN

  const [viewingStateId, setViewingStateId] = useState(null)
  const activeViewId  = viewingStateId ?? currentStateId
  const viewingState  = getState(activeViewId)
  const isPreviewing  = viewingStateId !== null && viewingStateId !== currentStateId

  const [senderName, setSenderName] = useState(() => localStorage.getItem('cockpit_sender') ?? '')

  if (!COCKPIT_TOKEN || !token) {
    return <div className="cockpit-denied">Access denied.</div>
  }

  function handleSenderChange(name) {
    setSenderName(name)
    localStorage.setItem('cockpit_sender', name)
  }

  function handleAdvance() {
    if (!isBoss || !canAdvance) return
    advanceState()
    setViewingStateId(null)
  }

  function handleNodeClick(stateId) {
    setViewingStateId(stateId === currentStateId ? null : stateId)
  }

  return (
    <div className="cockpit-screen">
      {/* Header */}
      <div className="cockpit-header">
        <span className="cockpit-edition">{slug ?? '—'}</span>
        <span className="cockpit-title">COCKPIT</span>
        <div className="cockpit-header-right">
          {offlinePending && (
            <button className="cockpit-sync-btn" onClick={syncPending} title="Pending changes — tap to retry sync">
              ↑ SYNC
            </button>
          )}
          <span className={`cockpit-net cockpit-net--${network}`} title={`Network: ${network}`}>
            {network === 'online'   ? '● LIVE'     : ''}
            {network === 'offline'  ? '● OFFLINE'  : ''}
            {network === 'checking' ? '○ …'        : ''}
          </span>
          <span className={`cockpit-role ${isBoss ? 'cockpit-role--boss' : 'cockpit-role--crew'}`}>
            {isBoss ? 'BOSS' : 'CREW'}
          </span>
          {isBoss && (
            <a
              className="cockpit-showpack-link"
              href={`${window.location.origin}${window.location.pathname}?showpack=${SHOWPACK_TOKEN}`}
              target="_blank"
              rel="noreferrer"
              title="Open printable show pack"
            >
              🖨 PACK
            </a>
          )}
        </div>
      </div>

      {/* Offline banner */}
      {network === 'offline' && (
        <div className="cockpit-offline-banner">
          OFFLINE — running on local state. Crew phones may not update. Show continues.
          {offlinePending && ' Changes will sync when reconnected.'}
        </div>
      )}

      {/* State machine */}
      <StateMachine
        allStates={allStates}
        currentStateId={currentStateId}
        currentStateIdx={currentStateIdx}
        viewingStateId={activeViewId}
        nextState={nextState}
        stateEnteredAt={stateEnteredAt}
        onAdvance={isBoss ? handleAdvance : undefined}
        onNodeClick={handleNodeClick}
        canAdvance={isBoss && canAdvance}
        blockingItems={blockingItems}
        isPreviewing={isPreviewing}
      />

      {/* Modules panel (boss only) */}
      {isBoss && (
        <div className="cockpit-modules">
          <span className="cockpit-modules-label">MODULES</span>
          {Object.keys(MODULE_LABELS).map(mod => (
            <label key={mod} className={`cockpit-module-toggle ${wiredModules[mod] ? 'cockpit-module-toggle--on' : ''}`}>
              <input
                type="checkbox"
                checked={!!wiredModules[mod]}
                onChange={() => toggleModule(mod)}
              />
              {MODULE_LABELS[mod]}
              <span className="cockpit-module-state">{wiredModules[mod] ? 'WIRED' : 'STANDALONE'}</span>
            </label>
          ))}
        </div>
      )}

      {/* Body */}
      <div className="cockpit-body">
        <ChecklistPanel
          currentState={viewingState}
          currentStateId={activeViewId}
          checklist={checklist}
          onToggle={isPreviewing ? undefined : toggleCheckItem}
          isPreviewing={isPreviewing}
          previewLabel={isPreviewing ? viewingState?.label : null}
        />
        <CommsChannel
          comms={comms}
          onSend={sendMessage}
          senderName={senderName}
          onSenderChange={handleSenderChange}
        />
      </div>
    </div>
  )
}
