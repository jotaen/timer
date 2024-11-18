import { Item } from "./activity.ts"

export type Tick = {
  remaining: number
  activity: string
  readOut: boolean
  beep: number
}

export function* ticker(activities: Item[]): Generator<Tick> {
  for (let i = 0; i < activities.length; i++) {
    const item = activities[i]
    if (!item) {
      return
    }
    switch (item.kind) {
      case "LOOP":
        for (let r = item.repeat; r > 0; r--) {
          let items = [...item.activities]
          if (r === 1) {
            items = items.filter((it) => !it.skipLast)
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
            activity: item.title,
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

export function totalDuration(activities: Item[]): number {
  let result = 0
  let t = ticker(activities)
  while (!t.next().done) {
    result++
  }
  return result
}
