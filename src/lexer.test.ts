import { tokenize, tokenizeRaw } from "./lexer.ts"
import assert from "assert"
import { describe } from "mocha"

type Test<T> = [name: string, input: string, T]

describe("lexer", () => {
  describe("tokenize correct programs", () => {
    const tokenKindTestData: Test<string[]>[] = [
      ["time", "0:01", ["TIME"]],
      ["time long", "00:10", ["TIME"]],
      ["newline", "\n", ["NEWLINE"]],
      ["newline with indent", "\n    ", ["NEWLINE", "INDENT"]],
      ["newline with short indent", "\n  ", ["NEWLINE", "INDENT"]],
      ["newline with long indent", "\n        ", ["NEWLINE", "INDENT"]],
      [
        "complex example",
        `
0:01 Get ready!
2x
    0:02 Work out
    0:03* Rest
`,
        [
          "NEWLINE",
          "TIME",
          "MESSAGE",
          "NEWLINE",
          "LOOP",
          "NEWLINE",
          "INDENT",
          "TIME",
          "MESSAGE",
          "NEWLINE",
          "TIME",
          "SKIP",
          "MESSAGE",
          "NEWLINE",
          "DEDENT",
        ],
      ],
    ]

    tokenKindTestData.forEach(([name, input, expectedKinds]) => {
      it(name, () => {
        const tokens = Array.from(tokenize(input))
        const kinds = tokens.map((t) => t.kind)
        assert.deepStrictEqual(kinds, expectedKinds)
      })
    })
  })

  describe("recognize indentation depth", () => {
    const indentationDepthTestData: Test<number>[] = [
      ["no spaces", "\n", 0],
      ["2 spaces", "\n  ", 2],
      ["4 spaces", "\n    ", 4],
    ]

    indentationDepthTestData.forEach(([name, input, expectedDepth]) => {
      it(name, () => {
        const tokens = Array.from(tokenizeRaw(input))
        const depth = tokens.map((t) =>
          t.kind === "NEWLINE" ? t.indentationDepth : -1,
        )
        assert.strictEqual(depth.length, 1)
        assert.strictEqual(depth[0], expectedDepth)
      })
    })
  })

  describe("emit indent and dedent tokens", () => {
    const indentDedentTestData: [string, string, string[]][] = [
      ["1 indent", "\n  ", ["NEWLINE", "INDENT"]],
      [
        "1 indent and dedent",
        "\n  \n",
        ["NEWLINE", "INDENT", "NEWLINE", "DEDENT"],
      ],
      [
        "2 indents",
        "\n  \n    \n  ",
        ["NEWLINE", "INDENT", "NEWLINE", "INDENT", "NEWLINE", "DEDENT"],
      ],
      [
        "dedent with time",
        "\n    \n        0:01\n    \n",
        [
          "NEWLINE",
          "INDENT",
          "NEWLINE",
          "INDENT",
          "TIME",
          "NEWLINE",
          "DEDENT",
          "NEWLINE",
          "DEDENT",
        ],
      ],
      // TODO
      // [
      //   "incorrect dedent",
      //   "\n \n   \n  \n \n",
      //   [
      //     "NEWLINE",
      //     "INDENT",
      //     "NEWLINE",
      //     "INDENT",
      //     "NEWLINE",
      //     "INCORRECT_DEDENT",
      //     "NEWLINE",
      //     "DEDENT",
      //     "NEWLINE",
      //   ],
      // ],
      [
        "double dedent",
        "\n \n  \n",
        [
          "NEWLINE",
          "INDENT",
          "NEWLINE",
          "INDENT",
          "NEWLINE",
          "DEDENT",
          "DEDENT",
        ],
      ],
      [
        "complex",
        `
0:05 Get ready!
2x
    0:05 Work out
    0:05*    Rest
`,
        [
          "NEWLINE",
          "TIME",
          "MESSAGE",
          "NEWLINE",
          "LOOP",
          "NEWLINE",
          "INDENT",
          "TIME",
          "MESSAGE",
          "NEWLINE",
          "TIME",
          "SKIP",
          "MESSAGE",
          "NEWLINE",
          "DEDENT",
        ],
      ],
    ]

    indentDedentTestData.map(([name, input, expectedKinds]) => {
      it(name, () => {
        const tokens = Array.from(tokenize(input))
        const kinds = tokens.map((t) => t.kind)
        assert.deepStrictEqual(kinds, expectedKinds)
      })
    })
  })
})
