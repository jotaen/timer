import { useState, useEffect, useCallback } from "react"
import { Program } from "../program.ts"
import { decode, encode } from "../encode.ts"

export type UseProgram = {
  program?: Program
  loadProgram: (p: Program) => void
  clearProgram: () => void
}

export function useProgram(): UseProgram {
  const [program, setProgram] = useState<Program | undefined>(() => {
    const p = loadFromUrl()
    populateTabState(p, false)
    return p
  })

  useEffect(() => {
    const handleHashChange = () => {
      const p = loadFromUrl()
      populateTabState(p, false)
      setProgram(p)
    }
    window.addEventListener("hashchange", handleHashChange)
    return () => {
      window.removeEventListener("hashchange", handleHashChange)
    }
  }, [])

  return {
    program,
    loadProgram: useCallback((p: Program) => {
      populateTabState(p)
      setProgram(p)
    }, []),
    clearProgram: useCallback(() => {
      populateTabState(undefined)
      setProgram(undefined)
    }, []),
  }
}

function populateTabState(p?: Program, newHistoryEntry = true): void {
  const prefix = p ? `${p.title} – ` : ""
  document.title = `${prefix}Timer`
  const hash = p ? `/#${encode(p)}` : "/"
  if (newHistoryEntry) {
    window.history.pushState({}, "", hash)
  } else {
    window.history.replaceState({}, "", hash)
  }
}

function loadFromUrl(): Program | undefined {
  const blob = window.location.hash.substring(1)
  if (!blob) {
    return undefined
  }
  if (blob === "demo") {
    return demoProgram
  }
  try {
    return decode(blob)
  } catch (e) {
    console.error(e)
    return undefined
  }
}

export const demoProgram: Program = {
  title: "Sports!",
  items: [
    { kind: "ACTIVITY", title: "Get ready", duration: 10, skipLast: false },
    {
      kind: "LOOP",
      repeat: 3,
      items: [
        {
          kind: "ACTIVITY",
          title: "Work out",
          duration: 30,
          skipLast: false,
        },
        { kind: "ACTIVITY", title: "Rest", duration: 15, skipLast: true },
      ],
    },
    {
      kind: "LOOP",
      repeat: 4,
      items: [
        {
          kind: "ACTIVITY",
          title: "Stretch",
          duration: 45,
          skipLast: false,
        },
        {
          kind: "ACTIVITY",
          title: "Change position",
          duration: 10,
          skipLast: true,
        },
      ],
    },
    { kind: "ACTIVITY", title: "Cool down", duration: 20, skipLast: false },
  ],
}
