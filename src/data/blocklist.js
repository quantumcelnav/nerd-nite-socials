// Normalized slur blocklist — checked before leaderboard submission.
// Contains terms that are never acceptable regardless of context.
// General profanity is intentionally excluded (bar show audience).
// Each term is stored normalized: lowercase, alpha only.
// Matching checks if the normalized input CONTAINS any term as a substring.

const BLOCKED = new Set([
  // Racial slurs
  'nigger', 'nigga', 'niggr',
  'kike', 'kyke',
  'spick', 'spic',
  'chink',
  'wetback',
  'gook',
  'zipperhead',
  'towelhead', 'raghead',
  'beaner',
  'jigaboo',
  'porchmonkey',
  'sambo',
  'darkie',
  'junglebunny',

  // LGBTQ+ slurs
  'faggot', 'faget', 'fagot',
  'tranny',
  'shemale',

  // Ableist slurs
  'retard',

  // Nazi / hate symbols
  'heil',
  'sieg',
])

export function isBlocked(name) {
  const normalized = name.toLowerCase().replace(/[^a-z]/g, '')
  for (const term of BLOCKED) {
    const normTerm = term.replace(/[^a-z]/g, '')
    if (normalized.includes(normTerm)) return true
  }
  return false
}
