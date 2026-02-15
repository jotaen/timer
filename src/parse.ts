import { Item, Program } from "./program.ts"

export function parse(title: string, text: string): Program {
  const lines = text.replace(/\r\n/g, "\n").split("\n").map(makeLine)
  const [items] = parseItems(lines, -1)
  return { title: title.trim(), items }
}

type Line = {
  indent: number
  text: string
}

function parseItems(lines: Line[], parentIndent: number): [Item[], Line[]] {
  const items: Item[] = []
  while (true) {
    const line = lines[0]
    if (!line) {
      break
    }
    if (line.indent <= parentIndent) {
      break
    }
    lines.shift()

    const activityLine = line.text.match(/^(\d+):(\d+)(\*)?( .*)?$/)
    if (activityLine) {
      const [_, hours, minutes, skipLast, title] = activityLine
      const duration = parseInt(hours) * 60 + parseInt(minutes)
      items.push({
        kind: "ACTIVITY",
        title: title?.substring(1).trim() || "",
        duration: duration,
        skipLast: skipLast === "*",
      })
    }

    const loopLine = line.text.match(/^(\d+)x *$/)
    if (loopLine) {
      const [_, repeat] = loopLine
      const [loopItems, remainingLines] = parseItems(lines, line.indent)
      items.push({
        kind: "LOOP",
        repeat: parseInt(repeat),
        items: loopItems,
      })
      lines = remainingLines
    }
  }
  return [items, lines]
}

function makeLine(str: string): Line {
  const match = str.match(/^((  )*)/)
  const count = match ? match[1].length : 0
  return { indent: count, text: str.slice(count) }
}
