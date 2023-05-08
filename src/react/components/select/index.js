import React, { Component } from "react";

import { GamepadEnum } from "../../../input"
import { WebrcadeContext } from '../../context/webrcadecontext.js'

import {
  ChevronLeftWhiteImage,
  ChevronRightWhiteImage,
} from '../../../images'

import styles from './style.scss'

class Arrow extends Component {
  render() {
    const { imgSrc, onClick, focused, disabled } = this.props;
    return (
      <div
        className={
            styles['select-group-button'] +
            (focused ? (" " + styles['select-group-button__focused']) : "") +
            (disabled ? (" " + styles['select-group-button__disabled']) : "")
          }
        onClick={() => { onClick(); }}>
        <img
          className={styles['select-group-button-img'] + " " + (disabled ? styles['select-group-button-img__disabled'] : "")}
          src={imgSrc}>
        </img>
      </div>
    );
  }
}

export class Select extends Component {
  constructor() {
    super();

    this.keyDown = false;

    this.state = {
      focused: false
    };
  }

  gamepadCallback = (e) => {
    const { onPad, value, options, onChange } = this.props;
    const { focused } = this.state;

    if (!focused) return false;

    switch (e.type) {
      case GamepadEnum.LEFT:
        this.onPrevious(value, options, onChange);
        break;
      case GamepadEnum.RIGHT:
        this.onNext(value, options, onChange);
        break;
      case GamepadEnum.A:
        if (!this.onNext(value, options, onChange)) {
          onChange(options[0].value);
        }
        break;
      case GamepadEnum.DOWN:
      case GamepadEnum.UP:
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

  keyDownListener = e => {
    this.keyDown = true;
  }

  keyUpListener = e => {
    const { onPad, value, options, onChange } = this.props;

    if (!this.keyDown) return;
    this.keyDown = false;

    switch (e.code) {
      case 'ArrowRight':
        this.onNext(value, options, onChange);
        break;
      case 'ArrowLeft':
        this.onPrevious(value, options, onChange);
        break;
      case 'Enter':
        if (!this.onNext(value, options, onChange)) {
          onChange(options[0].value);
        }
        break;
      default:
        break;
    }
  };

  onFocus = () => {
    this.keyDown = false;
    this.setState({ focused: true });
    document.addEventListener("keyup", this.keyUpListener);
    document.addEventListener("keydown", this.keyDownListener);

  }

  onBlur = () => {
    this.keyDown = false;
    this.setState({ focused: false });
    document.removeEventListener("keyup", this.keyUpListener);
    document.removeEventListener("keydown", this.keyDownListener);
  }

  focus() {
    const { focused } = this.state;
    const { container } = this;

    if (!focused && container) {
      container.focus();
      return true;
    }
    return false;
  }

  getIndex(value, options) {
    for (let i = 0; i < options.length; i++) {
      if(options[i].value === value) {
        return i;
      }
    }
    return -1;
  }

  onPrevious(value, options, onChange) {
    const idx = this.getIndex(value, options);
    if (idx !== -1 && idx > 0) {
      onChange(options[idx - 1].value);
      return true;
    }
    return false;
  }

  onNext(value, options, onChange) {
    const idx = this.getIndex(value, options);
    if (idx !== -1 && idx < options.length - 1) {
      onChange(options[idx + 1].value);
      return true;
    }
    return false;
  }

  render() {
    const { focused } = this.state;
    const { value, options, onChange } = this.props;
    const idx = this.getIndex(value, options)

    // TODO: make a property that can be set
    const width = "7.5rem";

    const opts = [];
    for (let i = 0; i < options.length; i++) {
      opts.push(
        <div
          className={styles['select-group-text-inner-option']}
          style={{
            width: width,
            maxWidth: width,
            minWidth: width
          }}
        >
          {options[i].label}
        </div>
      )
    }

    return (
      <div
        className={styles['select']}
        tabIndex="0"
        ref={(container) => { this.container = container; }}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
      >
        <div className={styles['select-group']}>
          <div>
            <Arrow
              focused={focused}
              imgSrc={ChevronLeftWhiteImage}
              onClick={() => {this.onPrevious(value, options, onChange)}}
              disabled={idx === 0}
            />
          </div>
          <div
            className={styles['select-group-text'] + (focused ? (" " + styles['select-group-text__focused'])  : "")}
            style={{
              width: width,
              maxWidth: width,
              minWidth: width
            }}
            onClick={() => {
              if (!this.onNext(value, options, onChange)) {
                onChange(options[0].value);
              }
            }}
          >
            <div
              className={styles['select-group-text-inner']}
              style={{transform: 'translateX(-' + (idx * 100) + '%)'}}>
              {opts}
            </div>
          </div>
          <div>
            <Arrow
              focused={focused}
              imgSrc={ChevronRightWhiteImage}
              onClick={() => {this.onNext(value, options, onChange)}}
              disabled={idx === (options.length - 1)}
            />
          </div>
        </div>
      </div>
    );
  }
};

Select.contextType = WebrcadeContext;

