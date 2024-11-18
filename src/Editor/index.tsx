import React, { useEffect, useState } from "react"
// @ts-ignore
import css from "./style.module.css"
import { Screens, ScreenProps } from "../Main"
import { Toolbar } from "../Main/Toolbar"
import { Activity } from "../activity"

export type EditorProps = ScreenProps & {
  // activities: Activity[]
}

export function Editor({ goToScreen }: EditorProps) {
  const [text, setText] = useState<string>("")

  useEffect(() => {
    const program = window.localStorage.getItem("program") || ""
    setText(program)
  }, [])

  const save = () => {
    window.localStorage.setItem("program", text)
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
