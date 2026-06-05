import { useState } from 'react'
import edition from '../data/edition.json'
import { correctGifs, wrongGifs, pickRandom } from '../data/reactions'
import { POINTS, DIFFICULTY_LABEL, calcMaxScore } from '../data/scoring'
import ReactionGif from './ReactionGif'
import '../game.css'

export default function Game({ onComplete }) {
  const [phase, setPhase] = useState('origin')
  const [talkIdx, setTalkIdx] = useState(0)
  const [questionIdx, setQuestionIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState(null)
  const [isCorrect, setIsCorrect] = useState(false)
  const [reactionGif, setReactionGif] = useState(null)

  const talk = edition.talks[talkIdx]
  const question = talk?.questions[questionIdx]
  const totalQuestions = edition.talks.reduce((s, t) => s + t.questions.length, 0)
  const answeredSoFar = edition.talks
    .slice(0, talkIdx)
    .reduce((s, t) => s + t.questions.length, 0) + questionIdx

  function handleOriginNext() {
    setPhase('question')
  }

  function handleAnswer(idx) {
    if (phase !== 'question') return
    const correct = idx === question.answer
    setSelected(idx)
    setIsCorrect(correct)
    setReactionGif(pickRandom(correct ? correctGifs : wrongGifs))
    if (correct) setScore(s => s + POINTS[question.difficulty])
    setPhase('result')
  }

  function handleNext() {
    const isLastQuestion = questionIdx >= talk.questions.length - 1
    const isLastTalk = talkIdx >= edition.talks.length - 1

    if (!isLastQuestion) {
      setSelected(null)
      setQuestionIdx(q => q + 1)
      setPhase('question')
      return
    }

    if (!isLastTalk) {
      const next = talkIdx + 1
      setTalkIdx(next)
      setQuestionIdx(0)
      setSelected(null)
      setPhase(edition.originStory[next] ? 'origin' : 'question')
      return
    }

    // all talks done
    const outro = edition.originStory[edition.talks.length]
    setPhase(outro ? 'outro' : 'done')
  }

  const maxScore = calcMaxScore(edition.talks)

  if (phase === 'outro') {
    return (
      <OriginCard
        text={edition.originStory[edition.talks.length].text}
        label="— Nerd Nite —"
        btnLabel="See My Score"
        onNext={() => onComplete(score, maxScore)}
      />
    )
  }

  if (phase === 'origin') {
    const seg = edition.originStory[talkIdx]
    return (
      <OriginCard
        text={seg?.text}
        label="— The Origin Story —"
        btnLabel={`Start Round ${talkIdx + 1}: ${talk.title}`}
        onNext={handleOriginNext}
      />
    )
  }

  return (
    <div className="game-screen">
      <div className="game-topbar">
        <div className="game-progress-bar">
          <div
            className="game-progress-fill"
            style={{ width: `${(answeredSoFar / totalQuestions) * 100}%` }}
          />
        </div>
        <div className="game-meta">
          <span className="game-talk-label">
            Round {talkIdx + 1}: <em>{talk.speaker}</em>
          </span>
          <span className="game-score">{score} pts</span>
        </div>
      </div>

      <div className="question-card">
        <div className="question-meta">
          <span>Q{questionIdx + 1} of {talk.questions.length}</span>
          <span className={`difficulty-badge diff-${question.difficulty}`}>
            {DIFFICULTY_LABEL[question.difficulty]}
          </span>
        </div>
        <p className="question-text">{question.question}</p>
      </div>

      <div className="answer-grid">
        {question.options.map((opt, i) => {
          let cls = 'answer-btn'
          if (phase === 'result') {
            if (i === question.answer) cls += ' correct'
            else if (i === selected) cls += ' wrong'
            else cls += ' dimmed'
          }
          return (
            <button
              key={i}
              className={cls}
              onClick={() => handleAnswer(i)}
              disabled={phase === 'result'}
            >
              {opt}
            </button>
          )
        })}
      </div>

      {phase === 'result' && (
        <>
          <ReactionGif src={reactionGif} isCorrect={isCorrect} />
          <div className="result-bar">
            <span className={isCorrect ? 'result-correct' : 'result-wrong'}>
              {isCorrect ? `✓ Correct! +${POINTS[question.difficulty]} pts` : `✗ Not quite!`}
            </span>
            <button className="next-btn" onClick={handleNext}>
              {questionIdx < talk.questions.length - 1
                ? 'Next Question →'
                : talkIdx < edition.talks.length - 1
                ? 'Next Round →'
                : 'Finish →'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function OriginCard({ text, label, btnLabel, onNext }) {
  return (
    <div className="origin-screen">
      <div className="origin-card">
        <div className="origin-label">{label}</div>
        <p className="origin-text">{text}</p>
      </div>
      <button className="origin-btn" onClick={onNext}>{btnLabel}</button>
    </div>
  )
}
