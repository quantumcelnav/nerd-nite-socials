import { QRCodeSVG } from 'qrcode.react'
import { useEdition } from '../contexts/EditionContext'
import { getLiveUrl } from '../hooks/useNonce'

export default function QRSlide() {
  const { edition } = useEdition()
  const liveUrl = getLiveUrl(edition)

  return (
    <div className="qr-slide">
      <div className="qr-header">
        <div className="qr-nite">NERD NITE FORT COLLINS</div>
        <div className="qr-edition">{edition?.edition}</div>
      </div>

      <div className="qr-cta">Play along &amp; get on the leaderboard</div>

      {liveUrl ? (
        <>
          <div className="qr-code-wrap">
            <QRCodeSVG
              value={liveUrl}
              size={340}
              bgColor="#002A37"
              fgColor="#13DAF9"
              level="M"
            />
          </div>
          <div className="qr-url">{liveUrl}</div>
        </>
      ) : (
        <div className="qr-missing">
          Set a nonce in edition.json to enable the live leaderboard.
        </div>
      )}

      <div className="qr-tagline">Be there and be square</div>
    </div>
  )
}
