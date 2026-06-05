import { useReducer, useEffect } from 'react'
import data from '../data/ontology.json'
import '../ontology.css'

const POINTS_PER_CORRECT = 100
const MAX_SCORE = data.concepts.length * POINTS_PER_CORRECT

const initialState = {
  phase: 'intro',      // intro | guess | reveal | complete
  conceptIdx: 0,
  playerGuess: null,
  revealStep: 0,       // which clue is currently showing
  score: 0,
  results: [],         // { correct: bool } per concept
}

function reducer(state, action) {
  const concept = data.concepts[state.conceptIdx]

  switch (action.type) {
    case 'START':
      return { ...state, phase: 'guess' }

    case 'GUESS': {
      const correct = action.category === concept.category
      return {
        ...state,
        phase: 'reveal',
        playerGuess: action.category,
        revealStep: 0,
        score: correct ? state.score + POINTS_PER_CORRECT : state.score,
        results: [...state.results, { correct }],
      }
    }

    case 'NEXT_CLUE':
      return { ...state, revealStep: state.revealStep + 1 }

    case 'NEXT_CONCEPT': {
      const next = state.conceptIdx + 1
      if (next >= data.concepts.length) return { ...state, phase: 'complete' }
      return { ...state, phase: 'guess', conceptIdx: next, playerGuess: null, revealStep: 0 }
    }

    default:
      return state
  }
}

export default function OntologyGame({ onComplete }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { phase, conceptIdx, playerGuess, revealStep, score, results } = state
  const concept = data.concepts[conceptIdx]

  useEffect(() => {
    if (phase === 'complete') onComplete(score, MAX_SCORE)
  }, [phase]) // eslint-disable-line

  if (phase === 'intro') {
    return (
      <div className="onto-intro screen-enter">
        <div className="onto-intro-card">
          <div className="onto-kicker">What Is It?</div>
          <h1 className="onto-intro-title">The Ontology Game</h1>
          <p className="onto-intro-text">{data.intro}</p>
          <div className="onto-categories-preview">
            {Object.values(data.categories).map(c => (
              <div key={c.label} className="onto-cat-preview">
                <span className="onto-cat-icon">{c.icon}</span>
                <span className="onto-cat-label">{c.label}</span>
              </div>
            ))}
          </div>
          <button className="onto-start-btn" onClick={() => dispatch({ type: 'START' })}>
            Begin — {data.concepts.length} Concepts
          </button>
          <div className="onto-credit">
            <em>Presented by Justin Fritz, Nerd Nite Fort Collins Boss</em>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'guess') {
    return (
      <div className="onto-guess screen-enter">
        <div className="onto-progress">
          {data.concepts.map((_, i) => (
            <div key={i} className={`onto-pip ${
              i < results.length ? (results[i].correct ? 'pip-correct' : 'pip-wrong') :
              i === conceptIdx ? 'pip-current' : 'pip-empty'
            }`} />
          ))}
        </div>

        <div className="onto-concept-card">
          <div className="onto-concept-hook">{concept.hook}</div>
          <div className="onto-concept-name">{concept.concept}</div>
        </div>

        <div className="onto-question">What kind of thing is this?</div>

        <div className="onto-category-grid">
          {Object.entries(data.categories).map(([key, cat]) => (
            <button key={key} className="onto-cat-btn"
              onClick={() => dispatch({ type: 'GUESS', category: key })}
              aria-label={`${cat.label}: ${cat.description}`}>
              <span className="onto-cat-btn-icon">{cat.icon}</span>
              <span className="onto-cat-btn-label">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (phase === 'reveal') {
    const correct = playerGuess === concept.category
    const correctCat = data.categories[concept.category]
    const guessCat = data.categories[playerGuess]
    const allCluesShown = revealStep >= concept.clues.length

    return (
      <div className="onto-reveal screen-enter">
        <div className={`onto-verdict ${correct ? 'verdict-correct' : 'verdict-wrong'}`}>
          <span className="verdict-icon">{correct ? '✓' : '✗'}</span>
          <div className="verdict-text">
            {correct
              ? `Yes — it's a ${correctCat.label} ${correctCat.icon}`
              : `Not quite. You said ${guessCat.label} ${guessCat.icon} — it's a ${correctCat.label} ${correctCat.icon}`}
          </div>
        </div>

        <div className="onto-clues">
          <div className="onto-clues-label">Here's why:</div>
          {concept.clues.slice(0, revealStep + 1).map((clue, i) => (
            <div key={i} className={`onto-clue clue-enter ${clue.answer ? 'clue-true' : 'clue-false'}`}>
              <span className="clue-mark">{clue.answer ? '✓' : '✗'}</span>
              <span className="clue-text">{clue.statement}</span>
            </div>
          ))}
        </div>

        {!allCluesShown ? (
          <button className="onto-next-clue-btn"
            onClick={() => dispatch({ type: 'NEXT_CLUE' })}>
            Next clue →
          </button>
        ) : (
          <>
            <div className="onto-explanation">{concept.explanation}</div>
            <div className="onto-funfact">
              <span className="funfact-label">Fun Fact</span>
              {concept.funFact}
            </div>
            <button className="onto-continue-btn"
              onClick={() => dispatch({ type: 'NEXT_CONCEPT' })}>
              {conceptIdx < data.concepts.length - 1
                ? `Next Concept (${conceptIdx + 2} / ${data.concepts.length}) →`
                : 'See My Score →'}
            </button>
          </>
        )}
      </div>
    )
  }

  return null
}
