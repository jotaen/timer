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
    // localStorage access can throw (e.g. blocked by browser privacy
    // settings), in which case we just fall back to the default.
    let storedValue: string | null = null
    try {
      storedValue = window.localStorage.getItem(key)
    } catch {
      return defaultValue
    }
    if (storedValue !== null) {
      try {
        return unmarshall(storedValue)
      } catch {
        try {
          window.localStorage.removeItem(key)
        } catch {}
        return defaultValue
      }
    }
    return defaultValue
  })

  const setValue = useCallback((v: T) => {
    try {
      window.localStorage.setItem(key, marshall(v))
    } catch {}
    setCachedValue(v)
  }, [])

  return [cachedValue, setValue]
}
