import { useEffect, useRef, useState } from 'react'

function fmtTime(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function CommsChannel({ comms, onSend, senderName, onSenderChange }) {
  const [draft, setDraft] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comms.length])

  function submit(e) {
    e.preventDefault()
    if (!draft.trim() || !senderName.trim()) return
    onSend(senderName, draft)
    setDraft('')
  }

  return (
    <div className="comms-panel">
      <h2 className="comms-heading">COMMS</h2>

      {!senderName && (
        <div className="comms-identity">
          <input
            className="comms-name-input"
            placeholder="Your name (Justin, Jamie, Hannah…)"
            onBlur={e => onSenderChange(e.target.value.trim())}
            onKeyDown={e => e.key === 'Enter' && onSenderChange(e.target.value.trim())}
          />
        </div>
      )}

      <div className="comms-log">
        {comms.length === 0 && (
          <p className="comms-empty">No messages yet.</p>
        )}
        {comms.map(msg => (
          <div key={msg.id} className="comms-msg">
            <span className="comms-time">{fmtTime(msg.created_at)}</span>
            <span className="comms-sender">{msg.sender}</span>
            <span className="comms-text">{msg.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form className="comms-form" onSubmit={submit}>
        <input
          className="comms-input"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder={senderName ? 'Message…' : 'Set your name first'}
          disabled={!senderName}
          maxLength={280}
        />
        <button className="comms-send" type="submit" disabled={!draft.trim() || !senderName}>
          SEND
        </button>
      </form>
    </div>
  )
}
