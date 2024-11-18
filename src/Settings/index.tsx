import React, { useState } from "react"
// @ts-ignore
import css from "./style.module.css"
import { Screens, ScreenProps } from "../Main"
import { Toolbar } from "../Main/Toolbar"

export type SettingsProps = ScreenProps & {}

export function Settings({ goToScreen }: SettingsProps) {
  return (
    <div>
      <Toolbar>
        <button onClick={() => goToScreen(Screens.Timer)}>Back</button>
        <div style={{ flex: 1 }}></div>
      </Toolbar>
      <div className={css.setting}>
        <span>Beep (3, 2, 1)</span>
        <input type="checkbox" />
      </div>
      <div className={css.setting}>
        <span>Read Out Titles</span>
        <input type="checkbox" />
      </div>
    </div>
  )
}
