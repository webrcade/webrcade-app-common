import { Controller, Controllers, DefaultKeyCodeToControlMapping } from '../input/controls.js'
import { Storage } from '../storage/storage.js'
import { TouchEndListener } from '../util/touchendlistener.js'
import { VisibilityChangeMonitor } from '../display/visibilitymonitor.js'
import { ScriptAudioProcessor } from '../audio/scriptprocessor.js'
import { hideInactiveMouse } from '../input/hidemouse.js'

export class AppWrapper {
  constructor(app, debug = false) {
    this.app = app;
    this.started = false;
    this.debug = debug;
    this.paused = false;

    this.canvas = null;
    this.touchListener = null;
    this.displayLoop = null;

    this.controllers = this.createControllers();
    this.storage = this.createStorage();
    this.visibilityMonitor = this.createVisibilityMonitor();
    this.audioProcessor = this.createAudioProcessor();
  }

  createControllers() {
    return new Controllers([
      new Controller(new DefaultKeyCodeToControlMapping()),
      new Controller()
    ]);
  }

  createStorage() {
    return new Storage();
  }

  createTouchListener() {
    const { app } = this;

    return new TouchEndListener(() => {
      if (!app.isShowOverlay() && this.pause(true)) {
        setTimeout(() => this.showPauseMenu(), 50);
      }
    });
  }

  createVisibilityMonitor() {
    const { app } = this;

    return new VisibilityChangeMonitor((p) => {
      if (!app.isPauseScreen()) {
        this.pause(p);
      }
    });
  }

  createAudioProcessor() {
    const { app } = this;

    const audioProcessor = new ScriptAudioProcessor();
    audioProcessor.setCallback((running) => {
      setTimeout(() => app.setShowOverlay(!running), 50);
    });
    return audioProcessor;
  }

  onPause(p) {}

  async onShowPauseMenu() {}

  async onStart(canvas) {}

  showPauseMenu() {
    const { controllers, app } = this;

    if (controllers) {
      controllers.setEnabled(false);
    }

    this.onShowPauseMenu()
      .then(app.pause(() => {
        if (controllers) {
          controllers.setEnabled(true);
        }
        this.pause(false);
      }))
      .catch(e => console.error(e));
  }

  pause(p) {
    const { displayLoop, audioProcessor } = this;

    if ((p && !this.paused) || (!p && this.paused)) {
      this.paused = p;
      if (displayLoop) displayLoop.pause(p);
      if (audioProcessor) audioProcessor.pause(p);
      this.onPause(p);
      return true;
    }
    return false;
  }

  async start(canvas) {
    if (this.started) return;
    this.started = true;

    this.canvas = canvas;

    if (canvas) {
      hideInactiveMouse(canvas);
    }

    await this.onStart(canvas);

    setTimeout(() => {
      this.touchListener = this.createTouchListener();
    }, 100);
  }
}
