export class Voice {
  // https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API#speech_synthesis
  // https://mdn.github.io/dom-examples/web-speech-api/speak-easy-synthesis/

  say(text: string) {
    const synth = window.speechSynthesis
    if (!synth) {
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = synth.getVoices()[0]
    utterance.pitch = 1.0
    utterance.rate = 1.0
    utterance.volume = 1.0
    synth.speak(utterance)
  }
}
