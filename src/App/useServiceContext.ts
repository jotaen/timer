import { useContext, createContext } from "react"
import { UseBeeper } from "../util/useBeeper.ts"
import { UseVoice } from "../util/useVoice.ts"
import { NavigationGuard } from "../util/useNavigationGuard.ts"
import { WakeLock } from "../util/useWakeLock.ts"

export type ServiceContext = {
  beeper: UseBeeper
  voice: UseVoice
  navigationGuard: NavigationGuard
  wakeLock: WakeLock
  viewPreferences: ViewPreferences
}

export const ServiceContext = createContext<ServiceContext>(
  {} as ServiceContext, // Guaranteed to be there at runtime.
)

export function useServiceContext(): ServiceContext {
  return useContext(ServiceContext)
}

type ViewPreferences = {
  showSyntaxRules: boolean
  setShowSyntaxRules: (show: boolean) => void
}
