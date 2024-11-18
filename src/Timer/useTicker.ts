import React from "react"
import { Tick, ticker as createTicker, totalDuration } from "../ticker"
import { Activity, Item } from "../activity"
import { Beeper } from "../util/beeper"
import { Voice } from "../util/voice"

export enum STATUS {
  "RESET",
  "RUNNING",
  "PAUSED",
  "ENDED",
}

const beeper = new Beeper()
const voice = new Voice()

export function useTicker(activities: Item[]) {
  const [status, setStatus] = React.useState<STATUS>(STATUS.RESET)
  const [total, setTotal] = React.useState<number>(-1)
  const [tick, setTick] = React.useState<Tick | null>(null)
  const [ticker, setTicker] = React.useState<Generator<Tick>>()

  const end = () => {
    setTick({
      remaining: 0,
      readOut: false,
      activity: "",
      beep: 0,
    })
    setTotal(0)
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
    setTicker(createTicker(activities))
    setTotal(totalDuration(activities) + 1)
    setStatus(STATUS.RESET)
  }

  const update = () => {
    if (!ticker) {
      return
    }

    const g = ticker.next()
    if (g.done) {
      end()
      beeper.beep(1400, 1000)
      return
    }

    const t = g.value
    console.debug(t)
    setTotal((x) => x - 1)
    setTick(t)

    if (t.readOut) {
      voice.say(t.activity)
    }
    if (t.beep) {
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
  }, [activities])

  return { status, total, tick, run, pause, reset }
}
