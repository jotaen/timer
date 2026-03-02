export function formatClock(seconds?: number): string {
  if (!seconds) {
    return "--:--"
  }
  if (seconds >= 99 * 60 + 60 || seconds < 0) {
    return "??:??"
  }
  const minutePart = Math.floor(seconds / 60)
  const secondPart = seconds % 60
  return (
    minutePart.toString().padStart(2, "0") +
    ":" +
    secondPart.toString().padStart(2, "0")
  )
}
