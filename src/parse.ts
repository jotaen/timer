import { Item, Program } from "./program.ts"

export function parse(title: string, text: string, createdAt: Date): Program {
  if (title.length > 30) {
    throw new ProgramError("TITLE_TOO_LONG")
  }
  const lines = trimLeadingAndTrailingBlankLines(
    text.replace(/\r\n/g, "\n").split("\n").map(makeLine),
  )
  const [items] = text !== "" ? parseItems(lines, -1) : [[]]
  return { title: title.trim(), items, createdAt }
}

export type ErrorCode =
  | "TITLE_TOO_LONG"
  | "EMPTY_LINE"
  | "INVALID_INDENTATION"
  | "INVALID_DURATION"
  | "MISSING_SPACE_SEPARATOR"
  | "EMPTY_LOOP"
  | "INVALID_REPETITIONS"
  | "INVALID_ENTRY"

export class ProgramError extends Error {
  code: ErrorCode
  constructor(code: ErrorCode) {
    super(code)
    this.code = code
  }
}

export class ParseError extends ProgramError {
  line: Line
  constructor(line: Line, code: ErrorCode) {
    super(code)
    this.line = line
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
      throw new ParseError(line, "EMPTY_LINE")
    }
    if (line.indent <= parentIndent) {
      break
    }
    if (line.indent > parentIndent + 1) {
      throw new ParseError(line, "INVALID_INDENTATION")
    }
    lines.shift()

    const activityLine = line.text.match(/^(\d+):(\d+)(\*)?(.*)?$/)
    if (activityLine) {
      const [_, minutes, seconds, skipLast, title] = activityLine
      const duration = (() => {
        const m = parseInt(minutes)
        const s = parseInt(seconds)
        if (seconds.length != 2 || s >= 60) {
          throw new ParseError(line, "INVALID_DURATION")
        }
        const total = m * 60 + s
        if (total === 0) {
          throw new ParseError(line, "INVALID_DURATION")
        }
        return total
      })()
      if (title && title.length > 0 && title.substring(0, 1) !== " ") {
        throw new ParseError(line, "MISSING_SPACE_SEPARATOR")
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
      if (parseInt(repeat) === 0) {
        throw new ParseError(line, "INVALID_REPETITIONS")
      }
      const [loopItems, remainingLines] = parseItems(lines, line.indent)
      if (loopItems.length === 0) {
        throw new ParseError(line, "EMPTY_LOOP")
      }
      items.push({
        kind: "LOOP",
        repeat: parseInt(repeat),
        items: loopItems,
      })
      lines = remainingLines
      continue
    }

    throw new ParseError(line, "INVALID_ENTRY")
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
    throw new ParseError(line, "INVALID_INDENTATION")
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
