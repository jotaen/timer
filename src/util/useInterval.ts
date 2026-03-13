import { useCallback, useEffect, useRef, useState } from "react"

export function useInterval(callback: Function, delay: number) {
  const [isRunning, setIsRunning] = useState(false)
  // We have to store a callback ref as a workaround:
  // https://overreacted.io/making-setinterval-declarative-with-react-hooks/
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
    start: useCallback(() => {
      setIsRunning(true)
    }, []),
    stop: useCallback(() => {
      setIsRunning(false)
    }, []),
  }
}
