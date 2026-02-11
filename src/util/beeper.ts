export class Beeper {
  beep(frequency: number, duration: number) {
    const audioCtx = new (
      window.AudioContext ||
      (window as any).webkitAudioContext ||
      (window as any).audioContext
    )()
    if (!audioCtx) {
      return
    }

    const oscillator = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    gainNode.gain.value = 0.5 // volume
    oscillator.frequency.value = frequency
    oscillator.type = "square"

    oscillator.start(audioCtx.currentTime)
    oscillator.stop(audioCtx.currentTime + duration / 1000)
  }
}
