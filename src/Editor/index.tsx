import React, { useEffect, useState } from "react"
// @ts-ignore
import css from "./style.module.css"
import { Screens, ScreenProps } from "../Main"
import { Toolbar } from "../Main/Toolbar"
import { Program } from "../program.ts"

export type EditorProps = ScreenProps & {
  program: Program | undefined
  setProgram: (p: Program) => void
}

export function Editor({ goToScreen, program, setProgram }: EditorProps) {
  const [text, setText] = useState<string>("")

  useEffect(() => {
    if (program) {
      setText(JSON.stringify(program, null, 2))
    }
  }, [])

  const save = () => {
    const program = JSON.parse(text) as Program
    setProgram(program)
    goToScreen(Screens.Main)
  }

  return (
    <div className={css.main}>
      <Toolbar>
        <button onClick={() => goToScreen(Screens.Main)}>Cancel</button>
        <div style={{ flex: 1 }}></div>
        <button onClick={save}>Save</button>
      </Toolbar>

      <textarea
        className={css.editor}
        onChange={(evt) => {
          setText(evt.target.value)
        }}
        value={text}
      ></textarea>
    </div>
  )
}
