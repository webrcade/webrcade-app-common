import React, { Component } from "react";

import { GamepadEnum } from "../../../input"
import { WebrcadeContext } from '../../context/webrcadecontext.js'

import styles from './style.scss'

export class Switch extends Component {
  constructor() {
    super();

    this.state = {
      focused: false
    };
  }

  gamepadCallback = (e) => {
    const { onPad } = this.props;
    const { focused } = this.state;

    if (!focused) return false;

    switch (e.type) {
      case GamepadEnum.A:
        this.field.click();
        break;
      case GamepadEnum.DOWN:
      case GamepadEnum.UP:
      case GamepadEnum.LEFT:
      case GamepadEnum.RIGHT:
      case GamepadEnum.LBUMP:
      case GamepadEnum.RBUMP:
        if (onPad) onPad(e);
        break;
      default:
        break;
    }
    return true;
  }

  componentDidMount() {
    const { gamepadNotifier } = this.context;

    if (gamepadNotifier) {
      gamepadNotifier.addCallback(this.gamepadCallback);
    }
  }

  componentWillUnmount() {
    const { gamepadNotifier } = this.context;

    if (gamepadNotifier) {
      gamepadNotifier.removeCallback(this.gamepadCallback);
    }
  }

  onFocus = () => {
    this.setState({ focused: true });
  }

  onBlur = () => {
    this.setState({ focused: false });
  }

  focus() {
    const { focused } = this.state;
    const { field } = this;

    if (!focused && field) {
      field.focus();
      return true;
    }
    return false;
  }

  render() {
    const { checked, onChange } = this.props;

    return (
      <label className={styles['dialog-switch']}>
        <input type="checkbox"
          ref={(field) => { this.field = field; }}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          onChange={onChange}
          checked={checked}
        />
        <span className={styles["dialog-switch-slider"]}>
        </span>
      </label>
    );
  }
};

Switch.contextType = WebrcadeContext;
