import assert from "assert"
import { ErrorCode, parse, ProgramError } from "./parse.ts"
import { Program } from "./program.ts"

const hasCode = (code: ErrorCode) => (e: unknown) =>
  e instanceof ProgramError && e.code === code

describe("parse()", () => {
  const tests: { desc: string; input: string[]; expect: Program }[] = [
    {
      desc: "empty program",
      input: ["", ""],
      expect: { title: "", items: [] },
    },
    {
      desc: "minimal program",
      input: ["Test", "0:01"],
      expect: {
        title: "Test",
        items: [{ kind: "ACTIVITY", title: "", duration: 1, skipLast: false }],
      },
    },
    {
      desc: "simple program",
      input: ["Sports!", "0:05 Get ready!\n2x\n  0:10 Work out\n  0:05* Rest"],
      expect: {
        title: "Sports!",
        items: [
          {
            kind: "ACTIVITY",
            title: "Get ready!",
            duration: 5,
            skipLast: false,
          },
          {
            kind: "LOOP",
            repeat: 2,
            items: [
              {
                kind: "ACTIVITY",
                title: "Work out",
                duration: 10,
                skipLast: false,
              },
              { kind: "ACTIVITY", title: "Rest", duration: 5, skipLast: true },
            ],
          },
        ],
      },
    },
    {
      desc: "trims leading/trailing whitespace",
      input: [
        "  Sports!  ",
        "0:05   Get   ready!   \n2x\n  0:10   Work   out  \n  0:05*   Rest  ",
      ],
      expect: {
        title: "Sports!",
        items: [
          {
            kind: "ACTIVITY",
            title: "Get   ready!",
            duration: 5,
            skipLast: false,
          },
          {
            kind: "LOOP",
            repeat: 2,
            items: [
              {
                kind: "ACTIVITY",
                title: "Work   out",
                duration: 10,
                skipLast: false,
              },
              { kind: "ACTIVITY", title: "Rest", duration: 5, skipLast: true },
            ],
          },
        ],
      },
    },
    {
      desc: "complex program",
      input: [
        "Sports!",
        "0:05 Get ready!\n3x\n  0:10 Prepare\n  2x\n    1:00 Go!!!\n    0:15* Rest\n  1:00* Rest",
      ],
      expect: {
        title: "Sports!",
        items: [
          {
            kind: "ACTIVITY",
            title: "Get ready!",
            duration: 5,
            skipLast: false,
          },
          {
            kind: "LOOP",
            repeat: 3,
            items: [
              {
                kind: "ACTIVITY",
                title: "Prepare",
                duration: 10,
                skipLast: false,
              },
              {
                kind: "LOOP",
                repeat: 2,
                items: [
                  {
                    kind: "ACTIVITY",
                    title: "Go!!!",
                    duration: 60,
                    skipLast: false,
                  },
                  {
                    kind: "ACTIVITY",
                    title: "Rest",
                    duration: 15,
                    skipLast: true,
                  },
                ],
              },
              { kind: "ACTIVITY", title: "Rest", duration: 60, skipLast: true },
            ],
          },
        ],
      },
    },
    {
      desc: "leading blank lines",
      input: ["\n  \nTest", "0:01"],
      expect: {
        title: "Test",
        items: [{ kind: "ACTIVITY", title: "", duration: 1, skipLast: false }],
      },
    },
    {
      desc: "trailing blank lines",
      input: ["Test", "0:01\n  \n"],
      expect: {
        title: "Test",
        items: [{ kind: "ACTIVITY", title: "", duration: 1, skipLast: false }],
      },
    },
  ]
  tests.forEach(({ desc, input, expect }) => {
    it(`parses ${desc}`, () => {
      assert.deepStrictEqual(parse(input[0], input[1]), expect)
    })
  })

  it("rejects too long title", () => {
    assert.throws(
      () => parse("1234567890123456789012345678901", ""),
      hasCode("TITLE_TOO_LONG"),
    )
  })

  it("rejects invalid entry type", () => {
    ;["hello", "1h30m Hello"].forEach((input) => {
      assert.throws(() => parse("", input), hasCode("INVALID_ENTRY"), input)
    })
  })

  it("rejects blank or empty lines in between", () => {
    ;["0:10\n\n0:20", "0:10\n  \n0:20"].forEach((input) => {
      assert.throws(() => parse("", input), hasCode("EMPTY_LINE"), input)
    })
  })

  it("rejects invalid durations", () => {
    ;["0:1", "0:60", "0:61", "0:100"].forEach((input) => {
      assert.throws(() => parse("", input), hasCode("INVALID_DURATION"), input)
    })
  })

  it("rejects missing whitespace separator", () => {
    ;["0:10Hello", "0:10**", "0:10*Hello"].forEach((input) => {
      assert.throws(
        () => parse("", input),
        hasCode("MISSING_SPACE_SEPARATOR"),
        input,
      )
    })
  })

  it("rejects illegal indentation sequences", () => {
    ;[" 0:10", "   2x", "0:10\n 0:05"].forEach((input) => {
      assert.throws(
        () => parse("", input),
        hasCode("INVALID_INDENTATION"),
        input,
      )
    })
  })

  it("rejects illegal indentation changes", () => {
    ;["  0:10", "  2x", "0:10\n  0:05"].forEach((input) => {
      assert.throws(
        () => parse("", input),
        hasCode("INVALID_INDENTATION"),
        input,
      )
    })
  })

  it("rejects empty loops", () => {
    ;["2x", "2x\n0:10"].forEach((input) => {
      assert.throws(() => parse("", input), hasCode("EMPTY_LOOP"), input)
    })
  })
})
