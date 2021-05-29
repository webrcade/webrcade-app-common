const registerAudioResume = (obj, cb) => {
  // Audio resume
  let audioCtx = obj;
  let isProcessor = false;

  if (obj.audioCtx) {
    audioCtx = obj.audioCtx;
    isProcessor = true;
  }

  const docElement = document.documentElement;

  const resumeFunc = () => {
    if (isProcessor && obj.paused) {
      return;
    }

    const fSuccess = () => {
      if (cb) cb(true);

      docElement.removeEventListener("keydown", resumeFunc);
      docElement.removeEventListener("click", resumeFunc);
      docElement.removeEventListener("drop", resumeFunc);
      docElement.removeEventListener("dragdrop", resumeFunc);
      docElement.removeEventListener("touchend", resumeFunc);
    };

    if (audioCtx.state !== 'running') {
      audioCtx.resume()
        .then(() => {
          if (audioCtx.state === 'running') {
            fSuccess();
          }
        });
    } else {
      fSuccess();
    }
  }

  docElement.addEventListener("keydown", resumeFunc);
  docElement.addEventListener("click", resumeFunc);
  docElement.addEventListener("drop", resumeFunc);
  docElement.addEventListener("dragdrop", resumeFunc);
  docElement.addEventListener("touchend", resumeFunc);
}

class ScriptAudioProcessor {
  constructor(
    channelCount = 2,
    frequency = 48000,
    bufferSize = 16384,
    scriptBufferSize = 2048) {
    this.frequency = frequency;
    this.bufferSize = bufferSize;
    this.scriptBufferSize = scriptBufferSize;
    this.channelCount = channelCount;
    this.paused = true;

    this.audioCtx = null;
    this.audioNode = null;
    this.mixhead = 0;
    this.mixtail = 0;
    this.callback = null;

    this.tmpBuffers = new Array(channelCount);
    this.mixbuffer = new Array(channelCount);
    for (let i = 0; i < channelCount; i++) {
      this.mixbuffer[i] = new Array(bufferSize);
    }
  }

  isPlaying() {
    const { audioCtx } = this;
    return audioCtx && audioCtx.state === 'running';
  }

  setCallback(cb) {
    this.callback = cb;
  }

  getFrequency() { return this.frequency; }

  pause(p) {
    if (p == this.paused)
      return;
    if (!p) {
      this.audioCtx.resume();
    } else {
      this.audioCtx.suspend();
    }
    this.paused = p;
  }

  start() {
    if (!this.audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      this.audioCtx = window.AudioContext ?
        new window.AudioContext({ sampleRate: this.frequency }) :
        new window.webkitAudioContext();
      if (this.audioCtx.sampleRate) {
        this.frequency = this.audioCtx.sampleRate;
      }
      this.audioNode = this.audioCtx.createScriptProcessor(
        this.scriptBufferSize, 0, this.channelCount);
      this.audioNode.onaudioprocess = (e) => {
        for (let i = 0; i < this.channelCount; i++) {
          this.tmpBuffers[i] = e.outputBuffer.getChannelData(i);
        }
        let done = 0;
        let len = this.tmpBuffers[0].length;
        while ((this.mixtail != this.mixhead) && (done < len)) {
          for (let i = 0; i < this.channelCount; i++) {
            this.tmpBuffers[i][done] = this.mixbuffer[i][this.mixtail];
          }
          done++;
          this.mixtail++;
          if (this.mixtail == this.bufferSize) {
            this.mixtail = 0;
          }
        }
        while (done < len) {
          for (let i = 0; i < this.channelCount; i++) {
            this.tmpBuffers[i] = 0;
          }
          done++;
        }
      }
      this.audioNode.connect(this.audioCtx.destination);
      this.paused = false;

     // Add audio resume
     setTimeout(() => {
      if (!this.isPlaying()) {
        registerAudioResume(this, this.callback);
        if (this.callback) this.callback(false);
      }}, 100);
    }
  }

  storeSound(channels, length) {
    for (let i = 0; i < length; i++) {
      for (let j = 0; j < channels.length; j++) {
        this.mixbuffer[j][this.mixhead] = channels[j][i];
      }
      this.mixhead++;
      if (this.mixhead == this.bufferSize)
        this.mixhead = 0;
    }
  }
}

export { ScriptAudioProcessor, registerAudioResume }
