export type Item = Activity | Loop

export type Activity = {
  kind: "ACTIVITY"
  title: string
  duration: number
  skipLast: boolean
}

export type Loop = {
  kind: "LOOP"
  repeat: number
  items: Item[]
}

export type Program = {
  title: string
  items: Item[]
  createdAt: Date
}

// The longest total duration the clock display can show (99:59).
export const MAX_TOTAL_DURATION = 99 * 60 + 59
