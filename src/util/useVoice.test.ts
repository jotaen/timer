import assert from "assert"
import { resolveVoice } from "./useVoice.ts"

function makeVoice(voiceURI: string, lang: string): SpeechSynthesisVoice {
  return {
    voiceURI,
    lang,
    name: voiceURI,
    default: false,
    localService: true,
  } as SpeechSynthesisVoice
}

describe("resolveVoice()", () => {
  it("prefers the explicitly chosen voice, regardless of locale", () => {
    const voices = [makeVoice("A", "de-DE"), makeVoice("B", "en-GB")]
    assert.strictEqual(resolveVoice(voices, "B", "de-DE")?.voiceURI, "B")
  })

  it("falls back to an exact locale match when nothing is chosen", () => {
    const voices = [makeVoice("A", "en-US"), makeVoice("B", "en-GB")]
    assert.strictEqual(resolveVoice(voices, "", "en-GB")?.voiceURI, "B")
  })

  it("falls back to a language-family match when no exact locale matches", () => {
    const voices = [makeVoice("A", "en-GB"), makeVoice("B", "de-DE")]
    assert.strictEqual(resolveVoice(voices, "", "en-US")?.voiceURI, "A")
  })

  it("normalises underscore-delimited language tags", () => {
    const voices = [makeVoice("A", "en_US"), makeVoice("B", "de-DE")]
    assert.strictEqual(resolveVoice(voices, "", "en-US")?.voiceURI, "A")
  })

  it("falls back to the first voice when nothing matches at all", () => {
    const voices = [makeVoice("A", "ja-JP"), makeVoice("B", "ko-KR")]
    assert.strictEqual(resolveVoice(voices, "", "en-US")?.voiceURI, "A")
  })

  it("ignores a chosen voice URI that is no longer available", () => {
    const voices = [makeVoice("A", "en-US"), makeVoice("B", "de-DE")]
    assert.strictEqual(
      resolveVoice(voices, "does-not-exist", "en-US")?.voiceURI,
      "A",
    )
  })

  it("returns undefined when there are no voices at all", () => {
    assert.strictEqual(resolveVoice([], "", "en-US"), undefined)
  })
})
