export function slideRunes(board, direction) {
  const next = Array(16).fill(0), motions = []
  let score = 0
  for (let line = 0; line < 4; line++) {
    const indices = Array.from({ length: 4 }, (_, n) => direction === 'left' ? line * 4 + n : direction === 'right' ? line * 4 + 3 - n : direction === 'up' ? n * 4 + line : (3 - n) * 4 + line)
    const values = indices.filter(i => board[i]).map(i => ({ value: board[i], from: i }))
    let destination = 0
    for (let j = 0; j < values.length; j++) {
      const current = values[j], target = indices[destination++]
      if (values[j + 1]?.value === current.value) {
        next[target] = current.value * 2; score += next[target]
        motions.push({ from: current.from, to: target }, { from: values[++j].from, to: target })
      } else { next[target] = current.value; motions.push({ from: current.from, to: target }) }
    }
  }
  return { board: next, score, motions, changed: next.some((v, i) => v !== board[i]) }
}
export const canSlide = board => ['left', 'right', 'up', 'down'].some(d => slideRunes(board, d).changed)
export function toggleCrystals(board, index) {
  return board.map((value, i) => Math.abs(i % 3 - index % 3) + Math.abs(Math.floor(i / 3) - Math.floor(index / 3)) <= 1 ? !value : value)
}
export function towerOverlap(previous, moving, axis) {
  const size = axis === 'x' ? 'width' : 'depth'
  const low = Math.max(previous[axis] - previous[size] / 2, moving[axis] - moving[size] / 2)
  const high = Math.min(previous[axis] + previous[size] / 2, moving[axis] + moving[size] / 2)
  return { ...moving, [axis]: (low + high) / 2, [size]: Math.max(0, high - low) }
}
