import React, { useEffect, useState } from "react"
// @ts-ignore
import css from "./style.module.css"
import { Screens, ScreenProps } from "../Main"
import { Toolbar } from "../Main/Toolbar"
import { PersistenceString } from "../util/persistence.ts"
import { Program } from "../program.ts"

export type EditorProps = ScreenProps & {
  program: Program
}

const persistence = new PersistenceString("program")

export function Editor({ goToScreen }: EditorProps) {
  const [text, setText] = useState<string>("")

  useEffect(() => {
    const program = persistence.read()
    if (program) {
      setText(program)
    }
  }, [])

  const save = () => {
    persistence.save(text)
    goToScreen(Screens.Timer)
  }

  return (
    <div className={css.main}>
      <Toolbar>
        <button onClick={() => goToScreen(Screens.Timer)}>Cancel</button>
        <div style={{ flex: 1 }}></div>
        <button onClick={save}>Save</button>
      </Toolbar>

      <label className={css.label} htmlFor="">
        Timer Name
      </label>
      <input type="text" />

      <label className={css.label} htmlFor="">
        Program
      </label>
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
