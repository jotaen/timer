import { useContext, createContext } from "react"
import { Beeper } from "../util/beeper.ts"
import { Voice } from "../util/voice.ts"
import { NavigationGuard } from "../util/useNavigationGuard.ts"
import { WakeLock } from "../util/useWakeLock.ts"

export type ServiceContext = {
  beeper: Beeper
  voice: Voice
  navigationGuard: NavigationGuard
  wakeLock: WakeLock
}

export const ServiceContext = createContext<ServiceContext>(
  {} as ServiceContext, // Guaranteed to be there at runtime.
)

export function useServiceContext(): ServiceContext {
  return useContext(ServiceContext)
}
