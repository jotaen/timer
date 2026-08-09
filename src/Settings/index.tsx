import React from "react"
import css from "./style.module.css"
import { Screens, ScreenProps } from "../App"
import { Toolbar } from "../Toolbar"
import { useServiceContext } from "../App/useServiceContext.ts"
import { Locale, localeOptions, useLocale, useT } from "../i18n/locale.tsx"

export type SettingsProps = ScreenProps & {}

export function Settings({ goToScreen }: SettingsProps) {
  const t = useT()
  const { beeper, voice } = useServiceContext()
  const [locale, setLocale] = useLocale()

  const selectedVoiceLanguage = voice.currentVoice?.lang
  const voicesForSelectedLanguage =
    voice.voices.find(([lang]) => lang === selectedVoiceLanguage)?.[1] ?? []

  const changeVoiceLanguage = (lang: string) => {
    const voicesOfLanguage = voice.voices.find(([l]) => l === lang)?.[1] ?? []
    if (voicesOfLanguage.length > 0) {
      voice.setVoice(voicesOfLanguage[0].voiceURI)
    }
  }

  return (
    <div>
      <Toolbar>
        <button onClick={() => goToScreen(Screens.Menu)}>{t.back}</button>
        <div style={{ flex: 1 }}></div>
      </Toolbar>
      <div className={css.title}>
        <h2>{t.appLanguageTitle}</h2>
        <select
          value={locale}
          onChange={(evt) => setLocale(evt.target.value as Locale)}
        >
          {localeOptions.map(({ code, name }) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </div>
      <div className={css.details}>
        <div className={css.hint}>{t.appLanguageHint}</div>
      </div>

      <div className={css.title}>
        <h2>{t.callOutTitlesTitle}</h2>
        <label className={css.toggle}>
          <input
            type="checkbox"
            checked={voice.shouldSpeak}
            onChange={(evt) => voice.setShouldSpeak(evt.target.checked)}
          />
          <span className={css.toggleSlider}></span>
        </label>
      </div>
      <div className={css.details}>
        <div className={css.hint}>{t.callOutTitlesHint}</div>
        <div className={css.subsetting}>
          {t.volume}
          <input
            type="range"
            disabled={!voice.shouldSpeak}
            value={(voice.volume * 100).toFixed(0)}
            min={0}
            max={100}
            onChange={(evt) => voice.setVolume(evt.target.valueAsNumber / 100)}
          />
        </div>
        <div className={css.subsetting}>
          {t.voiceLanguage}
          <select
            disabled={!voice.shouldSpeak}
            onChange={(evt) => changeVoiceLanguage(evt.target.value)}
            value={selectedVoiceLanguage ?? ""}
          >
            {voice.voices.map(([lang]) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          <select
            disabled={!voice.shouldSpeak}
            onChange={(evt) => voice.setVoice(evt.target.value)}
            value={voice.currentVoice?.voiceURI ?? ""}
          >
            {voicesForSelectedLanguage.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={css.title}>
        <h2>{t.beepCountdownTitle}</h2>
        <label className={css.toggle}>
          <input
            type="checkbox"
            checked={beeper.shouldBeep}
            onChange={(evt) => beeper.setShouldBeep(evt.target.checked)}
          />
          <span className={css.toggleSlider}></span>
        </label>
      </div>
      <div className={css.details}>
        <div className={css.hint}>{t.beepHint}</div>
        <div className={css.subsetting}>
          {t.volume}
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
    </div>
  )
}
