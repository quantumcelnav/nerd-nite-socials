import { QRCodeSVG } from 'qrcode.react'
import { getLiveUrl } from '../hooks/useNonce'
import edition from '../data/edition.json'

export default function QRSlide() {
  const liveUrl = getLiveUrl()

  return (
    <div className="qr-slide">
      <div className="qr-header">
        <div className="qr-nite">NERD NITE FORT COLLINS</div>
        <div className="qr-edition">{edition.edition}</div>
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
          Set VITE_SHOW_NONCE in Vercel environment variables and redeploy.
        </div>
      )}

      <div className="qr-tagline">Be there and be square</div>
    </div>
  )
}
