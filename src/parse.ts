import { Item, Program } from "./program.ts"

export function parse(title: string, text: string): Program {
  const lines = trimLeadingAndTrailingBlankLines(
    text.replace(/\r\n/g, "\n").split("\n").map(makeLine),
  )
  const [items] = text !== "" ? parseItems(lines, -1) : [[]]
  return { title: title.trim(), items }
}

export class ParseError extends Error {
  line: Line
  hint?: string
  constructor(line: Line, message: string, hint?: string) {
    super(message)
    this.line = line
    this.hint = hint
  }
}

type Line = {
  number: number
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
    if (line.text.trim() === "") {
      throw new ParseError(line, "Illegal empty line")
    }
    if (line.indent <= parentIndent) {
      break
    }
    if (line.indent > parentIndent + 1) {
      throw new ParseError(line, "Invalid indentation")
    }
    lines.shift()

    const activityLine = line.text.match(/^(\d+):(\d+)(\*)?(.*)?$/)
    if (activityLine) {
      const [_, hours, minutes, skipLast, title] = activityLine
      const duration = (() => {
        const h = parseInt(hours)
        const m = parseInt(minutes)
        if (minutes.length != 2 || m >= 60) {
          throw new ParseError(line, "Invalid duration")
        }
        return h * 60 + m
      })()
      if (title && title.length > 0 && title.substring(0, 1) !== " ") {
        throw new ParseError(
          line,
          "Missing space separator before activity title",
        )
      }
      items.push({
        kind: "ACTIVITY",
        title: title?.substring(1).trim() || "",
        duration: duration,
        skipLast: skipLast === "*",
      })
      continue
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
      continue
    }

    throw new ParseError(line, "Invalid entry")
  }
  return [items, lines]
}

function makeLine(str: string, i: number): Line {
  const match = str.match(/^( *)/)
  const spaceCount = match ? match[1].length : 0
  const line = {
    number: i + 1,
    indent: spaceCount / 2,
    text: str.slice(spaceCount),
  }
  if (spaceCount % 2 != 0) {
    throw new ParseError(
      line,
      "Malformed indentation",
      "Indentation must be a multiple of 2 spaces.",
    )
  }
  return line
}

function trimLeadingAndTrailingBlankLines(ls: Line[]) {
  let start = 0
  let end = ls.length - 1
  while (start < ls.length && ls[start].text.trim() === "") {
    start++
  }
  while (end >= start && ls[end].text.trim() === "") {
    end--
  }
  return ls.slice(start, end + 1)
}
