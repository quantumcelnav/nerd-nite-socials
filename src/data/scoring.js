export const POINTS = { 1: 100, 2: 300, 3: 900 }

export const DIFFICULTY_LABEL = {
  1: 'Accessible',
  2: 'Nerdy',
  3: 'Deep Cut',
}

export const TIERS = [
  { min: 97, label: 'Nerd Nite Boss',     color: '#f5c518' },
  { min: 89, label: 'Nerd Nite Regular',  color: '#e05c1a' },
  { min: 76, label: 'Distinguished Nerd', color: '#e05c1a' },
  { min: 61, label: 'Certified Nerd',     color: '#00b8d9' },
  { min: 41, label: 'Genuine Nerd',       color: '#00b8d9' },
  { min: 21, label: 'Apprentice Nerd',    color: '#f5f5f0' },
  { min: 0,  label: 'Curious Muggle',     color: '#888'    },
]

export function getTier(pct) {
  return TIERS.find(t => pct >= t.min)
}

export function calcMaxScore(talks) {
  return talks.reduce((sum, talk) =>
    sum + talk.questions.reduce((s, q) => s + POINTS[q.difficulty], 0), 0)
}
