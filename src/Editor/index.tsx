import React, { useState } from "react"
// @ts-ignore
import css from "./style.module.css"
import { Screens, ScreenProps } from "../Main"
import { Toolbar } from "../Main/Toolbar"
import { Program } from "../program.ts"
import { stringify, parse } from "yaml"

export type EditorProps = ScreenProps & {
  program: Program | undefined
  loadProgram: (p: Program) => void
  isReadonly: boolean
}

export function Editor({
  goToScreen,
  program,
  loadProgram,
  isReadonly,
}: EditorProps) {
  const [text, setText] = useState<string>(() => {
    if (program) {
      return stringify(program)
    }
    return ""
  })

  const save = () => {
    const program = parse(text) as Program
    loadProgram(program)
    goToScreen(Screens.Timer)
  }

  return (
    <div className={css.main}>
      <Toolbar>
        <button onClick={() => goToScreen(Screens.Timer)}>Back</button>
        <div style={{ flex: 1 }}></div>
        <button onClick={save} disabled={isReadonly}>
          Save
        </button>
      </Toolbar>

      <textarea
        className={css.editor}
        onChange={(evt) => {
          setText(evt.target.value)
        }}
        value={text}
        disabled={isReadonly}
      ></textarea>
    </div>
  )
}
