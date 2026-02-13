export function formatClock(seconds?: number): string {
  if (!seconds) {
    return "--:--"
  }
  const minutePart = Math.floor(seconds / 60)
  const secondPart = seconds % 60
  return (
    minutePart.toString().padStart(2, "0") +
    ":" +
    secondPart.toString().padStart(2, "0")
  )
}
