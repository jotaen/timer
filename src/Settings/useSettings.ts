import React, { useEffect, useState } from "react"
import { PersistenceJson } from "../util/persistence.ts"

export type Settings = {
  countDown: boolean
  setCountDown: (s: boolean) => void
  callOut: boolean
  setCallOut: (s: boolean) => void
}

const defaultSettings = {
  countDown: true,
  callOut: true,
}

const persistence = new PersistenceJson("settings")

export const SettingsContext = React.createContext<Settings>({
  setCountDown: () => {},
  setCallOut: () => {},
  ...defaultSettings,
})

export function useSettings(): Settings {
  const [countDown, setCountDown] = useState<boolean>(defaultSettings.countDown)
  const [callOut, setCallOut] = useState<boolean>(defaultSettings.callOut)

  // Read initial settings from local storage.
  useEffect(() => {
    const initialSettings = persistence.read()
    if (!initialSettings) {
      return
    }

    if (
      "countDown" in initialSettings &&
      typeof initialSettings.countDown === "boolean"
    ) {
      setCountDown(initialSettings.countDown)
    }

    if (
      "callOut" in initialSettings &&
      typeof initialSettings.callOut === "boolean"
    ) {
      setCallOut(initialSettings.callOut)
    }
  }, [])

  // Persist settings in local storage.
  useEffect(() => {
    window.localStorage.setItem(
      "settings",
      JSON.stringify({
        countDown,
        callOut,
      }),
    )
  }, [countDown, callOut])

  return { countDown, setCountDown, callOut, setCallOut }
}
