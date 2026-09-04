export function getRectangleSeatPositions(
  tableWidth: number,
  tableHeight: number,
  seatOffset: number,
): { x: number; y: number }[] {
  // Top/bottom are the long sides, left/right the short sides.
  const sides = [6, 1, 6, 1]

  const positions: { x: number; y: number }[] = []
  const halfW = tableWidth / 2
  const halfH = tableHeight / 2

  // Top — left to right
  for (let i = 0; i < sides[0]; i++) {
    const t = sides[0] === 1 ? 0.5 : i / (sides[0] - 1)
    positions.push({ x: -halfW + t * tableWidth, y: -halfH - seatOffset })
  }

  // Right — top to bottom
  for (let i = 0; i < sides[1]; i++) {
    const t = sides[1] === 1 ? 0.5 : i / (sides[1] - 1)
    positions.push({ x: halfW + seatOffset, y: -halfH + t * tableHeight })
  }

  // Bottom — right to left
  for (let i = 0; i < sides[2]; i++) {
    const t = sides[2] === 1 ? 0.5 : i / (sides[2] - 1)
    positions.push({ x: halfW - t * tableWidth, y: halfH + seatOffset })
  }

  // Left — bottom to top
  for (let i = 0; i < sides[3]; i++) {
    const t = sides[3] === 1 ? 0.5 : i / (sides[3] - 1)
    positions.push({ x: -halfW - seatOffset, y: halfH - t * tableHeight })
  }

  return positions
}
