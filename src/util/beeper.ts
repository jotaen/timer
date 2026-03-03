export class Beeper {
  private audioCtx: AudioContext | undefined

  async activate() {
    if (!this.audioCtx) {
      this.audioCtx = new (
        window.AudioContext ||
        (window as any).webkitAudioContext ||
        (window as any).audioContext
      )()
    }

    if (this.audioCtx.state === "suspended") {
      await this.audioCtx.resume()
    }
  }

  async beep(frequency: number, duration: number) {
    await this.activate()
    if (!this.audioCtx) {
      return
    }

    const oscillator = this.audioCtx.createOscillator()
    const gainNode = this.audioCtx.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(this.audioCtx.destination)
    gainNode.gain.value = 0.5 // volume
    oscillator.frequency.value = frequency
    oscillator.type = "square"
    oscillator.start(this.audioCtx.currentTime)
    oscillator.stop(this.audioCtx.currentTime + duration / 1000)
  }
}
