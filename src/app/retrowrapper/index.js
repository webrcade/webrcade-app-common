import { registerAudioResume } from '../../audio/scriptprocessor';
import { AppWrapper } from '../wrapper';
import { Controller } from '../../input';
import { Controllers } from '../../input';
import { DefaultKeyCodeToControlMapping } from '../../input';
import { DisplayLoop } from '../../display/loop'
import { Resources } from '../../resources';
import { CIDS } from '../../input';
import { getScreenShot } from '../../display';
import { TEXT_IDS } from '../../resources';
import { FileManifest } from '../filemanifest';
import * as LOG from '../../log'

const STATE_FILE_PATH = "/home/web_user/retroarch/userdata/states/game.state";

export class RetroAppWrapper extends AppWrapper {
  INP_LEFT = 1;
  INP_RIGHT = 1 << 1;
  INP_UP = 1 << 2;
  INP_DOWN = 1 << 3;
  INP_START = 1 << 4;
  INP_SELECT = 1 << 5;
  INP_A = 1 << 6;
  INP_B = 1 << 7;
  INP_X = 1 << 8;
  INP_Y = 1 << 9;
  INP_LBUMP = 1 << 10;
  INP_LTRIG = 1 << 11;
  INP_LTHUMB = 1 << 12;
  INP_RBUMP = 1 << 13;
  INP_RTRIG = 1 << 14;
  INP_RTHUMB = 1 << 15;
  CONTROLLER_COUNT = 4;

  OPT1 = 1;
  OPT2 = 1 << 1;
  OPT3 = 1 << 2;
  OPT4 = 1 << 3;
  OPT5 = 1 << 4;
  OPT6 = 1 << 5;
  OPT7 = 1 << 6;
  OPT8 = 1 << 7;
  OPT9 = 1 << 8;
  OPT10 = 1 << 9;
  OPT11 = 1 << 10;
  OPT12 = 1 << 11;
  OPT13 = 1 << 12;
  OPT14 = 1 << 13;
  OPT15 = 1 << 14;
  OPT16 = 1 << 15;

  MOUSE_LEFT = 1;
  MOUSE_MIDDLE = 1 << 1;
  MOUSE_RIGHT = 1 << 2;
  MOUSE_WHEEL_UP = 1 << 3;
  MOUSE_WHEEL_DOWN = 1 << 4;
  MOUSE_HORIZ_WHEEL_UP = 1 << 5;
  MOUSE_HORIZ_WHEEL_DOWN = 1 << 6;

  constructor(app, debug = false) {
    super(app, debug);

    window.emulator = this;
    window.readyAudioContext = null;

    this.romBytes = null;
    this.biosBuffers = null;
    this.escapeCount = -1;
    this.audioPlaying = false;
    this.saveStatePrefix = null;
    this.saveStatePath = null;
    this.exiting = false;
    this.mainStarted = false;
  }

  RA_DIR = '/home/web_user/retroarch/';
  RA_SYSTEM_DIR = this.RA_DIR + 'system/';

  setExiting(exiting) {
    this.exiting = true;
  }

  getScriptUrl() {
    throw "getScriptUrl() has not been implemented";
  }

  isDiscBased() {
    return this.app.isDiscBased();
  }

  isArchiveBased() {
    return this.app.isArchiveBased();
  }

  getCustomStartHandler() {
    return null;
  }

  getExitOnLoopError() {
    return false;
  }

  setRoms(uid, frontendArray, biosBuffers, romBytes, ext) {
    this.uid = uid;
    this.frontendArray = frontendArray;
    this.biosBuffers = biosBuffers;
    this.romBytes = romBytes;
    this.ext = ext;
    this.archiveUrl = null;
    this.game = this.isDiscBased() ?
      (this.RA_DIR + 'game.' + (ext != null && ext === 'pbp' ? 'pbp' : 'chd')) :
      (this.RA_DIR + "game.bin");
  }

  setArchiveUrl(url) {
    this.archiveUrl = url;
  }

  createControllers() {
    return new Controllers([
      new Controller(new DefaultKeyCodeToControlMapping()),
      new Controller(),
      new Controller(),
      new Controller(),
    ]);
  }

  createAudioProcessor() {
    return null;
  }

  async onShowPauseMenu() {
    await this.saveState();
  }

  getControllerIndex(index) {
    return index;
  }

  onArchiveFile(isDir, name, stats) {}

  onArchiveFilesFinished() {}

  getArchiveBinaryFileName() {
    return "";
  }

  isEscapeHackEnabled() {
    return true;
  }

