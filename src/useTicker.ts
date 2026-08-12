import { useEffect, useState } from "react"
import { Tick, ticker as createTicker, totalDuration } from "./ticker.ts"
import { Program } from "./program.ts"
import { useInterval } from "./util/useInterval.ts"

import { useServiceContext } from "./App/useServiceContext.ts"
import { useT } from "./i18n/locale.tsx"

export enum STATUS {
  RESET,
  RUNNING,
  PAUSED,
}

export type Ticker = {
  tick: Tick | null
  status: STATUS
  remaining: number
  run: () => void
  pause: () => void
  reset: () => void
}

const TIMER_RUNNING_GUARD = "ticker:timer-running"

const voidProgram = {
  title: "",
  items: [],
  createdAt: new Date("2026-01-01T00:00:00Z"),
}

export function useTicker(program?: Program): Ticker {
  if (!program) {
    program = voidProgram
  }
  const [status, setStatus] = useState<STATUS>(STATUS.RESET)
  const [remaining, setRemaining] = useState<number>(0)
  const [tick, setTick] = useState<Tick | null>(null)
  const [ticker, setTicker] = useState<Generator<Tick>>()
  const { beeper, voice, wakeLock, navigationGuard } = useServiceContext()
  const t = useT()
  const interval = useInterval(() => {
    if (!ticker) {
      return
    }

    const g = ticker.next()
    if (g.done) {
      reset()
      beeper.beep(900, 1000)
      return
    }

    if (tick !== null) {
      // Skip on initial run.
      setRemaining((x) => x - 1)
    }
    const t = g.value
    setTick(t)
    if (t.readOut) {
      voice.say(t.currentActivity)
    }
    if (t.beep) {
      beeper.beep(700, t.beep)
    }
  }, 1000)

  const run = () => {
    beeper.enable()
    interval.start()
    setStatus(STATUS.RUNNING)
    wakeLock.on()
    navigationGuard.enable(TIMER_RUNNING_GUARD, t.timerRunningConfirm)
  }

  // Note: the navigation guard stays enabled while the timer is paused.
  const pause = () => {
    interval.stop()
    setStatus(STATUS.PAUSED)
    wakeLock.off()
    voice.stop()
  }

  const reset = () => {
    interval.stop()
    setTick(null)
    setTicker(createTicker(program.items))
    setRemaining(totalDuration(program.items))
    setStatus(STATUS.RESET)
    wakeLock.off()
    voice.stop()
    navigationGuard.disable(TIMER_RUNNING_GUARD)
  }

  // Trigger (initial) reset.
  useEffect(() => {
    reset()
  }, [program])

  return { status, remaining, tick, run, pause, reset }
}
