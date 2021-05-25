export class TouchEndListener {
  constructor(cb) {
    this.enabled = true;
    window.document.addEventListener('touchend',
      (e) => { if (this.enabled) cb(e); }
    );
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }
}
