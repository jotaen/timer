import { Program } from "./program.ts"
import { serialise } from "./serialise.ts"
import { parse } from "./parse.ts"

const VERSION = 1

const MIN_CREATED_AT = new Date("2026-01-01T00:00:00Z")
const FUTURE_GRACE_MS = 3 * 24 * 60 * 60 * 1000 // Account for clock/timezone differences.

export function encode(p: Program): string {
  const s = serialise(p)
  const meta = `c:${encodeTimestamp(p.createdAt)}`
  const blob = btoa(
    String.fromCharCode(
      ...new TextEncoder().encode(`${meta}\n${s.title}\n${s.program}`),
    ),
  )
  return `${slugify(p.title)}/${VERSION}:${crc32ish(blob)}:${blob}`
}

export function decode(encodedData: string): Program {
  const { version, checksum, blob } = (() => {
    const parts = encodedData.match(/^([a-z0-9-]*)\/(\d+):(.{4}):(.+)$/) || []
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
  const metaLine = text.substring(0, firstLineBreak)
  const rest = text.substring(firstLineBreak + 1)
  const secondLineBreak = rest.indexOf("\n")
  const title = rest.substring(0, secondLineBreak)
  const programText = rest.substring(secondLineBreak + 1)
  if (version <= 0 || version > VERSION) {
    throw new Error(`Unsupported encoding version ${version}`)
  }
  const metaMatch = metaLine.match(/^c:([0-9a-z]+)$/)
  if (!metaMatch) {
    throw new Error("Invalid metadata")
  }
  const createdAt = decodeTimestamp(metaMatch[1])
  if (createdAt < MIN_CREATED_AT) {
    throw new Error("createdAt must be on or after 2026-01-01")
  }
  if (createdAt.getTime() > Date.now() + FUTURE_GRACE_MS) {
    throw new Error("createdAt cannot be in the future")
  }
  return parse(title, programText, createdAt)
}

function encodeTimestamp(date: Date): string {
  return Math.floor(date.getTime() / 1000).toString(36)
}

function decodeTimestamp(encoded: string): Date {
  return new Date(parseInt(encoded, 36) * 1000)
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function crc32ish(text: string): string {
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
