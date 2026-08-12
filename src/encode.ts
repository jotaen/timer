import {
  decode as msgpackDecode,
  encode as msgpackEncode,
} from "@msgpack/msgpack"
import { Item, Program } from "./program.ts"

const VERSION = 1

const MIN_CREATED_AT = new Date("2026-01-01T00:00:00Z")
const FUTURE_GRACE_MS = 3 * 24 * 60 * 60 * 1000 // Account for clock/timezone differences.

export function encode(p: Program): string {
  const blob = btoa(String.fromCharCode(...msgpackEncode(toWire(p))))
  return `${slugify(p.title)}/${VERSION}:${crc32ish(blob)}:${blob}`
}

export function decode(encodedData: string): Program {
  const { version, checksum, blob } = (() => {
    const parts = encodedData.match(/^([a-z0-9-]*)\/(\d+):(.{4}):(.+)$/) || []
    if (!parts.length) {
      throw invalidProgram("malformed URL")
    }
    return { version: parseInt(parts[2]), checksum: parts[3], blob: parts[4] }
  })()
  if (crc32ish(blob) !== checksum) {
    throw invalidProgram("checksum mismatch")
  }
  if (version <= 0 || version > VERSION) {
    throw invalidProgram(`unsupported encoding version ${version}`)
  }
  const wire = (() => {
    try {
      return msgpackDecode(Uint8Array.from(atob(blob), (c) => c.charCodeAt(0)))
    } catch {
      throw invalidProgram("undecodable data")
    }
  })()
  const program = fromWire(wire)
  validateProgram(program)
  return program
}

// The wire functions only guarantee shape and types; this enforces the
// domain invariants (analogous to what parse() enforces for text input).
function validateProgram(p: Program): void {
  if (isNaN(p.createdAt.getTime())) {
    throw invalidProgram("invalid createdAt timestamp")
  }
  if (p.createdAt < MIN_CREATED_AT) {
    throw invalidProgram("createdAt must be on or after 2026-01-01")
  }
  if (p.createdAt.getTime() > Date.now() + FUTURE_GRACE_MS) {
    throw invalidProgram("createdAt cannot be in the future")
  }
  if (p.title.length > 30) {
    throw invalidProgram("title too long")
  }
  validateItems(p.items)
}

function validateItems(items: Item[]): void {
  for (const item of items) {
    if (item.kind === "ACTIVITY") {
      if (!Number.isInteger(item.duration) || item.duration <= 0) {
        throw invalidProgram("invalid duration")
      }
    } else {
      if (!Number.isInteger(item.repeat) || item.repeat <= 0) {
        throw invalidProgram("invalid repetitions")
      }
      if (item.items.length === 0) {
        throw invalidProgram("empty loop")
      }
      validateItems(item.items)
    }
  }
}

// Wire shape (plain arrays, not objects, to avoid paying for key names):
//   [createdAt (unix seconds), title, ...items]
//   ACTIVITY item: [ACTIVITY | ACTIVITY_SKIP_LAST, duration (seconds), title]
//   LOOP item:     [LOOP, repeat, ...items]

const ACTIVITY = 0
const ACTIVITY_SKIP_LAST = 1
const LOOP = 2

function toWire(p: Program): unknown[] {
  return [
    Math.floor(p.createdAt.getTime() / 1000),
    p.title,
    ...p.items.map(itemToWire),
  ]
}

function itemToWire(item: Item): unknown[] {
  if (item.kind === "ACTIVITY") {
    return [
      item.skipLast ? ACTIVITY_SKIP_LAST : ACTIVITY,
      item.duration,
      item.title,
    ]
  }
  return [LOOP, item.repeat, ...item.items.map(itemToWire)]
}

function fromWire(value: unknown): Program {
  if (!Array.isArray(value)) {
    throw invalidProgram("malformed program structure")
  }
  const [createdAt, title, ...items] = value
  if (typeof createdAt !== "number" || typeof title !== "string") {
    throw invalidProgram("malformed program structure")
  }
  return {
    createdAt: new Date(createdAt * 1000),
    title,
    items: items.map(itemFromWire),
  }
}

function itemFromWire(value: unknown): Item {
  if (!Array.isArray(value)) {
    throw invalidProgram("malformed item")
  }
  const [kind, ...rest] = value
  if (kind === LOOP) {
    const [repeat, ...items] = rest
    if (typeof repeat !== "number") {
      throw invalidProgram("malformed loop item")
    }
    return { kind: "LOOP", repeat, items: items.map(itemFromWire) }
  }
  if (kind !== ACTIVITY && kind !== ACTIVITY_SKIP_LAST) {
    throw invalidProgram("unknown item kind")
  }
  const [duration, title] = rest
  if (typeof duration !== "number" || typeof title !== "string") {
    throw invalidProgram("malformed activity item")
  }
  return {
    kind: "ACTIVITY",
    duration,
    title,
    skipLast: kind === ACTIVITY_SKIP_LAST,
  }
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

function invalidProgram(reason: string): Error {
  return new Error(`Invalid program: ${reason}`)
}