  pollControls() {
    const { analogMode, CONTROLLER_COUNT, controllers } = this;

    controllers.poll();

    const isAnalog = analogMode;

    if (
      controllers.isControlDown(0, CIDS.RTRIG) ||
      controllers.isControlDown(0, CIDS.LTRIG) ||
      controllers.isControlDown(0, CIDS.LANALOG) ||
      controllers.isControlDown(0, CIDS.RANALOG)
    ) {
      this.escapeCount = this.escapeCount === -1 ? 0 : this.escapeCount + 1;
    } else {
      this.escapeCount = -1;
    }

    for (let i = 0; i < CONTROLLER_COUNT; i++) {
      let input = 0;

      const escapeOk = !this.isEscapeHackEnabled() || (this.escapeCount === -1 || this.escapeCount < 60);

      // Hack to reduce likelihood of accidentally bringing up menu
      if (
        controllers.isControlDown(0 /*i*/, CIDS.ESCAPE) && escapeOk
      ) {
        if (this.pause(true)) {
          controllers
            .waitUntilControlReleased(0 /*i*/, CIDS.ESCAPE)
            .then(() => this.showPauseMenu());
          return;
        }
      }

      if (controllers.isControlDown(i, CIDS.UP, !isAnalog)) {
        input |= this.INP_UP;
      } else if (controllers.isControlDown(i, CIDS.DOWN, !isAnalog)) {
        input |= this.INP_DOWN;
      }
      if (controllers.isControlDown(i, CIDS.RIGHT, !isAnalog)) {
        input |= this.INP_RIGHT;
      } else if (controllers.isControlDown(i, CIDS.LEFT, !isAnalog)) {
        input |= this.INP_LEFT;
      }
      if (controllers.isControlDown(i, CIDS.START) && escapeOk) {
        input |= this.INP_START;
      }
      if (controllers.isControlDown(i, CIDS.SELECT) && escapeOk) {
        input |= this.INP_SELECT;
      }
      if (controllers.isControlDown(i, CIDS.A)) {
        input |= this.INP_A;
      }
      if (controllers.isControlDown(i, CIDS.B)) {
        input |= this.INP_B;
      }
      if (controllers.isControlDown(i, CIDS.X)) {
        input |= this.INP_X;
      }
      if (controllers.isControlDown(i, CIDS.Y)) {
        input |= this.INP_Y;
      }
      if (controllers.isControlDown(i, CIDS.LBUMP)) {
        input |= this.INP_LBUMP;
      }
      if (controllers.isControlDown(i, CIDS.RBUMP)) {
        input |= this.INP_RBUMP;
      }
      if (controllers.isControlDown(i, CIDS.LTRIG)) {
        input |= this.INP_LTRIG;
      }
      if (controllers.isControlDown(i, CIDS.RTRIG)) {
        input |= this.INP_RTRIG;
      }
      if (controllers.isControlDown(i, CIDS.LANALOG)) {
        input |= this.INP_LTHUMB;
      }
      if (controllers.isControlDown(i, CIDS.RANALOG)) {
        input |= this.INP_RTHUMB;
      }

      const analog0x = controllers.getAxisValue(i, 0, true);
      const analog0y = controllers.getAxisValue(i, 0, false);
      const analog1x = controllers.getAxisValue(i, 1, true);
      const analog1y = controllers.getAxisValue(i, 1, false);

      let controller = this.getControllerIndex(i);
      window.Module._wrc_set_input(
        controller,
        input,
        analog0x,
        analog0y,
        analog1x,
        analog1y,
      );
    }
  }

