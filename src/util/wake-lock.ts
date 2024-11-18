export class WakeLock {
  // https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API

  wakeLock: any = null

  async on() {
    if (!("wakeLock" in navigator)) {
      return
    }
    this.wakeLock = await navigator.wakeLock.request("screen")
  }

  async off() {
    if (!this.wakeLock) {
      return
    }
    await this.wakeLock.release()
  }
}
