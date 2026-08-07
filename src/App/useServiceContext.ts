import { useContext, createContext } from "react"
import { UseBeeper } from "../util/useBeeper.ts"
import { UseVoice } from "../util/useVoice.ts"
import { NavigationGuard } from "../util/useNavigationGuard.ts"
import { WakeLock } from "../util/useWakeLock.ts"
import { FullScreen } from "../util/useFullScreen.ts"

export type ServiceContext = {
  beeper: UseBeeper
  voice: UseVoice
  navigationGuard: NavigationGuard
  wakeLock: WakeLock
  viewPreferences: ViewPreferences
  fullScreen: FullScreen
}

export const ServiceContext = createContext<ServiceContext | null>(null)

export function useServiceContext(): ServiceContext {
  const ctx = useContext(ServiceContext)
  if (!ctx) throw new Error("useServiceContext called outside <ServiceContext.Provider>")
  return ctx
}

type ViewPreferences = {
  showSyntaxRules: boolean
  setShowSyntaxRules: (show: boolean) => void
}
