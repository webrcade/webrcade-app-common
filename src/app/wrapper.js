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
import { SCREEN_SIZES } from '../settings'

export class AppWrapper {
  constructor(app, debug = false) {
    this.SS_NATIVE = SCREEN_SIZES.SS_NATIVE;
    this.SS_DEFAULT = SCREEN_SIZES.SS_DEFAULT;
    this.SS_16_9 = SCREEN_SIZES.SS_16_9;
    this.SS_FILL = SCREEN_SIZES.SS_FILL;

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

  isBilinearFilterEnabled() {
    return settings.isBilinearFilterEnabled() || this.prefs.isBilinearEnabled();
  }

  updateBilinearFilter() {
    const enabled = this.isBilinearFilterEnabled();
    this.canvas.style.setProperty("image-rendering", (enabled ? 'auto' :  'pixelated'), "important");
  }

  getScreenSize() {
    const size = this.prefs.getScreenSize();
    return size === SCREEN_SIZES.SS_DEFAULT ? settings.getScreenSize() : size;
  }

  isScreenRotated() {
    return false;
  }

  isScreenFill() {
    return false;
  }

  updateOnScreenControls(initial = false) {}

  updateScreenSize() {
    let fill = this.isScreenFill();
    let ar = this.getDefaultAspectRatio();
    const ss = this.getScreenSize();
    const canvas = this.canvas;
    let rotated = this.isScreenRotated();

    if (ss === SCREEN_SIZES.SS_16_9) {
      ar = 16 / 9;
      if (rotated) {
        ar = 1 / ar;
      }
    }
    if (ss === SCREEN_SIZES.SS_FILL) {
      ar = 1;
      fill = true;
    }

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

  showMessage(message) {
    if (this.showMessageEnabled) {
      showMessage(message, false, false);
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

    // Update on screen controls
    this.updateOnScreenControls(true);

    await this.onStart(canvas);

    setTimeout(() => {
      this.touchListener = this.createTouchListener();
    }, 100);
  }

  // Allows extract path to be modified
  getExtractPath(path) {
    return path;
  }

  createDirectories(FS, path) {
    const parts = path.split('/');
    for (let i = 1; i <= parts.length; i++) {
      const dirPath = parts.slice(0, i).join('/');
      try {
        FS.mkdir(dirPath);
      } catch (e) {
        //LOG.info("## Error making directory, it may already exist: " + dirPath);
      }
    }
  }

  DEFAULT_MAX_EXTRACT_SIZE = (2 * 1024 * 1024 * 1024);
  //
  // callback:
  //
  // {
  //    onArchiveFile(isDir, path);
  //    onArchiveFilesFinished();
  // }
  //
  async extractArchive(FS, contentDir, bytes, maxExtractSize, callback) {
    const BrowserFS = window.BrowserFS;
    const myZipFs = new BrowserFS.FileSystem.ZipFS(new Buffer(bytes));

    try {
      FS.mkdir(contentDir);
    } catch (e) {
      LOG.info("## Error making directory, it may already exist: " + contentDir);
    }

    // Determine extracted size of files
    let size = 0;
    const recurse = (path, files, cb) => {
      for (let i = 0; i < files.length; i++) {
        const f = path + files[i];
        const stats = myZipFs.statSync(f, true);
        const isDir = stats.isDirectory();
        if (isDir) {
          cb(true, f, stats);
          recurse(f + "/", myZipFs.readdirSync(f), cb);
        } else {
          cb(false, f, stats)
        }
      }
    }
    recurse("/", myZipFs.readdirSync("/"), (isDir, f, stats) => {
      if (callback) callback.onArchiveFile(isDir, contentDir + f);
      if (!isDir) {
        size += stats.size;
      }
    });
    if (callback) callback.onArchiveFilesFinished();

    // If less than threshold, extract and write files.
    // Otherwise use the ZipFS directly (much slower, but uses less memory)
    if (size < maxExtractSize) {
      console.log("EXTRACTING FILES.")
      recurse("/", myZipFs.readdirSync("/"), (isDir, f, stats) => {
        const path = contentDir + this.getExtractPath(f);
        if (isDir) {
          try {
            FS.mkdir(path);
          } catch (e) {
            LOG.info("## Error making directory, it may already exist: " + path);
          }
        } else {
          let data = myZipFs.readFileSync(f, null, FileFlag.getFileFlag("r"));
          let stream = FS.open(path, 'a');
          console.log("write: " + path);
          FS.write(stream, data, 0, data.length, 0, true);
          FS.close(stream);
          data = null;
        }
      });
    } else {
      console.log("USING ZIP.")
      const MFS = new BrowserFS.FileSystem.MountableFileSystem();
      MFS.mount(contentDir, myZipFs);
      BrowserFS.initialize(MFS);
      const BFS = new BrowserFS.EmscriptenFS();
      FS.mount(BFS, {root: `${contentDir}/`}, `${contentDir}/`);
    }
  }

  wait(time) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }
}
