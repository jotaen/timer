import assert from "assert"
import { recognizeIndents, regex, tokenize } from "./lexer.ts"
import { describe } from "mocha"

describe("lexer", () => {
  it("matches", () => {
    const match = `
0:01 Get ready!
2x
    0:02         0:02      Work out
    0:03* Rest
`.matchAll(regex)
    const matchArray = Array.from(match)
    assert.notStrictEqual(match, null)
  })

  const tokenKindTestData: [string, string, string[]][] = [
    ["time", "0:01", ["TIME"]],
    ["time long", "00:10", ["TIME"]],
    ["newline", "\n", ["NEWLINE"]],
    ["newline with 1 indent", "\n    ", ["NEWLINE"]],
    ["newline with too short indent", "\n  ", ["NEWLINE"]],
    ["newline with 2 indents", "\n        ", ["NEWLINE"]],
    [
      "complex example",
      `
0:01 Get ready!
2x
    0:02         0:02      Work out
    0:03* Rest
`,
      [
        "NEWLINE",
        "TIME",
        "MESSAGE",
        "NEWLINE",
        "LOOP",
        "NEWLINE",
        "TIME",
        "MESSAGE",
        "NEWLINE",
        "TIME",
        "SKIP",
        "MESSAGE",
        "NEWLINE",
      ],
    ],
  ]

  tokenKindTestData.map(([name, input, expectedKinds]) => {
    it(`should return the right kinds for ${name}`, () => {
      const tokens = Array.from(tokenize(input))
      const kinds = tokens.map((t) => t.kind)
      assert.deepStrictEqual(kinds, expectedKinds)
    })
  })

  const indentationDepthTestData: [string, string, number][] = [
    ["no spaces", "\n", 0],
    ["2 spaces", "\n  ", 2],
    ["4 spaces", "\n    ", 4],
  ]

  indentationDepthTestData.map(([name, input, expectedDepth]) => {
    it(`should add the indentationDepth correctly for ${name}`, () => {
      const tokens = Array.from(tokenize(input))
      const depth = tokens.map((t) =>
        t.kind === "NEWLINE" ? t.indentationDepth : -1,
      )
      assert.strictEqual(depth.length, 1)
      assert.strictEqual(depth[0], expectedDepth)
    })
  })

  const indentDedentTestData: [string, string, string[]][] = [
    ["1 indent", "\n  ", ["NEWLINE", "INDENT"]],
    [
      "1 indent and dedent",
      "\n  \n",
      ["NEWLINE", "INDENT", "DEDENT", "NEWLINE"],
    ],
    [
      "2 indents",
      "\n  \n    \n  ",
      ["NEWLINE", "INDENT", "NEWLINE", "INDENT", "DEDENT", "NEWLINE"],
    ],
    [
      "...1",
      "\n    \n        0:01\n    \n",
      [
        "NEWLINE",
        "INDENT",
        "NEWLINE",
        "INDENT",
        "TIME",
        "DEDENT",
        "NEWLINE",
        "DEDENT",
        "NEWLINE",
      ],
    ],
    [
      "...2",
      "\n \n   \n  \n \n",
      [
        "NEWLINE",
        "INDENT",
        "NEWLINE",
        "INDENT",
        "INCORRECT_DEDENT",
        "NEWLINE",
        "DEDENT",
        "NEWLINE",
      ],
    ],
  ]

  indentDedentTestData.map(([name, input, expectedKinds]) => {
    it(`should should detect indents and dedents for ${name}`, () => {
      const tokens = Array.from(recognizeIndents(tokenize(input)))
      const kinds = tokens.map((t) => t.kind)
      assert.deepStrictEqual(kinds, expectedKinds)
    })
  })
})
