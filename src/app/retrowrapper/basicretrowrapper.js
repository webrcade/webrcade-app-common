import { RetroAppWrapper } from './index';
import { SCREEN_CONTROLS } from '../prefs';

// The RetroAppWrapper counterpart to ../basicwrapper's BasicAppWrapper --
// same shared touch/mouse/keyboard interaction-detection + on-screen touch
// overlay support, hand-copied into retro-a5200, retro-virtual-jaguar,
// retro-commodore-8bit, retro-dosbox-pure, retro-mame-apple2,
// retro-mame-apple2gs, and retro-melonds before this existed. Centralized
// here instead so a new RetroAppWrapper-based app just extends this class
// (rather than re-copying the same block again) -- the apps that already
// hand-copied it are left as-is, not retrofitted.
//
// Unlike BasicAppWrapper (which has to live outside AppWrapper specifically
// because RetroAppWrapper's own onFrame() would otherwise permanently
// shadow anything added there), RetroAppWrapper.onFrame() is already an
// empty stub called once per frame by its own main loop -- so a subclass
// can just override onFrame() for its own per-frame needs (audio start-up,
// etc.) and call super.onFrame() from it, same as any normal override.
export class BasicRetroAppWrapper extends RetroAppWrapper {

  // Drives the upper-right touch overlay (Pause icon, plus Keypad/Keyboard
  // for apps that have one) -- latch the first time each interaction type
  // is observed, and react via checkOnScreenControls(). See onFrame() for
  // where the listeners actually get attached.
  firstFrame = true;
  touchEvent = false;
  mouseEvent = false;
  keyboardEvent = false;

  // Attaches the touch/mouse/keyboard interaction listeners once, on the
  // real first frame, and flips on the touch overlay's gating state
  // (App.js's showCanvas()) so it can't render before the emulator
  // actually exists. A subclass with its own per-frame work should
  // override onFrame() and call super.onFrame() from it.
  onFrame() {
    if (!this.firstFrame) return;
    this.firstFrame = false;

    this.app.showCanvas();

    setTimeout(() => {
      const onTouch = () => { this.onTouchEvent() };
      window.addEventListener("touchstart", onTouch);
      window.addEventListener("touchend", onTouch);
      window.addEventListener("touchcancel", onTouch);
      window.addEventListener("touchmove", onTouch);

      const onMouse = () => { this.onMouseEvent() };
      window.addEventListener("mousedown", onMouse);
      window.addEventListener("mouseup", onMouse);
      window.addEventListener("mousemove", onMouse);

      document.onkeydown = (e) => {
        if (this.paused) return;
        this.onKeyboardEvent(e);
      };
    }, 0);
  }

  onTouchEvent() {
    if (!this.touchEvent) {
      this.touchEvent = true;
      this.checkOnScreenControls();
    }
  }

  onMouseEvent() {
    if (!this.mouseEvent) {
      this.mouseEvent = true;
      this.checkOnScreenControls();
    }
  }

  onKeyboardEvent(e) {
    if (e.code && !this.keyboardEvent) {
      this.keyboardEvent = true;
      this.checkOnScreenControls();
    }
  }

  showTouchOverlay(show) {
    const to = document.getElementById("touch-overlay");
    if (to) {
      to.style.display = show ? 'block' : 'none';
    }
  }

  // Reacts immediately to a just-detected interaction (see
  // onTouchEvent()/onMouseEvent()/onKeyboardEvent() above) -- only SC_AUTO
  // needs to do anything here, since SC_ON/SC_OFF are already handled
  // unconditionally by updateOnScreenControls() at startup and whenever
  // the Settings preference itself changes.
  checkOnScreenControls() {
    const controls = this.prefs.getScreenControls();
    if (controls === SCREEN_CONTROLS.SC_AUTO) {
      setTimeout(() => {
        this.showTouchOverlay(true);
        this.app.forceRefresh();
      }, 0);
    }
  }

  // Broader lifecycle hook -- the local TouchOverlay component calls this
  // once at real startup with initial=true, and the Settings screen calls
  // it again whenever "On-screen controls" changes. Unlike
  // checkOnScreenControls(), this has to explicitly handle all three
  // preference values, and skips SC_AUTO entirely on the initial call so
  // the overlay doesn't flash before any real interaction has happened
  // yet.
  updateOnScreenControls(initial = false) {
    const controls = this.prefs.getScreenControls();
    if (controls === SCREEN_CONTROLS.SC_OFF) {
      this.showTouchOverlay(false);
    } else if (controls === SCREEN_CONTROLS.SC_ON) {
      this.showTouchOverlay(true);
    } else if (controls === SCREEN_CONTROLS.SC_AUTO) {
      if (!initial) {
        setTimeout(() => {
          this.showTouchOverlay(this.touchEvent || this.mouseEvent);
          this.app.forceRefresh();
        }, 0);
      }
    }
  }

  // Base class default pauses on any tap anywhere on screen -- redundant
  // (and disruptive) once a dedicated Pause button exists in the touch
  // overlay. Subclasses using this wrapper are expected to override this
  // to `{}` themselves (kept as the inherited default here, not forced, so
  // a subclass that hasn't added the overlay yet still gets the old
  // tap-to-pause behavior rather than silently losing touch-pause access).
}
