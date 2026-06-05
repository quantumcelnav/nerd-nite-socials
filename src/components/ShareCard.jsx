import '../game.css'

export default function ShareCard({ pct, tier, mode, onShare }) {
  async function handleShare() {
    const text = `I scored ${pct}% on Nerdometer — "${tier.label}" 🧠\nNerd Nite Fort Collins trivia. How nerdy are you?`
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Nerdometer', text, url })
      } catch {
        // user cancelled or API unavailable — fall through to clipboard
        await navigator.clipboard.writeText(`${text}\n${url}`)
        onShare('copied')
      }
    } else {
      await navigator.clipboard.writeText(`${text}\n${url}`)
      onShare('copied')
    }
  }

  return (
    <button className="share-btn" onClick={handleShare}
      aria-label="Share your score">
      Share My Score ↗
    </button>
  )
}
