import React, { useContext } from "react"
import { Tick, ticker as createTicker, totalDuration } from "./ticker.ts"
import { Program } from "./program.ts"
import { Beeper } from "./util/beeper.ts"
import { Voice } from "./util/voice.ts"
import { SettingsContext } from "./Settings/useSettings.ts"

const beeper = new Beeper()
const voice = new Voice()

export enum STATUS {
  "RESET",
  "RUNNING",
  "PAUSED",
  "ENDED",
}

export type Ticker = Program & {
  tick: Tick | null
  status: STATUS
  remaining: number
  run: () => void
  pause: () => void
  reset: () => void
}

export function useTicker(program: Program): Ticker {
  const [status, setStatus] = React.useState<STATUS>(STATUS.RESET)
  const [remaining, setRemaining] = React.useState<number>(0)
  const [tick, setTick] = React.useState<Tick | null>(null)
  const [ticker, setTicker] = React.useState<Generator<Tick>>()
  const settings = useContext(SettingsContext)

  const end = () => {
    setTick({
      remaining: 0,
      readOut: false,
      currentActivity: "",
      beep: 0,
    })
    setRemaining(0)
    setStatus(STATUS.ENDED)
  }

  const run = () => {
    update()
    setStatus(STATUS.RUNNING)
  }

  const pause = () => {
    setStatus(STATUS.PAUSED)
  }

  const reset = () => {
    setTick(null)
    setTicker(createTicker(program.items))
    setRemaining(totalDuration(program.items) + 1)
    setStatus(STATUS.RESET)
  }

  const update = () => {
    if (!ticker) {
      return
    }

    const g = ticker.next()
    if (g.done) {
      end()
      beeper.beep(1000, 1000)
      return
    }

    const t = g.value
    setRemaining((x) => x - 1)
    setTick(t)

    if (settings.callOut && t.readOut) {
      voice.say(t.currentActivity)
    }
    if (settings.countDown && t.beep) {
      beeper.beep(700, t.beep)
    }
  }

  React.useEffect(() => {
    let interval: NodeJS.Timeout | undefined = undefined
    const clear = () => {
      clearInterval(interval)
      interval = undefined
    }
    const start = () => {
      interval = setInterval(update, 1000)
    }
    if (status === STATUS.RUNNING) {
      start()
    } else {
      clear()
    }
    return clear
  }, [status])

  // Trigger (initial) reset.
  React.useEffect(() => {
    reset()
  }, [program])

  return { ...program, status, remaining, tick, run, pause, reset }
}
