// Swap any of these Giphy IDs for different themed GIFs
// Format: https://media.giphy.com/media/{ID}/giphy.gif

const g = (id) => `https://media.giphy.com/media/${id}/giphy.gif`

export const correctGifs = [
  g('RsMipRng2PZ3o3Io70'),  // Big Brain genius moment
  g('JBb8TKeKpt8ac'),       // World Science Festival — big ideas lightbulb
  g('2hgwdmoHwa69YfXIY5'),  // Star Trek nerds celebrate
]

export const wrongGifs = [
  g('9GIhVdHNl4l2oD2ZYA'),  // Because Science — epic fail
  g('6FusVE1LM1QeR2tNkm'),  // Nerd facepalm (tabletop RPG)
  g('Vd7yF8C91htFU7FpRP'),  // Because Science — oops/oh no
]

export function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}
