import { useState } from 'react'
import { useEdition } from '../contexts/EditionContext'
import { useCockpit } from '../hooks/useCockpit'
import { getState } from '../data/nnStates'
import StateMachine from './StateMachine'
import ChecklistPanel from './ChecklistPanel'
import CommsChannel from './CommsChannel'
import '../cockpit.css'

const COCKPIT_TOKEN = import.meta.env.VITE_COCKPIT_TOKEN

export default function Cockpit({ token }) {
  const { edition } = useEdition()
  const slug = edition?.edition
  const {
    allStates, currentState, currentStateId, currentStateIdx,
    nextState, stateEnteredAt, checklist, comms,
    advanceState, toggleCheckItem, sendMessage,
    canAdvance, blockingItems,
  } = useCockpit(slug)

  const isBoss = COCKPIT_TOKEN && token === COCKPIT_TOKEN

  // viewingStateId: what checklist the boss is looking at (may differ from live state)
  const [viewingStateId, setViewingStateId] = useState(null)
  const activeViewId    = viewingStateId ?? currentStateId
  const viewingState    = getState(activeViewId)
  const isPreviewing    = viewingStateId !== null && viewingStateId !== currentStateId

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
    // snap view back to live state after advancing
    setViewingStateId(null)
  }

  function handleNodeClick(stateId) {
    // clicking the live node snaps back to live view
    setViewingStateId(stateId === currentStateId ? null : stateId)
  }

  return (
    <div className="cockpit-screen">
      <div className="cockpit-header">
        <span className="cockpit-edition">{slug ?? '—'}</span>
        <span className="cockpit-title">COCKPIT</span>
        <span className={`cockpit-role ${isBoss ? 'cockpit-role--boss' : 'cockpit-role--crew'}`}>
          {isBoss ? 'BOSS' : 'CREW'}
        </span>
      </div>

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
