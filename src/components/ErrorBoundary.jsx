import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#1a2f3a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          fontFamily: 'Courier New, monospace',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '24px' }}>🧠</div>
          <h1 style={{ color: '#e05c1a', fontSize: '1.5rem', marginBottom: '16px' }}>
            Something went wrong.
          </h1>
          <p style={{ color: 'rgba(245,245,240,0.6)', fontSize: '0.9rem', marginBottom: '32px' }}>
            {this.state.error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#00b8d9',
              color: '#1a2f3a',
              border: 'none',
              padding: '16px 32px',
              fontFamily: 'Courier New, monospace',
              fontWeight: 'bold',
              fontSize: '1rem',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
