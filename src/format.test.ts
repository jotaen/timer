import assert from "assert"
import { formatClock } from "./format.ts"

describe("format()", () => {
  it("seralises 0", () => {
    assert.strictEqual(formatClock(0), "--:--")
  })

  it("seralises time", () => {
    assert.strictEqual(formatClock(1), "00:01")
    assert.strictEqual(formatClock(45), "00:45")
    assert.strictEqual(formatClock(59), "00:59")
    assert.strictEqual(formatClock(60), "01:00")
    assert.strictEqual(formatClock(119), "01:59")
    assert.strictEqual(formatClock(60 * 60), "60:00")
    assert.strictEqual(formatClock(99 * 60 + 59), "99:59")
  })

  it("cannot serialise unrepresentable time", () => {
    assert.strictEqual(formatClock(99 * 60 + 60), "??:??")
    assert.strictEqual(formatClock(99 * 60 + 61), "??:??")
    assert.strictEqual(formatClock(12984728), "??:??")
    assert.strictEqual(formatClock(-1), "??:??")
  })
})
