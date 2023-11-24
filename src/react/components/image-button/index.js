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
    const { disabled, onPad, onPadClick } = this.props;
    const { focused } = this.state;

    if (!focused) return false;

    if (disabled) {
      this.setState({ focused: false });
      return false;
    }

    switch (e.type) {
      case GamepadEnum.A:
        if (onPadClick) onPadClick(e);
        this.onClick(e);
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

  getButton() {
    return this.button;
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
    if (onClick) onClick(e);
  }

  onFocus = () => {
    this.setState({ focused: true });
    const { onFocus } = this.props;
    if (onFocus) onFocus();
  }

  onMouseEnter = () => {
    const { onMouseEnter } = this.props;
    if (onMouseEnter) onMouseEnter();
  }

  onMouseLeave = () => {
    const { onMouseLeave } = this.props;
    if (onMouseLeave) onMouseLeave();
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
    const { className, disabled, hoverImgSrc, imgSrc, label, labelClassName, onTouchStart, onTouchEnd, onMouseDown } = this.props;
    const { focused } = this.state;

    const disabledBtn = disabled ? true : false;

    return (
      <button
        disabled={disabledBtn}
        className={className === undefined ? styles['image-button'] : className}
        ref={(button) => { this.button = button; }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={this.onClick}
        onFocus={this.onFocus}
        onMouseDown={onMouseDown}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onBlur={this.onBlur}> {imgSrc ?
          <img alt={label} src={focused && hoverImgSrc ? hoverImgSrc : imgSrc}></img> : null}
        {labelClassName ? <div className={labelClassName}>{label}</div> : <div>{label}</div>}
      </button>
    );
  }
};

ImageButton.contextType = WebrcadeContext;
