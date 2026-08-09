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

  it("keeps nested loops in the last loop repetition", () => {
    const items: Item[] = [
      {
        kind: "LOOP",
        repeat: 2,
        items: [
          {
            kind: "LOOP",
            repeat: 2,
            items: [
              { kind: "ACTIVITY", title: "a", duration: 1, skipLast: false },
            ],
          },
          { kind: "ACTIVITY", title: "b", duration: 1, skipLast: true },
        ],
      },
    ]
    assert.strictEqual(totalDuration(items), 5)

    const sequence = [...ticker(items)].map((t) => t.currentActivity)
    assert.deepStrictEqual(sequence, ["a", "a", "b", "a", "a"])
  })

  it("produces a single 500ms-beep tick for a 1-second activity", () => {
    const items: Item[] = [
      { kind: "ACTIVITY", title: "a", duration: 1, skipLast: false },
    ]
    assert.strictEqual(totalDuration(items), 1)

    const tick = ticker(items)
    assertTick(tick.next(), {
      remaining: 1,
      currentActivity: "a",
      readOut: true,
      beep: 500,
    })
    assertTick(tick.next(), undefined)
  })

  it("skips over a loop with no items without hanging", () => {
    const items: Item[] = [
      { kind: "LOOP", repeat: 3, items: [] },
      { kind: "ACTIVITY", title: "after", duration: 1, skipLast: false },
    ]
    const sequence = [...ticker(items)].map((t) => t.currentActivity)
    assert.deepStrictEqual(sequence, ["after"])
  })

  it("can produce a negative total for a zero-repeat loop with a skip-last activity", () => {
    // `parse()` currently rejects `repeat: 0` before it ever reaches here
    // (see INVALID_REPETITIONS), so this is a latent rather than a presently
    // reachable defect. This test documents the current behaviour so that a
    // future change to `totalDuration()` has to touch it deliberately.
    const items: Item[] = [
      {
        kind: "LOOP",
        repeat: 0,
        items: [{ kind: "ACTIVITY", title: "a", duration: 5, skipLast: true }],
      },
    ]
    assert.strictEqual(totalDuration(items), -5)
  })
})
