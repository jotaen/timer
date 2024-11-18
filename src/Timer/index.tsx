import React from "react"
// @ts-ignore
import css from "./style.module.css"
import { formatClock } from "../format"
import { STATUS, useTicker } from "./useTicker"
import { Item } from "../activity.ts"
import { Screens, ScreenProps } from "../Main"
import { Toolbar } from "../Main/Toolbar"

export type TimerProps = ScreenProps & {
  activities: Item[]
}

export function Timer({ activities, goToScreen }: TimerProps) {
  const ticker = useTicker(activities)
  const clock = ticker.tick ? formatClock(ticker.tick.remaining) : "--:--"
  const total = ticker.tick ? formatClock(ticker.total) : "--:--"

  return (
    <div className={css.main}>
      <Toolbar>
        <button onClick={() => goToScreen(Screens.Editor)}>Edit</button>
        <div style={{ flex: 1 }}></div>
        <button onClick={() => goToScreen(Screens.Settings)}>Settings</button>
      </Toolbar>
      <div className={css.title}>
        <div style={{ flex: 1 }}>Timer</div>
        <div>{total}</div>
      </div>
      <div className={css.clock}>{clock}</div>
      <div id="activity" style={{ alignSelf: "center" }}></div>
      <div className={css.controls}>
        <button
          disabled={ticker.status === STATUS.ENDED}
          onClick={
            ticker.status === STATUS.RUNNING
              ? () => ticker.pause()
              : () => ticker.run()
          }
        >
          {
            {
              [STATUS.RESET]: "Start",
              [STATUS.ENDED]: "Start",
              [STATUS.RUNNING]: "Pause",
              [STATUS.PAUSED]: "Resume",
            }[ticker.status]
          }
        </button>
        <button
          disabled={ticker.status === STATUS.RESET}
          onClick={() => ticker.reset()}
        >
          Reset
        </button>
      </div>
    </div>
  )
}
