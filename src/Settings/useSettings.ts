import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Settings = {
  countDown: boolean
  setCountDown: (countDown: boolean) => void
  callOut: boolean
  setCallOut: (callOut: boolean) => void
  showSyntaxRules: boolean
  setShowSyntaxRules: (showSyntaxRules: boolean) => void
}

export const useSettings = create<Settings>()(
  persist(
    (set) => ({
      countDown: true,
      setCountDown: (countDown) => set({ countDown }),
      callOut: true,
      setCallOut: (callOut) => set({ callOut }),
      showSyntaxRules: true,
      setShowSyntaxRules: (showSyntaxRules) => set({ showSyntaxRules }),
    }),
    { name: "settings" },
  ),
)
