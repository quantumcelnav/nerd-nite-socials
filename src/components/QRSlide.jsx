import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useEdition } from '../contexts/EditionContext'
import { getLiveUrl } from '../hooks/useNonce'
import { supabase, supabaseReady } from '../lib/supabase'

export default function QRSlide() {
  const { edition } = useEdition()
  const [showNonce, setShowNonce] = useState(null)

  useEffect(() => {
    if (!supabaseReady || !edition?.edition) return

    supabase
      .from('show_state')
      .select('show_nonce')
      .eq('edition', edition.edition)
      .single()
      .then(({ data }) => { if (data?.show_nonce) setShowNonce(data.show_nonce) })

    const channel = supabase
      .channel(`qr-nonce-${edition.edition}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'show_state', filter: `edition=eq.${edition.edition}` },
        ({ new: row }) => { if (row.show_nonce) setShowNonce(row.show_nonce) }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [edition?.edition])

  const liveUrl = getLiveUrl(edition, showNonce)

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
          Generate show nonce in the cockpit to enable the live leaderboard.
        </div>
      )}

      <div className="qr-tagline">Be there and be square</div>
    </div>
  )
}
