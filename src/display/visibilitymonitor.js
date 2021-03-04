export class VisibilityChangeMonitor {
  constructor(cb) {
    this.cb = cb;
    this.hidden = null;
    this.visibilityChange = null;

    const handleVisibilityChange = () => {
      this.cb(document[this.hidden]);
    }
    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
      this.hidden = "hidden";
      this.visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
      this.hidden = "msHidden";
      this.visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      this.hidden = "webkitHidden";
      this.visibilityChange = "webkitvisibilitychange";
    }
    document.addEventListener(this.visibilityChange, handleVisibilityChange, false);
  }
}
