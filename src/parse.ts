import { tokenize, Token } from "./lexer.ts"
import { Program, Item, Activity, Loop } from "./program.ts"

class ParseError extends Error {
  private token: Token | null

  constructor(message: string, token: Token | null) {
    super(message)
    this.token = token
  }

  toString(): string {
    return `${this.message}: ${JSON.stringify(this.token)}`
  }
}

export function parse(inputText: string): Item[] {
  const tokenIterator = tokenize(inputText)
  try {
    return parseBlock(tokenIterator)
  } catch (error) {
    if (error instanceof ParseError) {
      throw new Error(error.toString())
    }
    throw error
  }
}

function parseBlock(tokenIterator: Iterator<Token>): Item[] {
  const items = []
  while (true) {
    const nextToken = popToken(tokenIterator)
    if (!nextToken) {
      return items
    }
    if (nextToken.kind === "NEWLINE") {
      continue
    }
    if (nextToken.kind === "TIME") {
      items.push(parseActivity(nextToken, tokenIterator))
    } else if (nextToken.kind === "LOOP") {
      items.push(parseLoop(nextToken, tokenIterator))
    } else {
      throw new ParseError(
        "A Program must start with a loop or an activity",
        nextToken,
      )
    }
  }
}

function parseActivity(time: Token, tokenIterator: Iterator<Token>): Activity {
  if (time.kind !== "TIME") {
    throw new ParseError("Activity must start with a time", time)
  }
  const skipOrMessage = popToken(tokenIterator)

  let message
  let skipLast
  if (skipOrMessage?.kind === "SKIP") {
    skipLast = true
    message = popToken(tokenIterator)
  } else if (skipOrMessage?.kind === "MESSAGE") {
    skipLast = false
    message = skipOrMessage
  } else {
    throw new ParseError(
      `Time must be followed by a * or a message`,
      skipOrMessage,
    )
  }

  if (message?.kind !== "MESSAGE") {
    throw new ParseError("Message expected", message)
  }

  return {
    kind: "ACTIVITY",
    title: message.value,
    duration: 5, // TODO parse duration from time string
    skipLast,
  }
}

function parseLoop(loop: Token, tokenIterator: Iterator<Token>): Loop {
  if (loop.kind !== "LOOP") {
    throw new ParseError("A loop must start with a loop counter", loop)
  }
  const newline = popToken(tokenIterator)
  if (newline?.kind !== "NEWLINE") {
    throw new ParseError("Newline expected!", newline)
  }
  const indent = popToken(tokenIterator)
  if (indent?.kind !== "INDENT") {
    throw new ParseError("Indent expected", indent)
  }
  const items = parseBlock(tokenIterator)
  const dedent = popToken(tokenIterator)
  if (dedent?.kind !== "DEDENT") {
    throw new ParseError("Dedent expected", dedent)
  }
  return {
    kind: "LOOP",
    repeat: 5, // TODO: parse loop counter
    items: items,
  }
}

function popToken(tokenIterator: Iterator<Token>): Token | null {
  const { value, done } = tokenIterator.next()
  console.log(value)
  if (value === undefined && done) {
    return null
  } else {
    return value
  }
}
