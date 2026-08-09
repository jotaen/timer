import assert from "assert"
import { decode, encode } from "./encode.ts"
import { Program } from "./program.ts"

describe("encode()", () => {
  it("slugifies the title", () => {
    assert.match(encode({ title: "", items: [] }), /^\//)
    assert.match(encode({ title: "Hello World!", items: [] }), /^hello-world\//)
    assert.match(encode({ title: "hello-world", items: [] }), /^hello-world\//)
    assert.match(
      encode({ title: "H€eπlälﬁo/W!o#r$l^d...", items: [] }),
      /^helloworld\//,
    )
    assert.match(
      encode({ title: "Hey! 😀ö↓¼ foo \"\']}", items: [] }),
      /^hey-foo\//,
    )
  })

  it("encodes the program", () => {
    assert.match(
      encode({ title: "Hello World! 😀", items: [] }),
      /\/1:hi0v:SGVsbG8gV29ybGQhIPCfmIAK$/,
    )
    assert.match(
      encode({
        title: "Hello",
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
      /\/1:1e91:SGVsbG8KMDowMiBXb3JsZCEKNXgKICAwOjAyIFdhcm0gdXAg8J\+kuAogIDA6MDIgV29yayBvdXQg8J\+Sqg==$/,
    )
  })

  it("decodes/encodes a program", () => {
    const input1: Program = {
      title: "",
      items: [],
    }
    const output1 = decode(encode(input1))
    assert.deepStrictEqual(output1, input1)

    const input2: Program = {
      title: "Hello",
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
    const encoded = encode({ title: "Hello", items: [] })
    const tampered = encoded.replace(/:(.{4}):/, ":xxxx:")
    assert.throws(() => decode(tampered), /Checksum mismatch/)
  })

  it("rejects unsupported encoding versions", () => {
    const encoded = encode({ title: "Hello", items: [] })
    assert.throws(
      () => decode(encoded.replace("/1:", "/0:")),
      /Unsupported encoding version 0/,
    )
    assert.throws(
      () => decode(encoded.replace("/1:", "/2:")),
      /Unsupported encoding version 2/,
    )
  })
})
