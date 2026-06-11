import { useState } from 'react'
import { useEdition } from '../contexts/EditionContext'
import { useCockpit } from '../hooks/useCockpit'
import { useNetworkStatus } from '../hooks/useNetworkStatus'
import { getState } from '../data/nnStates'
import StateMachine from './StateMachine'
import ChecklistPanel from './ChecklistPanel'
import CommsChannel from './CommsChannel'
import TrainingOverlay from './TrainingOverlay'
import '../cockpit.css'

const SUPER_TOKEN    = import.meta.env.VITE_COCKPIT_TOKEN
const BOSS_TOKEN     = import.meta.env.VITE_BOSS_TOKEN
const CREW_TOKEN     = import.meta.env.VITE_CREW_TOKEN
const SHOWPACK_TOKEN = import.meta.env.VITE_COCKPIT_TOKEN

const MODULE_LABELS = { trivia: 'Trivia' }

export default function Cockpit({ token }) {
  const { edition } = useEdition()
  const slug = edition?.edition
  const {
    allStates, currentState, currentStateId, currentStateIdx,
    nextState, prevState, stateEnteredAt, checklist, comms,
    wiredModules, showNonce, offlinePending,
    advanceState, checkAllAndAdvance, retreatState, toggleCheckItem,
    sendMessage, toggleModule, syncPending, generateNonce,
    canAdvance, blockingItems,
  } = useCockpit(slug)

  const network     = useNetworkStatus()
  const isSuperBoss = SUPER_TOKEN && token === SUPER_TOKEN
  const isBoss      = BOSS_TOKEN  && token === BOSS_TOKEN
  const isCrew      = CREW_TOKEN  && token === CREW_TOKEN
  const hasAccess   = isSuperBoss || isBoss || isCrew
  const canControl  = isSuperBoss || isBoss   // advance + checklist

  const role = isSuperBoss ? 'SUPER BOSS' : isBoss ? 'BOSS' : 'CREW'

  const [viewingStateId, setViewingStateId] = useState(null)
  const activeViewId = viewingStateId ?? currentStateId
  const viewingState = getState(activeViewId)
  const isPreviewing = viewingStateId !== null && viewingStateId !== currentStateId

  const [senderName, setSenderName] = useState(() => localStorage.getItem('cockpit_sender') ?? '')
  const [showTraining, setShowTraining] = useState(() => {
    const key = `cockpit_trained_${token?.slice(-6)}`
    return !localStorage.getItem(key)
  })

  if (!hasAccess) return <div className="cockpit-denied">Access denied.</div>

  function dismissTraining() {
    const key = `cockpit_trained_${token?.slice(-6)}`
    localStorage.setItem(key, '1')
    setShowTraining(false)
  }

  function handleSenderChange(name) {
    setSenderName(name)
    localStorage.setItem('cockpit_sender', name)
  }

  function handleAdvance() {
    if (!canControl || !canAdvance) return
    advanceState()
    setViewingStateId(null)
  }

  function handleRetreat() {
    if (!canControl || !prevState) return
    retreatState()
    setViewingStateId(null)
  }

  return (
    <div className="cockpit-screen">
      {showTraining && (
        <TrainingOverlay role={role} onDismiss={dismissTraining} />
      )}

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
            {network === 'online'   ? '● LIVE'   : ''}
            {network === 'offline'  ? '● OFFLINE' : ''}
            {network === 'checking' ? '○ …'       : ''}
          </span>
          <button
            className="cockpit-help-btn"
            onClick={() => setShowTraining(true)}
            title="Open training guide"
          >?</button>
          <span className={`cockpit-role cockpit-role--${isSuperBoss ? 'superboss' : isBoss ? 'boss' : 'crew'}`}>
            {role}
          </span>
          {isSuperBoss && (
            <a
              className="cockpit-showpack-link"
              href={`${window.location.origin}${window.location.pathname}?showpack=${SHOWPACK_TOKEN}`}
              target="_blank" rel="noreferrer"
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
        prevState={prevState}
        stateEnteredAt={stateEnteredAt}
        onAdvance={canControl ? handleAdvance : undefined}
        onRetreat={canControl ? handleRetreat : undefined}
        onBossAdvance={canControl && !canAdvance && nextState
          ? () => { checkAllAndAdvance(); setViewingStateId(null) }
          : undefined}
        onNodeClick={id => setViewingStateId(id === currentStateId ? null : id)}
        canAdvance={canControl && canAdvance}
        blockingItems={blockingItems}
        isPreviewing={isPreviewing}
      />

      {/* Nonce panel — super boss only */}
      {isSuperBoss && (
        <div className="cockpit-nonce-panel">
          <span className="cockpit-modules-label">NONCE</span>
          {showNonce
            ? <span className="cockpit-nonce-value">{showNonce}</span>
            : <span className="cockpit-nonce-unset">NOT SET</span>
          }
          <button
            className="cockpit-nonce-btn"
            onClick={() => {
              const base = `${window.location.origin}${window.location.pathname}`
              generateNonce({
                gameBaseUrl: base,
                bossUrl:     `${base}?cockpit=${SUPER_TOKEN}`,
                crewUrl:     `${base}?cockpit=${CREW_TOKEN}`,
              })
            }}
          >
            {showNonce ? '↻ REGEN' : '⚡ GENERATE'}
          </button>
          {showNonce && (
            <>
              <span className="cockpit-nonce-url">
                {`${window.location.origin}${window.location.pathname}?n=${showNonce}`}
              </span>
              <a
                className="cockpit-showpack-link"
                href={`${window.location.origin}${window.location.pathname}?qr=1`}
                target="_blank" rel="noreferrer"
                title="Open QR slide"
              >
                QR SLIDE ↗
              </a>
            </>
          )}
        </div>
      )}

      {/* Modules panel — super boss only */}
      {isSuperBoss && (
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
          onToggle={isPreviewing || !canControl ? undefined : toggleCheckItem}
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
