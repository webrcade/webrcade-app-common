import { Component } from "react";
import { FocusGrid, GamepadEnum, GamepadNotifier, KCODES } from "../../../input"

import styles from './style.scss'

export class Screen extends Component {
  constructor() {
    super();

    this.defaultGamepadCallback = e => {
      this.focus();
      return true;
    }

    this.focusGrid.setUnhandledGamepadInputCallback((input) => {
      this.onUnhandledGamepadInput(input);
    });
  }

  onUnhandledGamepadInput(input) {
  }

  focusGrid = new FocusGrid();
  gamepadNotifier = new GamepadNotifier();
  screenContext = {
    gamepadNotifier: this.gamepadNotifier,
    focusGrid: this.focusGrid
  };
  screenStyles = styles;

  focus() {
    const { focusGrid } = this;

    focusGrid.focus();
  }

  close() {
    const { closeCallback } = this.props;

    if (closeCallback) closeCallback();
  }

  globalGamepadCallback = e => {
    if (e.type === GamepadEnum.ESC) {
      this.close();
    }
  }

  handleKeyUpEvent = (e) => {
    if (e.code === KCODES.ESCAPE) {
      this.close();
    }
  }

  componentDidMount() {
    const { gamepadNotifier } = this;

    gamepadNotifier.start();
    gamepadNotifier.setDefaultCallback(this.defaultGamepadCallback);
    gamepadNotifier.addGlobalCallback(this.globalGamepadCallback);

    const docElement = document.documentElement;
    docElement.addEventListener("keyup", this.handleKeyUpEvent);

    setTimeout(() => { this.focus() }, 50);
  }

  componentWillUnmount() {
    const { gamepadNotifier } = this;

    gamepadNotifier.stop();
    gamepadNotifier.setDefaultCallback(null);
    gamepadNotifier.removeGlobalCallback(this.globalGamepadCallback);

    const docElement = document.documentElement;
    docElement.removeEventListener("keyup", this.handleKeyUpEvent);
  }
}
