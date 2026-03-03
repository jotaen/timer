import React from "react"
// @ts-ignore
import css from "./style.module.css"
import { Screens, ScreenProps } from "../Main"
import { Toolbar } from "../Toolbar"
import { useSettings } from "./useSettings.ts"

export type SettingsProps = ScreenProps & {}

export function Settings({ goToScreen }: SettingsProps) {
  const { countDown, setCountDown, callOut, setCallOut } = useSettings()
  return (
    <div>
      <Toolbar>
        <button onClick={() => goToScreen(Screens.Menu)}>Back</button>
        <div style={{ flex: 1 }}></div>
      </Toolbar>
      <h2>Audio</h2>
      <Setting
        title="“Beep” Count Down"
        explanation={
          <>
            Whether to count down the last 3 seconds of an activity with a
            “beep” sound.
            <br />
            Note: make sure to unsilence your device for this to work.
          </>
        }
      >
        <input
          type="checkbox"
          checked={countDown}
          onChange={(evt) => setCountDown(evt.target.checked)}
        />
      </Setting>
      <Setting
        title="Read Out Titles"
        explanation="Whether to read out the titles when an activity begins."
      >
        <input
          type="checkbox"
          checked={callOut}
          onChange={(evt) => setCallOut(evt.target.checked)}
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
  explanation?: React.ReactNode
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
