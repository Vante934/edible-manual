// voice.js - 专业级语音交互模块

class VoiceAssistant {
  constructor(onResult, onStatusChange) {
    this.onResult = onResult;
    this.onStatusChange = onStatusChange;
    this.recognition = null;
    this.isListening = false;
    this.supported = false;
    this.init();
  }

  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.supported = false;
      return;
    }

    this.supported = true;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'zh-CN';
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event) => {
      let interimText = '';
      let finalText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }

      if (finalText) {
        this.onResult(finalText, true);
      } else if (interimText) {
        this.onResult(interimText, false);
      }
    };

    this.recognition.onstart = () => {
      this.isListening = true;
      this.onStatusChange('listening');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.onStatusChange('stopped');
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      if (event.error === 'no-speech') {
        this.onStatusChange('no-speech');
      } else if (event.error === 'not-allowed') {
        this.onStatusChange('not-allowed');
      } else {
        this.onStatusChange('error');
      }
    };
  }

  toggle() {
    if (!this.supported) {
      this.onStatusChange('not-supported');
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
    } else {
      this.recognition.start();
    }
  }

  stop() {
    if (this.isListening) {
      this.recognition.stop();
    }
  }
}

export { VoiceAssistant };
