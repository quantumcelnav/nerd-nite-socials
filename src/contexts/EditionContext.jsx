import { createContext, useContext, useEffect, useState } from 'react'
import fallback from '../data/edition.json'

const EditionContext = createContext(null)

export function EditionProvider({ slug, children }) {
  const [edition, setEdition] = useState(null)
  const [loading, setLoading] = useState(true)
  const [allEditions, setAllEditions] = useState([]) // [{slug, label}]

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const idxRes = await fetch('/editions/index.json')
        const editions = await idxRes.json()
        if (!cancelled) setAllEditions(editions)

        const target = slug ?? editions[0].slug
        const res = await fetch(`/editions/${target}.json`)
        if (!res.ok) throw new Error('not found')
        const data = await res.json()
        if (!cancelled) { setEdition(data); setLoading(false) }
      } catch {
        if (!cancelled) { setEdition(fallback); setLoading(false) }
      }
    }

    load()
    return () => { cancelled = true }
  }, [slug])

  return (
    <EditionContext.Provider value={{ edition, loading, allEditions }}>
      {children}
    </EditionContext.Provider>
  )
}

export function useEdition() {
  return useContext(EditionContext)
}
