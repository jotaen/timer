import assert from "assert"
import { describe } from "mocha"
import { parse } from "./parse.ts"

describe("parse", () => {
  it("should parse some input", () => {
    const input = `
0:05 Get ready!
2x
    0:05 Work out
    0:05*     Rest
`
    const result = parse(input)

    const expectedItems = [
      { kind: "ACTIVITY", duration: 5, title: "Get ready!", skipLast: false },
      {
        kind: "LOOP",
        repeat: 2,
        items: [
          { kind: "ACTIVITY", duration: 5, title: "Work out", skipLast: false },
          { kind: "ACTIVITY", duration: 5, title: "Work out", skipLast: true },
        ],
      },
    ]

    assert.deepStrictEqual(result, expectedItems)
  })
})
