import { Item, Program } from "./program.ts"

export function parse(title: string, text: string): Program {
  if (title.length > 30) {
    throw new Error("Title cannot be longer than 30 characters")
  }
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
      throw new ParseError(
        line,
        "Illegal empty line",
        "Blank or empty lines are not allowed.",
      )
    }
    if (line.indent <= parentIndent) {
      break
    }
    if (line.indent > parentIndent + 1) {
      throw new ParseError(
        line,
        "Invalid indentation",
        "Indentation must be a multiple of 2 spaces.",
      )
    }
    lines.shift()

    const activityLine = line.text.match(/^(\d+):(\d+)(\*)?(.*)?$/)
    if (activityLine) {
      const [_, minutes, seconds, skipLast, title] = activityLine
      const duration = (() => {
        const m = parseInt(minutes)
        const s = parseInt(seconds)
        if (seconds.length != 2 || s >= 60) {
          throw new ParseError(
            line,
            "Invalid duration",
            "A duration must be in the format MM:SS or M:SS.",
          )
        }
        return m * 60 + s
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
      if (loopItems.length === 0) {
        throw new ParseError(
          line,
          "Illegal empty loop",
          "Loop must contain at least one activity or another loop.",
        )
      }
      items.push({
        kind: "LOOP",
        repeat: parseInt(repeat),
        items: loopItems,
      })
      lines = remainingLines
      continue
    }

    throw new ParseError(
      line,
      "Invalid entry",
      "Expected an activity or a loop.",
    )
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
      "Invalid indentation",
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
