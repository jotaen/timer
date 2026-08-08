import React from "react"
import css from "./style.module.css"
import { formatClock } from "../format"
import { STATUS, Ticker } from "../useTicker.ts"
import { Screens, ScreenProps } from "../App"
import { Toolbar } from "../Toolbar"
import { IconPause, IconPlay, IconStop } from "../util/Icons.tsx"
import { useT } from "../i18n/locale.tsx"

export type TimerProps = ScreenProps & {
  ticker: Ticker
}

export function Timer({ ticker, goToScreen }: TimerProps) {
  const t = useT()
  const [mins, secs] = formatClock(ticker.tick?.remaining).split(":")

  return (
    <div className={css.main}>
      <Toolbar isSubdued={false}>
        <button onClick={() => goToScreen(Screens.Editor)}>{t.edit}</button>
        <button onClick={() => goToScreen(Screens.Share)}>{t.share}</button>
        <div style={{ flex: 1 }}></div>
        <button
          onClick={() => {
            goToScreen(Screens.Menu)
          }}
        >
          {t.menu}
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
                    <span>{t.start}</span>
                  </>
                ),
                [STATUS.RUNNING]: (
                  <>
                    <IconPause />
                    <span>{t.pause}</span>
                  </>
                ),
                [STATUS.PAUSED]: (
                  <>
                    <IconPlay />
                    <span>{t.resume}</span>
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
              if (!window.confirm(t.confirmReset)) {
                return
              }
              ticker.reset()
            }}
          >
            <IconStop />
            <span>{t.reset}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
