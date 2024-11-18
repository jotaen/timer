export function formatClock(seconds: number): string {
  const minutePart = Math.floor(seconds / 60)
  const secondPart = seconds % 60
  return (
    minutePart.toString().padStart(2, "0") +
    ":" +
    secondPart.toString().padStart(2, "0")
  )
}
