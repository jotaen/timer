import React from "react"
// @ts-ignore
import css from "./style.module.css"
import { Screens, ScreenProps } from "../Main"
import { Toolbar } from "../Main/Toolbar"
import { Settings } from "./useSettings.ts"

export type SettingsProps = ScreenProps & {
  settings: Settings
}

export function Settings({ goToScreen, settings }: SettingsProps) {
  return (
    <div>
      <Toolbar>
        <button onClick={() => goToScreen(Screens.Menu)}>Back</button>
        <div style={{ flex: 1 }}></div>
      </Toolbar>
      <h2>Audio</h2>
      <Setting
        title="“Beep” Count Down"
        explanation="Whether to count down the last 3 seconds of an activity with a “beep” sound."
      >
        <input
          type="checkbox"
          checked={settings.countDown}
          onChange={(evt) => settings.setCountDown(evt.target.checked)}
        />
      </Setting>
      <Setting
        title="Read Out Titles"
        explanation="Whether to read out the titles when an activity begins."
      >
        <input
          type="checkbox"
          checked={settings.callOut}
          onChange={(evt) => settings.setCallOut(evt.target.checked)}
        />
      </Setting>
    </div>
  )
}

function Setting({
  title,
  explanation,
  children,
}: {
  title: string
  explanation?: string
  children: React.ReactNode
}) {
  return (
    <div className={css.setting}>
      <div>
        <strong>{title}</strong>
        {children}
      </div>
      <span>{explanation}</span>
    </div>
  )
}
