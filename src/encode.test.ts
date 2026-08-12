import assert from "assert"
import { crc32ish, decode, encode } from "./encode.ts"
import { Program } from "./program.ts"

const createdAt = new Date(Date.UTC(2026, 5, 1))

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
      /\/1:1j01:Yzp0ZnhlbzAKSGVsbG8gV29ybGQhIPCfmIAK$/,
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
      /\/1:evy7:Yzp0ZnhlbzAKSGVsbG8KMDowMiBXb3JsZCEKNXgKICAwOjAyIFdhcm0gdXAg8J\+kuAogIDA6MDIgV29yayBvdXQg8J\+Sqg==$/,
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
  })
})

describe("decode()", () => {
  it("rejects a string that doesn't match the expected shape", () => {
    assert.throws(() => decode("not-a-valid-encoded-string"), /Invalid URL/)
  })

  it("rejects a tampered/corrupted payload via checksum mismatch", () => {
    const encoded = encode({ title: "Hello", items: [], createdAt })
    const tampered = encoded.replace(/:(.{4}):/, ":xxxx:")
    assert.throws(() => decode(tampered), /Checksum mismatch/)
  })

  it("rejects unsupported encoding versions", () => {
    const encoded = encode({ title: "Hello", items: [], createdAt })
    assert.throws(
      () => decode(encoded.replace("/1:", "/0:")),
      /Unsupported encoding version 0/,
    )
    assert.throws(
      () => decode(encoded.replace("/1:", "/2:")),
      /Unsupported encoding version 2/,
    )
  })

  it("rejects a missing/malformed metadata line", () => {
    const blob = btoa("not-metadata\nHello\n")
    const badEncoded = `hello/1:${crc32ish(blob)}:${blob}`
    assert.throws(() => decode(badEncoded), /Invalid metadata/)
  })

  it("rejects a metadata timestamp before 2026-01-01", () => {
    // "c:0" decodes to the Unix epoch (1970-01-01), well before the cutoff.
    const blob = btoa("c:0\nHello\n")
    const badEncoded = `hello/1:${crc32ish(blob)}:${blob}`
    assert.throws(
      () => decode(badEncoded),
      /createdAt must be on or after 2026-01-01/,
    )
  })

  it("rejects a metadata timestamp shortly before the cutoff", () => {
    const shortlyBeforeCutoff = new Date("2025-12-29T00:00:00Z")
    const seconds = Math.floor(shortlyBeforeCutoff.getTime() / 1000)
    const blob = btoa(`c:${seconds.toString(36)}\nHello\n`)
    const badEncoded = `hello/1:${crc32ish(blob)}:${blob}`
    assert.throws(
      () => decode(badEncoded),
      /createdAt must be on or after 2026-01-01/,
    )
  })

  it("rejects a metadata timestamp too far in the future", () => {
    const tenDaysAhead = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    const seconds = Math.floor(tenDaysAhead.getTime() / 1000)
    const blob = btoa(`c:${seconds.toString(36)}\nHello\n`)
    const badEncoded = `hello/1:${crc32ish(blob)}:${blob}`
    assert.throws(() => decode(badEncoded), /createdAt cannot be in the future/)
  })

  it("accepts a metadata timestamp within the future grace margin", () => {
    const twoDaysAhead = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    const seconds = Math.floor(twoDaysAhead.getTime() / 1000)
    const blob = btoa(`c:${seconds.toString(36)}\nHello\n`)
    const goodEncoded = `hello/1:${crc32ish(blob)}:${blob}`
    assert.doesNotThrow(() => decode(goodEncoded))
  })
})
