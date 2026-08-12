import assert from "assert"
import { ErrorCode, parse, ProgramError } from "./parse.ts"
import { Item } from "./program.ts"

const hasCode = (code: ErrorCode) => (e: unknown) =>
  e instanceof ProgramError && e.code === code

const createdAt = new Date(Date.UTC(2026, 0, 1))

describe("parse()", () => {
  const tests: {
    desc: string
    input: string[]
    expect: { title: string; items: Item[] }
  }[] = [
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
    {
      desc: "CRLF line endings",
      input: [
        "Sports!",
        "0:05 Get ready!\r\n2x\r\n  0:10 Work out\r\n  0:05* Rest",
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
      desc: "title at the 30 character boundary",
      input: ["123456789012345678901234567890", "0:01"],
      expect: {
        title: "123456789012345678901234567890",
        items: [{ kind: "ACTIVITY", title: "", duration: 1, skipLast: false }],
      },
    },
    {
      desc: "loop with a large repeat count",
      input: ["", "999x\n  0:10 A"],
      expect: {
        title: "",
        items: [
          {
            kind: "LOOP",
            repeat: 999,
            items: [
              { kind: "ACTIVITY", title: "A", duration: 10, skipLast: false },
            ],
          },
        ],
      },
    },
  ]
  tests.forEach(({ desc, input, expect }) => {
    it(`parses ${desc}`, () => {
      assert.deepStrictEqual(parse(input[0], input[1], createdAt), {
        ...expect,
        createdAt,
      })
    })
  })

  it("rejects too long title", () => {
    assert.throws(
      () => parse("1234567890123456789012345678901", "", createdAt),
      hasCode("TITLE_TOO_LONG"),
    )
  })

  it("rejects invalid entry type", () => {
    ;["hello", "1h30m Hello"].forEach((input) => {
      assert.throws(
        () => parse("", input, createdAt),
        hasCode("INVALID_ENTRY"),
        input,
      )
    })
  })

  it("rejects blank or empty lines in between", () => {
    ;["0:10\n\n0:20", "0:10\n  \n0:20"].forEach((input) => {
      assert.throws(
        () => parse("", input, createdAt),
        hasCode("EMPTY_LINE"),
        input,
      )
    })
  })

  it("rejects invalid durations", () => {
    ;["0:1", "0:60", "0:61", "0:100", "0:00"].forEach((input) => {
      assert.throws(
        () => parse("", input, createdAt),
        hasCode("INVALID_DURATION"),
        input,
      )
    })
  })

  it("rejects missing whitespace separator", () => {
    ;["0:10Hello", "0:10**", "0:10*Hello"].forEach((input) => {
      assert.throws(
        () => parse("", input, createdAt),
        hasCode("MISSING_SPACE_SEPARATOR"),
        input,
      )
    })
  })

  it("rejects illegal indentation sequences", () => {
    ;[" 0:10", "   2x", "0:10\n 0:05"].forEach((input) => {
      assert.throws(
        () => parse("", input, createdAt),
        hasCode("INVALID_INDENTATION"),
        input,
      )
    })
  })

  it("rejects illegal indentation changes", () => {
    ;["  0:10", "  2x", "0:10\n  0:05"].forEach((input) => {
      assert.throws(
        () => parse("", input, createdAt),
        hasCode("INVALID_INDENTATION"),
        input,
      )
    })
  })

  it("rejects loops with zero repetitions", () => {
    ;["0x\n  0:10", "00x\n  0:10"].forEach((input) => {
      assert.throws(
        () => parse("", input, createdAt),
        hasCode("INVALID_REPETITIONS"),
        input,
      )
    })
  })

  it("rejects empty loops", () => {
    ;["2x", "2x\n0:10"].forEach((input) => {
      assert.throws(
        () => parse("", input, createdAt),
        hasCode("EMPTY_LOOP"),
        input,
      )
    })
  })

  it("rejects tab-indented lines as invalid entries, not as invalid indentation", () => {
    // Tabs aren’t recognised as indentation at all (only spaces are), so a
    // tab-indented line is treated as unindented content and fails to match
    // any known entry shape.
    ;["\t0:10", "0:10\n\t0:05"].forEach((input) => {
      assert.throws(
        () => parse("", input, createdAt),
        hasCode("INVALID_ENTRY"),
        input,
      )
    })
  })

  it("rejects malformed loop headers", () => {
    ;["2xx", "2x0"].forEach((input) => {
      assert.throws(
        () => parse("", `${input}\n  0:10 A`, createdAt),
        hasCode("INVALID_ENTRY"),
        input,
      )
    })
  })

  it("accepts trailing whitespace after a loop repeat count", () => {
    ;["2x ", "2x  "].forEach((input) => {
      assert.deepStrictEqual(parse("", `${input}\n  0:10 A`, createdAt), {
        title: "",
        createdAt,
        items: [
          {
            kind: "LOOP",
            repeat: 2,
            items: [
              { kind: "ACTIVITY", title: "A", duration: 10, skipLast: false },
            ],
          },
        ],
      })
    })
  })
})
