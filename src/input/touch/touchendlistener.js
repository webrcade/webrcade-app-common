export class TouchEndListener {
  constructor(cb) {
    window.document.addEventListener('touchend', e => cb(e));
  }
}
