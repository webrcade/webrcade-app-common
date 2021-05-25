import React, { Component } from "react";

import { WebrcadeContext } from '../../context/webrcadecontext.js'
import { GamepadEnum } from "../../../input"

import styles from './style.scss'

export class ImageButton extends Component {
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

  focus() {
    const { focused } = this.state;
    const { button } = this;
    if (!focused && button) {
      button.focus();
      return true;
    }
    return false;
  }

  render() {
    const { label, imgSrc, hoverImgSrc, className } = this.props;
    const { focused } = this.state;

    return (
      <button
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
