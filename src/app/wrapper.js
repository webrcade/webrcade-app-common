import * as LOG from '../log'
import { settings } from '../settings'
import { hideInactiveMouse } from '../input/hidemouse.js'
import { Controller, Controllers, DefaultKeyCodeToControlMapping } from '../input/controls.js'
import { ScriptAudioProcessor } from '../audio/scriptprocessor.js'
import { Storage } from '../storage/storage.js'
import { TouchEndListener } from '../input/touch/touchendlistener.js'
import { VisibilityChangeMonitor } from '../display/visibilitymonitor.js'
import { SaveManager } from './saves'
import { showMessage } from '../react/components/message'
import { AppPrefs } from './prefs'

export class AppWrapper {
  constructor(app, debug = false) {
    this.app = app;
    this.started = false;
    this.debug = debug;
    this.paused = false;

    this.canvas = null;
    this.touchListener = null;
    this.displayLoop = null;

    this.showPauseDelay = 0;

    this.showMessageEnabled = false;
    this.message = null;
    this.saveManager = new SaveManager(this, this.getShowMessageCallback());
    this.controllers = this.createControllers();
    this.storage = this.createStorage();
    this.prefs = this.createPrefs();
    this.visibilityMonitor = this.createVisibilityMonitor();
    this.audioProcessor = this.createAudioProcessor();
    if (this.audioProcessor) {
      this.addAudioProcessorCallback(this.audioProcessor);
    }

    this.saveMessageCallback = (message) => {
      this.setShowPauseDelay(300);
      app.setStatusMessage(message);
    };

    this.loadMessageCallback = (message) => {
      app.setStatusMessage(message);
    };
  }

  SS_NATIVE = "native";
  SS_16_9 = "16:9";
  SS_FILL = "fill";

  isBilinearFilterEnabled() {
    return settings.isBilinearFilterEnabled() || this.prefs.isBilinearEnabled();
  }

  updateBilinearFilter() {
    const enabled = this.isBilinearFilterEnabled();
    this.canvas.style.setProperty("image-rendering", (enabled ? 'auto' :  'pixelated'), "important");
  }

  getScreenSize() {
    return settings.getScreenSize();
  }

  isScreenRotated() {
    return false;
  }

  updateScreenSize() {
    let fill = false;
    let ar = this.getDefaultAspectRatio();
    const ss = this.getScreenSize();
    if (ss === this.SS_16_9) {
      ar = 16/9;
    }
    if (ss === this.SS_FILL) {
      ar = 1;
      fill = true;
    }

    const canvas = this.canvas;
    const rotated = this.isScreenRotated();

    if (ar !== 0) {
      // Determine the zoom level
      let zoomLevel = 0;
      if (this.getProps().zoomLevel) {
        zoomLevel = this.getProps().zoomLevel;
      }

      const size = 96 + zoomLevel;

      if (rotated) {
        canvas.style.setProperty('width', `${size}vh`, 'important');
        canvas.style.setProperty('height', `${size}vw`, 'important');
      } else {
        canvas.style.setProperty('width', `${size}vw`, 'important');
        canvas.style.setProperty('height', `${size}vh`, 'important');
      }

      // Fill
      if (fill) {
        if (rotated) {
          canvas.style.setProperty('max-width', `${size}vh`, 'important');
          canvas.style.setProperty('max-height', `${size}vw`, 'important');
        } else {
          canvas.style.setProperty('max-width', `${size}vw`, 'important');
          canvas.style.setProperty('max-height', `${size}vh`, 'important');
        }
      } else {
        if (rotated) {
          canvas.style.setProperty('max-width', `calc(${size}vw*${ar})`, 'important');
          canvas.style.setProperty('max-height', `calc(${size}vh*${1/ar})`, 'important');
        } else {
          canvas.style.setProperty('max-width', `calc(${size}vh*${ar})`, 'important');
          canvas.style.setProperty('max-height', `calc(${size}vw*${1/ar})`, 'important');
        }
      }
    }
  }

  createPrefs() {
    return new AppPrefs(this);
  }

  getPrefs() {
    return this.prefs;
  }

  getDefaultAspectRatio() {
    return 0;
  }

  setShowMessageEnabled(b) {
    this.showMessageEnabled = b;
    const message = this.message;
    this.message = null;
    if (message) {
      setTimeout(() => {
        showMessage(message);
      }, 0);
    }
  }

  showErrorMessage(error) {
    if (this.showMessageEnabled) {
      showMessage(error);
    } else {
      this.message = error;
    }
  }

  getShowMessageCallback() {
    return (error) => {
      this.showErrorMessage(error);
    };
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

  getSaveManager() {
    return this.saveManager;
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

  setShowPauseDelay(delay) {
    this.showPauseDelay = delay;
  }

  async onShowPauseMenu() {}

  async onStart(canvas) {}

  showPauseMenu() {
    const { app, controllers } = this;

    if (controllers) {
      controllers.setEnabled(false);
    }

    this.onShowPauseMenu()
      .then(() => {
        setTimeout(() => {
          this.showPauseDelay = 0;
          app.pause(() => {
            if (controllers) {
              controllers.setEnabled(true);
            }
            this.pause(false, true);
          })
        }, this.showPauseDelay);
      })
      .catch(e => LOG.error(e));
  }

  pause(p, isMenu) {
    const { audioProcessor, displayLoop } = this;

    if ((p && !this.paused) || (!p && this.paused)) {
      this.paused = p;
      if (displayLoop) displayLoop.pause(p);
      if (audioProcessor) audioProcessor.pause(p);
      this.onPause(p, isMenu === true);
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

    // Load preferences
    await this.prefs.load();

    // Force the bilinear filter
    this.updateBilinearFilter();

    // Update the screen size
    this.updateScreenSize();

    await this.onStart(canvas);

    setTimeout(() => {
      this.touchListener = this.createTouchListener();
    }, 100);
  }
}
