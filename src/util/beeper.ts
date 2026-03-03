export class Beeper {
  private audioCtx: AudioContext | undefined

  async activate() {
    if (!this.audioCtx) {
      console.debug("Audio context: creating...")
      this.audioCtx = new (
        window.AudioContext ||
        (window as any).webkitAudioContext ||
        (window as any).audioContext
      )()
    }

    if (this.audioCtx && this.audioCtx.state === "suspended") {
      console.debug("Audio context: resuming...")
      await this.audioCtx.resume()
    }
  }

  async beep(frequency: number, duration: number) {
    await this.activate()
    if (!this.audioCtx) {
      console.debug("Audio context: not available")
      return
    }

    console.debug("Audio context: beeping...")
    const oscillator = this.audioCtx.createOscillator()
    const gainNode = this.audioCtx.createGain()
    oscillator.connect(gainNode)
    oscillator.onended = () => {
      console.debug("Audio context: beep ended")
    }
    gainNode.connect(this.audioCtx.destination)
    gainNode.gain.value = 0.5 // volume
    oscillator.frequency.value = frequency
    oscillator.type = "square"
    const t = this.audioCtx.currentTime + 0.01
    oscillator.start(t)
    oscillator.stop(t + duration / 1000)
    console.debug(`Audio context: beep issued (f=${frequency}, d=${duration}), t=${t}`)
  }
}