  loadEmscriptenModule(canvas) {
    const { app, frontendArray, RA_DIR } = this;

    const scriptUrl = this.getScriptUrl();

    return new Promise((resolve, reject) => {
      window.Module = {
        canvas: canvas,
        noInitialRun: true,
        onAbort: (msg) => app.exit(msg),
        onExit: () => app.exit(),
        onRuntimeInitialized: () => {
          const f = () => {
            // Enable show message
            this.setShowMessageEnabled(true);
            if (window.readyAudioContext) {
              if (window.readyAudioContext.state !== 'running') {
                app.setShowOverlay(true);
                registerAudioResume(
                  window.readyAudioContext,
                  (running) => {
                    if (running) {
                      window.Module._rwebaudio_enable();
                      window.Module._cmd_audio_reinit();
                      this.audioPlaying = true;
                    }
                    setTimeout(() => app.setShowOverlay(!running), 50);
                  },
                  500,
                );
              } else {
                window.Module._rwebaudio_enable();
                window.Module._cmd_audio_reinit();
                this.audioPlaying = true;
              }
            } else {
              setTimeout(f, 1000);
            }
          };
          setTimeout(f, 1000);
          resolve();
        },
        preInit: function () {
          const FS = window.FS;
          FS.mkdir('/home/web_user/retroarch');
          FS.mkdir('/home/web_user/retroarch/system');
          FS.mkdir('/home/web_user/retroarch/userdata');
          FS.mkdir('/home/web_user/retroarch/userdata/system');
          FS.mkdir('/home/web_user/retroarch/userdata/system/neocd');
          FS.mkdir('/home/web_user/retroarch/userdata/saves');
          FS.mkdir('/home/web_user/retroarch/userdata/saves/opera');
          FS.mkdir('/home/web_user/retroarch/userdata/saves/opera/per_game');
          FS.mkdir('/home/web_user/retroarch/userdata/states');
        },
      };

      const script = document.createElement('script');
      document.body.appendChild(script);
      script.src = scriptUrl;
    });
  }

  async getStateSlots(showStatus = true) {
    return await this.getSaveManager().getStateSlots(
      this.saveStatePrefix, showStatus ? this.saveMessageCallback : null
    );
  }

  getShotAspectRatio() { return null; }
  getShotRotation() { return null; }

  async saveStateForSlot(slot) {
    const { Module } = window;

    const shot = await getScreenShot(this.canvas,
      () => {
        Module._cmd_audio_stop();
        Module._emscripten_mainloop();
        Module._cmd_audio_start();
      }, 10)

    Module._cmd_save_state();

    let s = null;
    try {
      const FS = window.FS;
      try {
        s = FS.readFile(STATE_FILE_PATH);
      } catch (e) { }

      if (s) {

        const props = {}

        const ar = this.getShotAspectRatio();
        if (ar) {
          props.aspectRatio = `${ar}`;
        }
        const rot = this.getShotRotation();
        if (rot) {
          props.transform = `rotate(${rot}deg)`;
        }

        await this.getSaveManager().saveState(
          this.saveStatePrefix, slot, s,
          shot ? null : this.canvas,
          this.saveMessageCallback,
          shot,
          props);
      }
    } catch (e) {
      LOG.error('Error saving state: ' + e);
    }

    return true;
  }

  async loadStateForSlot(slot) {
    const { Module } = window;

    try {
      const state = await this.getSaveManager().loadState(
        this.saveStatePrefix, slot, this.saveMessageCallback);

      if (state) {
        const FS = window.FS;
        FS.writeFile(STATE_FILE_PATH, state);
        Module._cmd_load_state();
      }
    } catch (e) {
      LOG.error('Error loading state: ' + e);
    }
    return true;
  }

  async deleteStateForSlot(slot, showStatus = true) {
    try {
      await this.getSaveManager().deleteState(
        this.saveStatePrefix, slot, showStatus ? this.saveMessageCallback : null);
    } catch (e) {
      LOG.error('Error deleting state: ' + e);
    }
    return true;
  }

  onPause(p) {
    if (!p) {
      if (window.readyAudioContext) {
        window.readyAudioContext.resume();
        console.log(window.readyAudioContext);
        window.Module._rwebaudio_enable();
        window.Module._cmd_audio_reinit();
      }
    }
  }

  applyGameSettings() {
  }

  updateBilinearFilter() {
    if (!this.mainStarted) return;
    const enabled = this.isBilinearFilterEnabled();
    window.Module._wrc_enable_bilinear_filter(enabled ? 1 : 0);
  }

  isForceAspectRatio() {
    return this.getScreenSize() === this.SS_NATIVE;
  }

  updateScreenSize() {
    if (!this.mainStarted) return;

    try {
      const enabled = this.isForceAspectRatio();
      window.Module._wrc_force_aspect_ratio(enabled ? 1 : 0);
    } catch (e) {
      LOG.info("Unable to invoke _wrc_force_aspect_ratio.");
    }

    super.updateScreenSize();
  }

  resizeScreen(canvas) {
    throw "resizeScreen() has not been implemented."
  }

  createDisplayLoop(debug) {
    const loop = new DisplayLoop(
      60, // frame rate (ignored due to no wait)
      true, // vsync
      debug, // debug
      true, // force native
      false, // no wait
    );
    loop.setAdjustTimestampEnabled(false);
    return loop;
  }

  onFrame() {}

