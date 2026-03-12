import React from "react"
// @ts-ignore
import css from "./style.module.css"
import { formatClock } from "../format"
import { STATUS, Ticker } from "../useTicker.ts"
import { Screens, ScreenProps } from "../App"
import { Toolbar } from "../Toolbar"

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

function IconPause() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
      <path d="M5 6.25a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0zm3.5 0a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0z" />
    </svg>
  )
}

function IconStop() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
      <path d="M5 6.5A1.5 1.5 0 0 1 6.5 5h3A1.5 1.5 0 0 1 11 6.5v3A1.5 1.5 0 0 1 9.5 11h-3A1.5 1.5 0 0 1 5 9.5z" />
    </svg>
  )
}

function IconPlay() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
      <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445" />
    </svg>
  )
}
