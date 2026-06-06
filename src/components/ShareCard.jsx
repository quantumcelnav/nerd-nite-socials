import '../game.css'

export default function ShareCard({ pct, tier, mode, onShare }) {
  async function handleShare() {
    const text = `I scored ${pct}% on Nerdometer — "${tier.label}" 🧠\nNerd Nite Fort Collins trivia. How nerdy are you?`
    // Strip nonce param so the shared URL is the clean public homepage
    const clean = new URL(window.location.href)
    clean.searchParams.delete('n')
    const url = clean.toString()

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
