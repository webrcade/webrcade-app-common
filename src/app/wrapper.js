import * as LOG from '../log'
import { hideInactiveMouse } from '../input/hidemouse.js'
import { Controller, Controllers, DefaultKeyCodeToControlMapping } from '../input/controls.js'
import { ScriptAudioProcessor } from '../audio/scriptprocessor.js'
import { Storage } from '../storage/storage.js'
import { TouchEndListener } from '../input/touch/touchendlistener.js'
import { VisibilityChangeMonitor } from '../display/visibilitymonitor.js'

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
    if (this.audioProcessor) {
      this.addAudioProcessorCallback(this.audioProcessor);
    }
  }

  getProps() {
    return this.app.appProps;
  }

  getApp() {
    return this.app;
  }

  getTitle() {
    return this.getProps().title;
  }

  getStorage() {
    return this.storage;
  }

  async saveStateToStorage(path, buffer, info = true) {
    const { storage } = this;

    if (buffer) {
      await storage.put(path, buffer);
    }
    if (info) {
      await storage.put(`${path}/info`, {
        title: this.getTitle(),
        time: new Date().getTime()
      });
    }
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
    return new ScriptAudioProcessor().setDebug(this.debug);
  }

  addAudioProcessorCallback(processor) {
    if (!processor) return;

    const { app } = this;

    processor.setCallback((running) => {
      setTimeout(() => app.setShowOverlay(!running), 50);
    });
  }

  onPause(p) {}

  async onShowPauseMenu() {}

  async onStart(canvas) {}

  showPauseMenu() {
    const { app, controllers } = this;

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
      .catch(e => LOG.error(e));
  }

  pause(p) {
    const { audioProcessor, displayLoop } = this;

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
