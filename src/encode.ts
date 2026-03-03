import { Program } from "./program.ts"
import { serialise } from "./serialise.ts"
import { parse } from "./parse.ts"

const VERSION = 1

export function encode(p: Program): string {
  const s = serialise(p)
  const blob = btoa(
    String.fromCharCode(
      ...new TextEncoder().encode(`${s.title}\n${s.program}`),
    ),
  )
  return `${slugify(p.title)}/${VERSION}:${crc32ish(blob)}:${blob}`
}

export function decode(encodedData: string): Program {
  const { version, checksum, blob } = (() => {
    const parts = encodedData.match(/^(.*)\/(\d+):(.{4}):(.+)$/) || []
    if (!parts.length) {
      throw new Error("Invalid URL")
    }
    return { version: parseInt(parts[2]), checksum: parts[3], blob: parts[4] }
  })()
  if (crc32ish(blob) !== checksum) {
    throw new Error("Checksum mismatch")
  }
  const text = new TextDecoder().decode(
    Uint8Array.from(atob(blob), (c) => c.charCodeAt(0)),
  )
  const firstLineBreak = text.indexOf("\n")
  const programText = text.substring(firstLineBreak + 1)
  const title = text.substring(0, firstLineBreak)
  if (version <= 0 || version > VERSION) {
    throw new Error(`Unsupported encoding version ${version}`)
  }
  return parse(title, programText)
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function crc32ish(text: string): string {
  let crc = 0xffffffff
  for (let i = 0; i < text.length; i++) {
    const byte = text.charCodeAt(i)
    crc ^= byte
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
    }
  }
  return ((crc ^ 0xffffffff) >>> 0)
    .toString(36)
    .padStart(4, "0")
    .substring(0, 4)
}
