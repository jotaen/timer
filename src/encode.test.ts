import assert from "assert"
import { encode as msgpackEncode } from "@msgpack/msgpack"
import { crc32ish, decode, encode } from "./encode.ts"
import { Program } from "./program.ts"

const createdAt = new Date(Date.UTC(2026, 5, 1))

// Bypasses encode() to craft arbitrary wire payloads.
function craft(wire: unknown): string {
  const blob = btoa(String.fromCharCode(...msgpackEncode(wire)))
  return `hello/1:${crc32ish(blob)}:${blob}`
}

const createdAtSeconds = Math.floor(createdAt.getTime() / 1000)

describe("encode()", () => {
  it("slugifies the title", () => {
    assert.match(encode({ title: "", items: [], createdAt }), /^\//)
    assert.match(
      encode({ title: "Hello World!", items: [], createdAt }),
      /^hello-world\//,
    )
    assert.match(
      encode({ title: "hello-world", items: [], createdAt }),
      /^hello-world\//,
    )
    assert.match(
      encode({ title: "H€eπlälﬁo/W!o#r$l^d...", items: [], createdAt }),
      /^helloworld\//,
    )
    assert.match(
      encode({ title: "Hey! 😀ö↓¼ foo \"\']}", items: [], createdAt }),
      /^hey-foo\//,
    )
  })

  it("encodes the program", () => {
    assert.match(
      encode({ title: "Hello World! 😀", items: [], createdAt }),
      /\/1:i2t6:ks5qHMuAsUhlbGxvIFdvcmxkISDwn5iA$/,
    )
    assert.match(
      encode({
        title: "Hello",
        createdAt,
        items: [
          { kind: "ACTIVITY", title: "World!", duration: 2, skipLast: false },
          {
            kind: "LOOP",
            repeat: 5,
            items: [
              {
                kind: "ACTIVITY",
                title: "Warm up 🤸",
                duration: 2,
                skipLast: false,
              },
              {
                kind: "ACTIVITY",
                title: "Work out 💪",
                duration: 2,
                skipLast: false,
              },
            ],
          },
        ],
      }),
      /\/1:1hea:lM5qHMuApUhlbGxvkwACpldvcmxkIZQCBZMAAqxXYXJtIHVwIPCfpLiTAAKtV29yayBvdXQg8J\+Sqg==$/,
    )
  })

  it("decodes/encodes a program", () => {
    const input1: Program = {
      title: "",
      items: [],
      createdAt,
    }
    const output1 = decode(encode(input1))
    assert.deepStrictEqual(output1, input1)

    const input2: Program = {
      title: "Hello",
      createdAt,
      items: [
        { kind: "ACTIVITY", title: "World! 🌍", duration: 2, skipLast: false },
        {
          kind: "LOOP",
          repeat: 5,
          items: [
            {
              kind: "ACTIVITY",
              title: "Warm up 🤸",
              duration: 17,
              skipLast: false,
            },
            {
              kind: "ACTIVITY",
              title: "Work out 💪",
              duration: 9,
              skipLast: true,
            },
          ],
        },
      ],
    }
    const output2 = decode(encode(input2))
    assert.deepStrictEqual(output2, input2)

    const input3: Program = {
      title: "Nested",
      createdAt,
      items: [
        {
          kind: "LOOP",
          repeat: 2,
          items: [
            { kind: "ACTIVITY", title: "Rest", duration: 30, skipLast: true },
            {
              kind: "LOOP",
              repeat: 3,
              items: [
                {
                  kind: "ACTIVITY",
                  title: "Sprint",
                  duration: 45,
                  skipLast: false,
                },
              ],
            },
          ],
        },
      ],
    }
    const output3 = decode(encode(input3))
    assert.deepStrictEqual(output3, input3)
  })
})

describe("decode()", () => {
  it("rejects a string that doesn't match the expected shape", () => {
    assert.throws(
      () => decode("not-a-valid-encoded-string"),
      /Invalid program: malformed URL/,
    )
  })

  it("ignores the slug part of the URL", () => {
    const encoded = encode({ title: "Hello", items: [], createdAt })
    const withDifferentSlug = encoded.replace(/^hello\//, "something-else/")
    assert.deepStrictEqual(decode(withDifferentSlug), decode(encoded))
  })

  it("rejects a tampered/corrupted payload via checksum mismatch", () => {
    const encoded = encode({ title: "Hello", items: [], createdAt })
    const tampered = encoded.replace(/:(.{4}):/, ":xxxx:")
    assert.throws(() => decode(tampered), /Invalid program: checksum mismatch/)
  })

  it("rejects unsupported encoding versions", () => {
    const encoded = encode({ title: "Hello", items: [], createdAt })
    assert.throws(
      () => decode(encoded.replace("/1:", "/0:")),
      /Invalid program: unsupported encoding version 0/,
    )
    assert.throws(
      () => decode(encoded.replace("/1:", "/2:")),
      /Invalid program: unsupported encoding version 2/,
    )
  })

  it("rejects a truncated/corrupted binary payload", () => {
    // 0x91 is a MessagePack array-of-1 header with no element following it.
    const blob = btoa(String.fromCharCode(0x91))
    const badEncoded = `hello/1:${crc32ish(blob)}:${blob}`
    assert.throws(() => decode(badEncoded), /Invalid program: undecodable data/)
  })

  it("rejects a blob that is not valid base64", () => {
    const blob = "!!!!"
    assert.throws(
      () => decode(`hello/1:${crc32ish(blob)}:${blob}`),
      /Invalid program: undecodable data/,
    )
  })

  it("rejects wrong types for createdAt or title", () => {
    assert.throws(
      () => decode(craft(["not-a-number", "Hello"])),
      /Invalid program: malformed program structure/,
    )
    assert.throws(
      () => decode(craft([createdAtSeconds, 123])),
      /Invalid program: malformed program structure/,
    )
  })

  it("rejects an item that is not an array", () => {
    assert.throws(
      () => decode(craft([createdAtSeconds, "Hello", "not-an-item"])),
      /Invalid program: malformed item/,
    )
  })

  it("rejects a loop item with a malformed repeat count", () => {
    assert.throws(
      () => decode(craft([createdAtSeconds, "Hello", [2, "not-a-number"]])),
      /Invalid program: malformed loop item/,
    )
  })

  it("rejects an activity item with malformed fields", () => {
    assert.throws(
      () => decode(craft([createdAtSeconds, "Hello", [0, "30", "Title"]])),
      /Invalid program: malformed activity item/,
    )
    assert.throws(
      () => decode(craft([createdAtSeconds, "Hello", [1, 30, 99]])),
      /Invalid program: malformed activity item/,
    )
  })

  it("rejects a payload whose top-level value is not an array", () => {
    assert.throws(
      () => decode(craft("not-a-program")),
      /Invalid program: malformed program structure/,
    )
  })

  it("rejects an unknown item kind tag", () => {
    assert.throws(
      () => decode(craft([createdAtSeconds, "Hello", [7, 30, "Mystery"]])),
      /Invalid program: unknown item kind/,
    )
  })

  it("rejects a non-finite createdAt timestamp", () => {
    assert.throws(
      () => decode(craft([1e300, "Hello"])),
      /Invalid program: invalid createdAt timestamp/,
    )
  })

  it("rejects a title longer than 30 characters", () => {
    const encoded = encode({
      title: "This title is way too long to be acceptable",
      items: [],
      createdAt,
    })
    assert.throws(() => decode(encoded), /Invalid program: title too long/)
  })

  it("accepts a title of exactly 30 characters", () => {
    const encoded = encode({ title: "a".repeat(30), items: [], createdAt })
    assert.doesNotThrow(() => decode(encoded))
  })

  it("rejects non-positive or fractional durations", () => {
    for (const duration of [-5, 0, 1.5]) {
      const encoded = encode({
        title: "Hello",
        items: [{ kind: "ACTIVITY", title: "", duration, skipLast: false }],
        createdAt,
      })
      assert.throws(() => decode(encoded), /Invalid program: invalid duration/)
    }
  })

  it("rejects non-positive or fractional loop repetitions", () => {
    for (const repeat of [-1, 0, 2.5]) {
      const encoded = encode({
        title: "Hello",
        items: [
          {
            kind: "LOOP",
            repeat,
            items: [
              { kind: "ACTIVITY", title: "", duration: 30, skipLast: false },
            ],
          },
        ],
        createdAt,
      })
      assert.throws(
        () => decode(encoded),
        /Invalid program: invalid repetitions/,
      )
    }
  })

  it("rejects a program whose total duration exceeds 99:59", () => {
    const encoded = encode({
      title: "Hello",
      items: [{ kind: "ACTIVITY", title: "", duration: 6000, skipLast: false }],
      createdAt,
    })
    assert.throws(() => decode(encoded), /Invalid program: program too long/)
  })

  it("accepts a program with a total duration of exactly 99:59", () => {
    const encoded = encode({
      title: "Hello",
      items: [{ kind: "ACTIVITY", title: "", duration: 5999, skipLast: false }],
      createdAt,
    })
    assert.doesNotThrow(() => decode(encoded))
  })

  it("rejects a skip-last marker on a top-level activity", () => {
    const encoded = encode({
      title: "Hello",
      items: [{ kind: "ACTIVITY", title: "", duration: 30, skipLast: true }],
      createdAt,
    })
    assert.throws(
      () => decode(encoded),
      /Invalid program: skip-last marker outside loop/,
    )
  })

  it("rejects an empty loop", () => {
    const encoded = encode({
      title: "Hello",
      items: [{ kind: "LOOP", repeat: 3, items: [] }],
      createdAt,
    })
    assert.throws(() => decode(encoded), /Invalid program: empty loop/)
  })

  it("rejects invalid items nested inside loops", () => {
    const encoded = encode({
      title: "Hello",
      items: [
        {
          kind: "LOOP",
          repeat: 2,
          items: [{ kind: "LOOP", repeat: 3, items: [] }],
        },
      ],
      createdAt,
    })
    assert.throws(() => decode(encoded), /Invalid program: empty loop/)
  })

  it("rejects a createdAt timestamp before 2026-01-01", () => {
    const encoded = encode({
      title: "Hello",
      items: [],
      createdAt: new Date(0),
    })
    assert.throws(
      () => decode(encoded),
      /Invalid program: createdAt must be on or after 2026-01-01/,
    )
  })

  it("accepts a createdAt timestamp exactly at the cutoff", () => {
    const encoded = encode({
      title: "Hello",
      items: [],
      createdAt: new Date("2026-01-01T00:00:00Z"),
    })
    assert.doesNotThrow(() => decode(encoded))
  })

  it("rejects a createdAt timestamp shortly before the cutoff", () => {
    const encoded = encode({
      title: "Hello",
      items: [],
      createdAt: new Date("2025-12-29T00:00:00Z"),
    })
    assert.throws(
      () => decode(encoded),
      /Invalid program: createdAt must be on or after 2026-01-01/,
    )
  })

  it("rejects a createdAt timestamp too far in the future", () => {
    const encoded = encode({
      title: "Hello",
      items: [],
      createdAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    })
    assert.throws(
      () => decode(encoded),
      /Invalid program: createdAt cannot be in the future/,
    )
  })

  it("accepts a createdAt timestamp within the future grace margin", () => {
    const encoded = encode({
      title: "Hello",
      items: [],
      createdAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    })
    assert.doesNotThrow(() => decode(encoded))
  })
})
