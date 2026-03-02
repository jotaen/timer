import assert from "assert"
import { Tick, ticker, totalDuration } from "./ticker.ts"
import { Item } from "./program.ts"

function assertTick(t: IteratorResult<Tick>, expected?: Tick) {
  if (!expected) {
    assert.strictEqual(t.done, true)
    assert.strictEqual(t.value, undefined)
  } else {
    assert.strictEqual(t.done, false, JSON.stringify(expected))
    assert.deepStrictEqual(t.value, expected, JSON.stringify(expected))
  }
}

describe("ticker*()", () => {
  it("is empty for empty program", () => {
    const items: Item[] = []
    assert.strictEqual(totalDuration(items), 0)

    const tick = ticker(items)
    assertTick(tick.next(), undefined)
  })

  it("produces tick for every second", () => {
    const items: Item[] = [
      { kind: "ACTIVITY", title: "a", duration: 5, skipLast: false },
      {
        kind: "LOOP",
        repeat: 2,
        items: [
          { kind: "ACTIVITY", title: "b", duration: 4, skipLast: false },
          { kind: "ACTIVITY", title: "c", duration: 2, skipLast: true },
        ],
      },
    ]
    assert.strictEqual(totalDuration(items), 15)

    const tick = ticker(items)
    assertTick(tick.next(), {
      remaining: 5,
      currentActivity: "a",
      readOut: true,
      beep: 0,
    })
    assertTick(tick.next(), {
      remaining: 4,
      currentActivity: "a",
      readOut: false,
      beep: 0,
    })
    assertTick(tick.next(), {
      remaining: 3,
      currentActivity: "a",
      readOut: false,
      beep: 120,
    })
    assertTick(tick.next(), {
      remaining: 2,
      currentActivity: "a",
      readOut: false,
      beep: 120,
    })
    assertTick(tick.next(), {
      remaining: 1,
      currentActivity: "a",
      readOut: false,
      beep: 500,
    })
    assertTick(tick.next(), {
      remaining: 4,
      currentActivity: "b",
      readOut: true,
      beep: 0,
    })
    assertTick(tick.next(), {
      remaining: 3,
      currentActivity: "b",
      readOut: false,
      beep: 120,
    })
    assertTick(tick.next(), {
      remaining: 2,
      currentActivity: "b",
      readOut: false,
      beep: 120,
    })
    assertTick(tick.next(), {
      remaining: 1,
      currentActivity: "b",
      readOut: false,
      beep: 500,
    })
    assertTick(tick.next(), {
      remaining: 2,
      currentActivity: "c",
      readOut: true,
      beep: 120,
    })
    assertTick(tick.next(), {
      remaining: 1,
      currentActivity: "c",
      readOut: false,
      beep: 500,
    })
    assertTick(tick.next(), {
      remaining: 4,
      currentActivity: "b",
      readOut: true,
      beep: 0,
    })
    assertTick(tick.next(), {
      remaining: 3,
      currentActivity: "b",
      readOut: false,
      beep: 120,
    })
    assertTick(tick.next(), {
      remaining: 2,
      currentActivity: "b",
      readOut: false,
      beep: 120,
    })
    assertTick(tick.next(), {
      remaining: 1,
      currentActivity: "b",
      readOut: false,
      beep: 500,
    })
    assertTick(tick.next(), undefined)
  })
})
