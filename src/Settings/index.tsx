import React from "react"
// @ts-ignore
import css from "./style.module.css"
import { Screens, ScreenProps } from "../App"
import { Toolbar } from "../Toolbar"
import { useServiceContext } from "../App/useServiceContext.ts"

export type SettingsProps = ScreenProps & {}

export function Settings({ goToScreen }: SettingsProps) {
  const { beeper, voice } = useServiceContext()
  return (
    <div>
      <Toolbar>
        <button onClick={() => goToScreen(Screens.Menu)}>Back</button>
        <div style={{ flex: 1 }}></div>
      </Toolbar>
      <div className={css.title}>
        <label className={css.toggle}>
          <input
            type="checkbox"
            checked={beeper.shouldBeep}
            onChange={(evt) => beeper.setShouldBeep(evt.target.checked)}
          />
          <span className={css.toggleSlider}></span>
        </label>
        <h2>“Beep” Countdown</h2>
      </div>
      <div>
        <div className={css.hint}>
          Count down the last 3 seconds of an activity with a “beep” sound.
          (Note: make sure to unsilence the ringtone on your device for this to
          work.)
        </div>
        <div>
          Volume:
          <input
            type="range"
            disabled={!beeper.shouldBeep}
            value={(beeper.volume * 100).toFixed(0)}
            min={0}
            max={100}
            onChange={(evt) => beeper.setVolume(evt.target.valueAsNumber / 100)}
          />
        </div>
      </div>

      <div className={css.title}>
        <label className={css.toggle}>
          <input
            type="checkbox"
            checked={voice.shouldSpeak}
            onChange={(evt) => voice.setShouldSpeak(evt.target.checked)}
          />
          <span className={css.toggleSlider}></span>
        </label>
        <h2>Call Out Titles</h2>
      </div>
      <div>
        <div className={css.hint}>
          Read out the titles when an activity begins.
        </div>
        <div>
          Volume:
          <input
            type="range"
            disabled={!voice.shouldSpeak}
            value={(voice.volume * 100).toFixed(0)}
            min={0}
            max={100}
            onChange={(evt) => voice.setVolume(evt.target.valueAsNumber / 100)}
          />
        </div>
        <div>
          Voice/Language:
          <select
            onChange={(evt) => voice.setVoice(evt.target.value)}
            value={voice.currentVoice}
          >
            {voice.voices().map(([lang, vs]) => (
              <optgroup label={lang} key={lang}>
                {vs.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
