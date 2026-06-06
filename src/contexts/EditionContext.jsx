import { createContext, useContext, useEffect, useState } from 'react'
import fallback from '../data/edition.json'

const EditionContext = createContext(null)

export function EditionProvider({ slug, children }) {
  const [edition, setEdition] = useState(null)
  const [loading, setLoading] = useState(true)
  const [allSlugs, setAllSlugs] = useState([])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const idxRes = await fetch('/editions/index.json')
        const slugs = await idxRes.json()
        if (!cancelled) setAllSlugs(slugs)

        const target = slug ?? slugs[0]
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
    <EditionContext.Provider value={{ edition, loading, allSlugs }}>
      {children}
    </EditionContext.Provider>
  )
}

export function useEdition() {
  return useContext(EditionContext)
}
