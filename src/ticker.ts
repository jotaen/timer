import { Item } from "./program.ts"

export type Tick = {
  remaining: number
  currentActivity: string
  readOut: boolean
  beep: number
}

export function* ticker(items: Item[]): Generator<Tick> {
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (!item) {
      return
    }
    switch (item.kind) {
      case "LOOP":
        for (let r = item.repeat; r > 0; r--) {
          let items = [...item.items]
          if (r === 1) {
            items = items.filter(
              (it) => !(it.kind === "ACTIVITY" && it.skipLast),
            )
          }
          yield* ticker(items)
        }
        break
      case "ACTIVITY":
        let remaining = item.duration
        let isFirstTick = true
        while (remaining > 0) {
          yield {
            remaining,
            currentActivity: item.title,
            readOut: isFirstTick,
            beep:
              {
                3: 120,
                2: 120,
                1: 500,
              }[remaining] || 0,
          }
          isFirstTick = false
          remaining--
        }
        break
    }
  }
}

export function totalDuration(items: Item[]): number {
  let result = 0
  for (const item of items) {
    switch (item.kind) {
      case "ACTIVITY":
        result += item.duration
        break
      case "LOOP":
        const round = totalDuration(item.items)
        const skippedInLastRound = item.items.reduce(
          (sum, it) =>
            sum + (it.kind === "ACTIVITY" && it.skipLast ? it.duration : 0),
          0,
        )
        result += item.repeat * round - skippedInLastRound
        break
    }
  }
  return result
}
