import React, { Component } from "react";

import { GamepadEnum } from "../../../input"
import { WebrcadeContext } from '../../context/webrcadecontext.js'

import styles from './style.scss'

export class ImageButton extends Component {
  constructor() {
    super();

    this.state = {
      focused: false
    };
  }

  gamepadCallback = (e) => {
    const { disabled, onPad } = this.props;
    const { focused } = this.state;

    if (!focused) return false;

    if (disabled) {
      this.setState({ focused: false });
      return false;
    }

    switch (e.type) {
      case GamepadEnum.A:
        this.onClick();
        break;
      case GamepadEnum.DOWN:
      case GamepadEnum.UP:
      case GamepadEnum.LEFT:
      case GamepadEnum.RIGHT:
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

  componentDidUpdate(prevProps, prevState) {
    const { disabled } = this.props;
    const { focused } = this.state;

    if (disabled && focused) {
      this.setState({ focused: false });
    }
  }

  onClick = e => {
    const { onClick } = this.props;
    if (onClick) onClick();
  }

  onFocus = () => {
    this.setState({ focused: true });
  }

  onBlur = () => {
    this.setState({ focused: false });
  }

  isFocusable() {
    const { button } = this;
    const { disabled } = this.props;
    if (disabled) {
      return false;
    }

    return (button.offsetWidth > 0 && button.offsetHeight);
  }

  focus() {
    const { disabled } = this.props;
    const { focused } = this.state;
    const { button } = this;
    const disabledBtn = disabled ? true : false;

    if (!focused && !disabledBtn && button) {
      button.focus();
      return true;
    }
    return false;
  }

  render() {
    const { className, disabled, hoverImgSrc, imgSrc, label } = this.props;
    const { focused } = this.state;

    const disabledBtn = disabled ? true : false;

    return (
      <button
        disabled={disabledBtn}
        className={className === undefined ? styles['image-button'] : className}
        ref={(button) => { this.button = button; }}
        onClick={this.onClick}
        onFocus={this.onFocus}
        onBlur={this.onBlur}> {imgSrc ?
          <img alt={label} src={focused && hoverImgSrc ? hoverImgSrc : imgSrc}></img> : null}
        <div>{label}</div>
      </button>
    );
  }
};

ImageButton.contextType = WebrcadeContext;
