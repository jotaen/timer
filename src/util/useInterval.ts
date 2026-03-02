import { useEffect, useRef, useState } from "react"

export function useInterval(callback: Function, delay: number) {
  const [isRunning, setIsRunning] = useState(false)
  const savedCallback = useRef<Function>(() => {})

  useEffect(() => {
    savedCallback.current = callback
  })

  useEffect(() => {
    let id: number | undefined = undefined
    const clear = () => {
      window.clearInterval(id)
      id = undefined
    }
    if (isRunning) {
      savedCallback.current()
      id = window.setInterval(() => {
        savedCallback.current()
      }, delay)
    } else {
      clear()
    }
    return clear
  }, [isRunning])

  return {
    start: () => {
      setIsRunning(true)
    },
    stop: () => {
      setIsRunning(false)
    },
  }
}