  async onStart(canvas) {
    const { app, debug, game } = this;
    const { FS, Module } = window;

    try {
      this.canvas = canvas;

      if (this.isDiscBased()) {
        setTimeout(() => {
          app.setState({ loadingMessage: null, loadingPercent: null });
          setTimeout(() => {
            app.setState({ loadingMessage: 'Starting' });
          }, 2000);
        }, 2000);
      } else {
        app.setState({ loadingMessage: null, loadingPercent: null });
      }

      if (this.romBytes.byteLength === 0) {
        throw new Error('The size is invalid (0 bytes).');
      }

      // // Load preferences
      // await this.prefs.load();

      // Apply the game settings
      this.applyGameSettings();

      // Copy BIOS files
      for (let bios in this.biosBuffers) {
        const bytes = this.biosBuffers[bios];
        const path = '/home/web_user/retroarch/userdata/system/' + bios;
        FS.writeFile(path, bytes);
      }

      // Prepare game content
      if (this.isArchiveBased()) {

        try {
          if (this.romBytes.length > 10 * 1024 * 1024) {
            app.setState({ loadingMessage: 'Preparing files' });
            await this.wait(10);
          }

          // Extract the archive
          await this.extractArchive(
            window.FS, "/content", this.romBytes, this.DEFAULT_MAX_EXTRACT_SIZE, this
          );

          app.setState({ loadingMessage: null });
          await this.wait(10);
        } catch (e) {
          LOG.info("Not a zip file, checking for a manifest.");
          FS.mkdir("/content");
          const manifest = new FileManifest(this, FS, "/content", this.romBytes, this.archiveUrl, this);
          const totalSize = await manifest.process();
          if (!totalSize) throw e;
        }
      } else {
        // Write rom file
        let stream = FS.open(game, 'a');
        FS.write(stream, this.romBytes, 0, this.romBytes.length, 0, true);
        FS.close(stream);
      }
      this.romBytes = null;

      if (this.isDiscBased()) {
        await this.wait(2000);
      }

      // Load the save state
      this.saveStatePrefix = app.getStoragePath(`${this.uid}/`);
      this.saveStatePath = `${this.saveStatePrefix}${this.SAVE_NAME}`;
      await this.loadState();

      if (this.isDiscBased()) {
        await this.wait(10000);
      }

      const customStart = this.getCustomStartHandler();
      if (customStart) {
        await customStart(this);
      } else {
        window.readyAudioContext = new window.AudioContext();
        window.readyAudioContext.resume();
        console.log(window.readyAudioContext);

        try {
          const name = this.isArchiveBased() ? this.getArchiveBinaryFileName() : game;
          Module.callMain(['-v', name]);
        } catch (e) {
          LOG.error(e);
        }

        // Mark that main has been started
        this.mainStarted = true;

        // Bilinear filter
        if (this.isBilinearFilterEnabled()) {
          // TODO: Figure out a way to do this without re-init of video
          await this.wait(1000);
          Module._wrc_enable_bilinear_filter(1);
        }

        if (this.isDiscBased()) {
          setTimeout(() => {
            app.setState({ loadingMessage: null });
          }, 50);
        }

        this.displayLoop = this.createDisplayLoop(debug);

        setTimeout(() => {
          this.resizeScreen(canvas);
          Module.setCanvasSize(canvas.offsetWidth, canvas.offsetHeight);
          setTimeout(() => {
            this.resizeScreen(canvas);
          }, 1);
        }, 50);

        window.onresize = () => {
          Module.setCanvasSize(canvas.offsetWidth, canvas.offsetHeight);
          setTimeout(() => {
            this.resizeScreen(canvas);
          }, 1);
        };

        let exit = false;
        let s = false;

        // Start the display loop
        this.displayLoop.start(() => {
          try {
            if (!exit) {
              this.pollControls();
              Module._emscripten_mainloop();
              this.onFrame();
            }
          } catch (e) {
            if (e.status === 1971) {
              // Menu was displayed, should never happen (bad rom?
              if (!this.exiting) {
                app.exit(Resources.getText(TEXT_IDS.ERROR_UNKNOWN));
              } else {
                app.exit();
              }
              exit = true;
            } else {
              if (this.getExitOnLoopError()) {
                app.exit(Resources.getText(TEXT_IDS.ERROR_UNKNOWN));
                exit = true;
              }
              LOG.error(e);
            }
          }

          if (!s) {
            s = true;
            app.setState({loadingMessage: null, loadingPercent: null});
          }
        });
      }
    } catch (e) {
      window.readyAudioContext = null;
      app.setState({loadingMessage: null, loadingPercent: null});
      LOG.error(e);
      app.exit(e);
    }
  }
}
