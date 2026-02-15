import assert from "assert"
import { serialise } from "./serialise.ts"
import { Program } from "./program.ts"

describe("serialise()", () => {
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
      desc: "complex program",
      input: [
        "Sports!",
        "0:05 Get ready!\n3x\n  0:10 Prepare\n  2x\n    1:00 Go!!!\n    0:15* Rest\n  1:00* Rest\n0:01 Done",
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
          { kind: "ACTIVITY", title: "Done", duration: 1, skipLast: false },
        ],
      },
    },
  ]
  tests.forEach(({ desc, input, expect }) => {
    it(`serialises ${desc}`, () => {
      assert.deepStrictEqual(serialise(expect), {
        title: input[0],
        program: input[1],
      })
    })
  })
})
