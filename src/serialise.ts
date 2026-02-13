import { encode, decode } from "@msgpack/msgpack"
import { Program, Item, Activity, Loop } from "./program.ts"

const VERSION = 1

export function serialise(p: Program): string {
  const encoded = encode(compact.compact(p))
  const blob = btoa(String.fromCharCode(...encoded))
  return `${slugify(p.title)}/${VERSION};${blob}`
}

export function deserialise(serialisedProgram: string): Program {
  const parts = serialisedProgram.match(/^(.+?)\/(.+?);(.+)$/)
  if (!parts) {
    throw new Error("Invalid Program!")
  }
  const [, _, version, blob] = parts
  const buffer = new Uint8Array(Array.from(atob(blob), (c) => c.charCodeAt(0)))
  const data = decode(buffer) as compact.program
  return compact.decompact(data)
}

namespace compact {
  export type program = {
    t: Program["title"]
    i: item[]
  }

  type activity = {
    k: "A"
    t: Activity["title"]
    d: Activity["duration"]
    s: Activity["skipLast"]
  }

  type loop = {
    k: "L"
    r: Loop["repeat"]
    i: item[]
  }

  type item = activity | loop

  export function decompact(p: program): Program {
    function mapItems(items: item[]): Item[] {
      return items.map((item) => {
        switch (item.k) {
          case "A":
            return {
              kind: "ACTIVITY",
              title: item.t,
              duration: item.d,
              skipLast: item.s,
            }
          case "L":
            return { kind: "LOOP", repeat: item.r, items: mapItems(item.i) }
        }
      })
    }

    return {
      title: p.t,
      items: mapItems(p.i),
    }
  }

  export function compact(p: Program): program {
    function mapItems(items: Item[]): item[] {
      return items.map((item) => {
        switch (item.kind) {
          case "ACTIVITY":
            return { k: "A", t: item.title, d: item.duration, s: item.skipLast }
          case "LOOP":
            return { k: "L", r: item.repeat, i: mapItems(item.items) }
        }
      })
    }

    return {
      t: p.title,
      i: mapItems(p.items),
    }
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
