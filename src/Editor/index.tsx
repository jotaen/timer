import React, { useEffect, useState } from "react"
// @ts-ignore
import css from "./style.module.css"
import { ScreenProps, Screens } from "../Main"
import { Toolbar } from "../Main/Toolbar"
import { Program } from "../program.ts"
import { serialise } from "../serialise.ts"
import { parse } from "../parse.ts"

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
  const [text, setText] = useState<string>("")
  const [title, setTitle] = useState<string>("")
  useEffect(() => {
    if (program) {
      const p = serialise(program)
      setTitle(p.title)
      setText(p.program)
    }
  }, [program])

  const save = () => {
    const program = parse(title, text)
    loadProgram(program)
    goToScreen(Screens.Timer)
  }

  return (
    <div className={css.main}>
      <Toolbar showProgram={isReadonly}>
        <button onClick={() => goToScreen(Screens.Timer)}>Back</button>
        <div style={{ flex: 1 }}></div>
        <button onClick={save} disabled={isReadonly}>
          Save
        </button>
      </Toolbar>

      {!isReadonly && (
        <input
          type="text"
          defaultValue={title}
          className={css.title}
          onChange={(evt) => setTitle(evt.target.value)}
          placeholder="Title"
        />
      )}
      <textarea
        className={css.editor}
        onChange={(evt) => {
          setText(evt.target.value)
        }}
        onKeyDown={handleControlKeys}
        value={text}
        disabled={isReadonly}
        placeholder="Program"
      ></textarea>
    </div>
  )
}

function handleControlKeys(evt: React.KeyboardEvent<HTMLTextAreaElement>) {
  const textarea = evt.target as HTMLTextAreaElement
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const INDENTATION = "  "

  if (evt.key == "Tab") {
    evt.preventDefault()

    textarea.value =
      textarea.value.substring(0, start) +
      INDENTATION +
      textarea.value.substring(end)
    textarea.selectionStart = textarea.selectionEnd = start + INDENTATION.length
  }

  if (evt.key == "Enter") {
    evt.preventDefault()
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
  }

  if (evt.key === "Backspace") {
    if (start === end && start > 0) {
      const textBeforeCursor = textarea.value.substring(0, start)
      const currentLineStart = textBeforeCursor.lastIndexOf("\n") + 1
      const currentLine = textarea.value.substring(currentLineStart, start)

      if (/^\s+$/.test(currentLine) && currentLine.length >= 2) {
        evt.preventDefault()
        const removeCount = Math.min(2, currentLine.length)

        textarea.value =
          textarea.value.substring(0, start - removeCount) +
          textarea.value.substring(end)
        textarea.selectionStart = textarea.selectionEnd = start - removeCount
      }
    }
  }
}
