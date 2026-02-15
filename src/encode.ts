import { Program } from "./program.ts"
import { serialise } from "./serialise.ts"
import { parse } from "./parse.ts"

const VERSION = 1

export function encode(p: Program): string {
  const s = serialise(p)
  const text = `${s.title}\n${s.program}`
  return `${slugify(p.title)}/${VERSION};${btoa(text)}`
}

export function decode(serialisedProgram: string): Program {
  const parts = serialisedProgram.match(/^(.+?)\/(.+?);(.+)$/)
  if (!parts) {
    throw new Error("Invalid Program!")
  }
  const [, _, version, blob] = parts
  const text = atob(blob)
  const firstLineBreak = text.indexOf("\n")
  return parse(
    text.substring(0, firstLineBreak),
    text.substring(firstLineBreak + 1),
  )
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}
