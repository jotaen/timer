import React, { useEffect, useState } from "react"
// @ts-ignore
import css from "./style.module.css"
import { ScreenProps, Screens } from "../Main"
import { Toolbar } from "../Toolbar"
import { Program } from "../program.ts"
import { serialise } from "../serialise.ts"
import { parse, ParseError } from "../parse.ts"
import { useNavigationGuard } from "../util/useNavigationGuard.ts"

export type EditorProps = ScreenProps & {
  program?: Program
  loadProgram: (p: Program) => void
  isReadonly: boolean
}

export function Editor({
  goToScreen,
  program,
  loadProgram,
  isReadonly,
}: EditorProps) {
  const [initialText, setInitialText] = useState<string>("")
  const [text, setText] = useState<string>("")
  const [title, setTitle] = useState<string>("")
  const [parseError, setParseError] = useState<ParseError | Error | null>(null)
  const navigationGuard = useNavigationGuard()

  useEffect(() => {
    if (program) {
      const p = serialise(program)
      setInitialText(p.program)
      setTitle(p.title)
      setText(p.program)
    }
  }, [program])

  const save = () => {
    try {
      const program = parse(title, text)
      loadProgram(program)
      goToScreen(Screens.Timer)
      navigationGuard.disable()
    } catch (e) {
      setParseError(e as Error)
      return
    }
  }

  const handleTextChange = (text: string) => {
    navigationGuard.enable(text !== initialText)
    setText(text)
    setParseError(null)
  }

  const isEmpty = text.trim() === "" // Empty title is fine.

  return (
    <div className={css.main}>
      <Toolbar showProgram={isReadonly}>
        <button
          onClick={() => {
            if (!navigationGuard.checkAndConfirm()) {
              return
            }
            goToScreen(program ? Screens.Timer : Screens.Menu)
          }}
        >
          Back
        </button>
        <div style={{ flex: 1 }}></div>
        <button onClick={save} disabled={isReadonly || isEmpty}>
          Save
        </button>
      </Toolbar>

      {!isReadonly && (
        <input
          type="text"
          value={title}
          className={css.title}
          onChange={(evt) => setTitle(evt.target.value)}
          placeholder="Title"
          maxLength={30}
        />
      )}
      {parseError && (
        <div className={css.error}>
          <div className={css.errorMessage}>Error: {parseError.message}</div>
          {parseError instanceof ParseError && (
            <div className={css.errorDetails}>
              <strong>Line {parseError.line.number}: </strong>
              {parseError.line.text.trimStart()}
              {parseError.hint && (
                <em>
                  <br />
                  {parseError.hint}
                </em>
              )}
            </div>
          )}
        </div>
      )}
      <textarea
        className={css.editor}
        onChange={(evt) => handleTextChange(evt.target.value)}
        onKeyDown={(evt) => {
          const hasIntercepted = handleControlKeys(evt)
          if (hasIntercepted) {
            evt.preventDefault()
            handleTextChange((evt.target as HTMLTextAreaElement).value)
          }
        }}
        value={text}
        disabled={isReadonly}
        placeholder="Program"
      ></textarea>
    </div>
  )
}

function handleControlKeys(
  evt: React.KeyboardEvent<HTMLTextAreaElement>,
): boolean {
  const textarea = evt.target as HTMLTextAreaElement
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const INDENTATION = "  "

  if (evt.key == "Tab") {
    textarea.value =
      textarea.value.substring(0, start) +
      INDENTATION +
      textarea.value.substring(end)
    textarea.selectionStart = textarea.selectionEnd = start + INDENTATION.length
    return true
  }

  if (evt.key == "Enter") {
    const textBeforeCursor = textarea.value.substring(0, start)
    const currentLineStart = textBeforeCursor.lastIndexOf("\n") + 1
    const currentLine = textarea.value.substring(currentLineStart, start)

    const indentMatch = currentLine.match(/^(\s*)/)
    const indent = indentMatch ? indentMatch[1] : ""

    textarea.value =
      textarea.value.substring(0, start) +
      "\n" +
      indent +
      textarea.value.substring(end)
    textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length
    return true
  }

  if (evt.key === "Backspace") {
    if (start === end && start > 0) {
      const textBeforeCursor = textarea.value.substring(0, start)
      const currentLineStart = textBeforeCursor.lastIndexOf("\n") + 1
      const currentLine = textarea.value.substring(currentLineStart, start)

      if (/^\s+$/.test(currentLine) && currentLine.length >= 2) {
        const removeCount = Math.min(2, currentLine.length)

        textarea.value =
          textarea.value.substring(0, start - removeCount) +
          textarea.value.substring(end)
        textarea.selectionStart = textarea.selectionEnd = start - removeCount
        return true
      }
    }
  }

  return false
}
