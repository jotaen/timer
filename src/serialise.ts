import { Item, Program } from "./program.ts"

export function serialise(program: Program): {
  title: string
  program: string
} {
  return {
    title: program.title,
    program: serialiseItems(program.items, 0),
  }
}

function serialiseItems(items: Item[], indent: number): string {
  const indentation = "  ".repeat(indent)
  return items
    .map((item) => {
      switch (item.kind) {
        case "ACTIVITY":
          const minutes = String(Math.floor(item.duration / 60))
          const seconds = String(item.duration % 60).padStart(2, "0")
          const duration = `${minutes}:${seconds}`
          const skipLast = item.skipLast ? "*" : ""
          const title = item.title.length > 0 ? ` ${item.title}` : ""
          return `${indentation}${duration}${skipLast}${title}`
        case "LOOP":
          const repeat = `${item.repeat}x`
          const items = serialiseItems(item.items, indent + 1)
          return `${indentation}${repeat}\n${items}`
      }
    })
    .join("\n")
}
