type TokenKind = "TIME" | "LOOP" | "SKIP" | "NEWLINE" | "MESSAGE"

type TokenSpec = [TokenKind, RegExp]

const tokenSpecs: TokenSpec[] = [
  ["TIME", /\d+:\d\d/],
  ["LOOP", /\d+x/],
  ["SKIP", /\*/],
  ["NEWLINE", /\n(?<INDENT> *)/],
  ["MESSAGE", / (.*)/],
]

const regex = RegExp(
  tokenSpecs.map(([name, re]) => `(?<${name}>${re.source})`).join("|"),
  "g",
)

interface TokenBase {
  value: string
}

interface TimeToken extends TokenBase {
  kind: "TIME"
}

interface LoopToken extends TokenBase {
  kind: "LOOP"
}

export interface SkipToken extends TokenBase {
  kind: "SKIP"
}

interface NewLineToken extends TokenBase {
  kind: "NEWLINE"
  indentationDepth: number
}

interface IndentToken extends TokenBase {
  kind: "INDENT"
}

interface DedentToken extends TokenBase {
  kind: "DEDENT"
}

interface IncorrectDedentToken extends TokenBase {
  kind: "INCORRECT_DEDENT"
}

interface MessageToken extends TokenBase {
  kind: "MESSAGE"
}

export type Token =
  | TimeToken
  | LoopToken
  | SkipToken
  | NewLineToken
  | MessageToken
  | IndentToken
  | DedentToken
  | IncorrectDedentToken

export function* tokenizeRaw(text: string): Generator<Token> {
  const matches = text.matchAll(regex)
  for (const match of matches) {
    const groups = match.groups!
    if (groups["TIME"]) {
      yield {
        kind: "TIME",
        value: groups["TIME"],
      }
    } else if (groups["LOOP"]) {
      yield {
        kind: "LOOP",
        value: groups["LOOP"],
      }
    } else if (groups["SKIP"]) {
      yield {
        kind: "SKIP",
        value: groups["SKIP"],
      }
    } else if (groups["NEWLINE"]) {
      yield {
        kind: "NEWLINE",
        value: groups["NEWLINE"],
        indentationDepth: groups["INDENT"].length,
      }
    } else if (groups["MESSAGE"]) {
      yield {
        kind: "MESSAGE",
        value: groups["MESSAGE"],
      }
    }
  }
}

export function* recognizeIndents(
  tokenStream: Iterable<Token>,
): Generator<Token> {
  const indentationLevels: number[] = []
  for (const token of tokenStream) {
    yield token
    if (token.kind !== "NEWLINE") {
      continue
    }
    let currentDepth = indentationLevels.at(-1) ?? 0
    if (token.indentationDepth > currentDepth) {
      yield { kind: "INDENT", value: "" }
      indentationLevels.push(token.indentationDepth)
    } else if (token.indentationDepth < currentDepth) {
      indentationLevels.pop()
      while (true) {
        currentDepth = indentationLevels.pop() ?? 0
        if (token.indentationDepth <= currentDepth) {
          yield { kind: "DEDENT", value: "" }
        } else if (token.indentationDepth > currentDepth) {
          yield { kind: "INCORRECT_DEDENT", value: "" }
        }
        if (token.indentationDepth >= currentDepth) {
          indentationLevels.push(currentDepth)
          break
        }
      }
    }
  }
}

export const tokenize = (textInput: string) =>
  recognizeIndents(tokenizeRaw(textInput))
