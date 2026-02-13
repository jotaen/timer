import { useEffect, useState } from "react"
import { Tick, ticker as createTicker, totalDuration } from "./ticker.ts"
import { Program } from "./program.ts"
import { Beeper } from "./util/beeper.ts"
import { Voice } from "./util/voice.ts"
import { Settings } from "./Settings/useSettings.ts"

const beeper = new Beeper()
const voice = new Voice()

export enum STATUS {
  "RESET",
  "RUNNING",
  "PAUSED",
}

export type Ticker = {
  tick: Tick | null
  status: STATUS
  remaining: number
  run: () => void
  pause: () => void
  reset: () => void
}

export function useTicker(program: Program, settings: Settings): Ticker {
  const [status, setStatus] = useState<STATUS>(STATUS.RESET)
  const [remaining, setRemaining] = useState<number>(0)
  const [tick, setTick] = useState<Tick | null>(null)
  const [ticker, setTicker] = useState<Generator<Tick>>()

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
    setRemaining(totalDuration(program.items))
    setStatus(STATUS.RESET)
  }

  const update = () => {
    if (!ticker) {
      return
    }

    const g = ticker.next()
    if (g.done) {
      reset()
      beeper.beep(900, 1000)
      return
    }

    const isFirstRun = tick === null
    const t = g.value
    setRemaining((x) => x - (isFirstRun ? 0 : 1))
    setTick(t)

    if (settings.callOut && t.readOut) {
      voice.say(t.currentActivity)
    }
    if (settings.countDown && t.beep) {
      beeper.beep(700, t.beep)
    }
  }

  useEffect(() => {
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
  useEffect(() => {
    reset()
  }, [program])

  return { status, remaining, tick, run, pause, reset }
}
