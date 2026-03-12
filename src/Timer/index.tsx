import React from "react"
// @ts-ignore
import css from "./style.module.css"
import { formatClock } from "../format"
import { STATUS, Ticker } from "../useTicker.ts"
import { Screens, ScreenProps } from "../App"
import { Toolbar } from "../Toolbar"
import { IconPause, IconPlay, IconStop } from "../util/Icons.tsx"

export type TimerProps = ScreenProps & {
  ticker: Ticker
}

export function Timer({ ticker, goToScreen }: TimerProps) {
  const [mins, secs] = formatClock(ticker.tick?.remaining).split(":")

  return (
    <div className={css.main}>
      <Toolbar isSubdued={false}>
        <button onClick={() => goToScreen(Screens.Editor)}>Edit</button>
        <button onClick={() => goToScreen(Screens.Share)}>Share</button>
        <div style={{ flex: 1 }}></div>
        <button
          onClick={() => {
            goToScreen(Screens.Menu)
          }}
        >
          Menu
        </button>
      </Toolbar>
      <div className={css.clock}>
        <span>{mins}</span>
        <span style={{ margin: "-0.1em -0.08em 0 -0.08em" }}>:</span>
        <span>{secs}</span>
      </div>
      <div className={css.activity} style={{ alignSelf: "center" }}>
        {ticker.tick?.currentActivity}
      </div>
      <div className={css.controls}>
        <div>
          <button
            className={css.btnControl}
            onClick={
              ticker.status === STATUS.RUNNING
                ? () => ticker.pause()
                : () => ticker.run()
            }
          >
            {
              {
                [STATUS.RESET]: (
                  <>
                    <IconPlay />
                    <span>Start</span>
                  </>
                ),
                [STATUS.RUNNING]: (
                  <>
                    <IconPause />
                    <span>Pause</span>
                  </>
                ),
                [STATUS.PAUSED]: (
                  <>
                    <IconPlay />
                    <span>Resume</span>
                  </>
                ),
              }[ticker.status]
            }
          </button>
        </div>
        <div>
          <button
            className={css.btnControl}
            disabled={ticker.status === STATUS.RESET}
            onClick={() => {
              if (!window.confirm("Are you sure?")) {
                return
              }
              ticker.reset()
            }}
          >
            <IconStop />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  )
}
