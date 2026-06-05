export default function ReactionGif({ src, isCorrect }) {
  return (
    <div className={`reaction-gif-wrap ${isCorrect ? 'reaction-correct' : 'reaction-wrong'}`}>
      <img
        src={src}
        alt={isCorrect ? 'Correct!' : 'Wrong!'}
        className="reaction-gif"
      />
    </div>
  )
}
