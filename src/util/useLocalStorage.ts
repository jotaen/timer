import { useCallback, useState } from "react"

export function useLocalStorage<T extends boolean | number | string>(
  key: string,
  defaultValue: T,
): [T, (v: T) => void] {
  const [marshall, unmarshall] = ((): [(v: T) => string, (v: string) => T] => {
    switch (typeof defaultValue) {
      case "boolean":
        return [(v) => (v ? "true" : "false"), (v) => (v === "true") as T]
      case "number":
        return [
          (v) => v.toString(),
          (v) => {
            const n = parseFloat(v)
            if (Number.isNaN(n)) {
              throw new Error("Not a number")
            }
            return n as T
          },
        ]
      case "string":
        return [(v) => v as string, (v: string) => v as T]
      default:
        throw new Error("Unsupported type")
    }
  })()

  const [cachedValue, setCachedValue] = useState(() => {
    const storedValue = window.localStorage.getItem(key)
    if (storedValue !== null) {
      try {
        return unmarshall(storedValue)
      } catch {
        window.localStorage.removeItem(key)
        return defaultValue
      }
    }
    return defaultValue
  })

  const setValue = useCallback((v: T) => {
    window.localStorage.setItem(key, marshall(v))
    setCachedValue(v)
  }, [])

  return [cachedValue, setValue]
}
