import React, { useContext } from "react"
// @ts-ignore
import css from "./style.module.css"
import { Screens, ScreenProps } from "../Main"
import { Toolbar } from "../Main/Toolbar"
import { SettingsContext } from "./useSettings.ts"

export type SettingsProps = ScreenProps & {}

export function Settings({ goToScreen }: SettingsProps) {
  const settings = useContext(SettingsContext)
  return (
    <div>
      <Toolbar>
        <button onClick={() => goToScreen(Screens.Timer)}>Back</button>
        <div style={{ flex: 1 }}></div>
      </Toolbar>
      <div className={css.setting}>
        <span>“Beep” count down (3, 2, 1)</span>
        <input
          type="checkbox"
          checked={settings.countDown}
          onChange={(evt) => settings.setCountDown(evt.target.checked)}
        />
      </div>
      <div className={css.setting}>
        <span>Read out titles</span>
        <input
          type="checkbox"
          checked={settings.callOut}
          onChange={(evt) => settings.setCallOut(evt.target.checked)}
        />
      </div>
    </div>
  )
}
