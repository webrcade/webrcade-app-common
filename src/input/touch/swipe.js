export class Swipe {
  constructor(element) {
    this.xDown = null;
    this.yDown = null;
    this.onUp = null;
    this.onDown = null;
    this.onRight = null;
    this.onLeft = null;

    this.startListener = evt => {
      this.xDown = evt.touches[0].clientX;
      this.yDown = evt.touches[0].clientY;
    };
    this.stopListener = evt => {
      this.handleTouchMove(evt);
    };

    if (element) {
      this.register(element);
    }
  }

  PERCENT = .05;

  register(element) {
    this.element = element;
    this.element.addEventListener('touchstart', this.startListener);
    this.element.addEventListener('touchmove', this.stopListener);
  }

  unregister() {
    this.element.removeEventListener('touchstart', this.startListener);
    this.element.removeEventListener('touchmove', this.stopListener);
  }

  onLeft(callback) {
    this.onLeft = callback;
    return this;
  }

  onRight(callback) {
    this.onRight = callback;
    return this;
  }

  onUp(callback) {
    this.onUp = callback;
    return this;
  }

  onDown(callback) {
    this.onDown = callback;
    return this;
  }

  handleTouchMove(evt) {
    if (!this.xDown || !this.yDown) {
      return;
    }

    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;

    this.xDiff = this.xDown - xUp;
    this.yDiff = this.yDown - yUp;

    if (Math.abs(this.xDiff) > Math.abs(this.yDiff)) { // Most significant.
      if (Math.abs(this.xDiff) < (window.innerWidth*this.PERCENT)) return;
      if (this.xDiff > 0) {
        if (this.onLeft) this.onLeft(this.xDiff);
      } else {
        if (this.onRight) this.onRight(this.xDiff);
      }
    } else {
      if (Math.abs(this.yDiff) < (window.innerHeight*this.PERCENT)) return;
      if (this.yDiff > 0) {
        if (this.onUp) this.onUp(this.yDiff);
      } else {
        if (this.onDown) this.onDown(this.yDiff);
      }
    }

    // Reset values.
    this.xDown = null;
    this.yDown = null;
  }
}
