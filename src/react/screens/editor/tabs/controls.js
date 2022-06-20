import React from "react";

import { EditorTab } from '../'

import {
  XboxOneAButton,
  XboxOneBButton,
  XboxOneXButton,
  XboxOneYButton,
  XboxOneDpad,
  XboxOneLeftStick,
  XboxOneRightStick,
  XboxOneMenuButton,
  XboxOneWindowsButton,
  XboxOneLeftBumper,
  XboxOneRightBumper,
  XboxOneRightTrigger,
  XboxOneLeftTrigger,
  ArrowUpKey,
  ArrowDownKey,
  ArrowLeftKey,
  ArrowRightKey,
  EnterKey,
  ShiftKey,
  AKey,
  CKey,
  DKey,
  SKey,
  VKey,
  XKey,
  ZKey,
} from '../../../../images'

import styles from './controls-style.scss'

export class ControlsTab extends EditorTab {

  getGamepadImage(control) {
    switch (control) {
      case "start":
        return XboxOneMenuButton;
      case "select":
        return XboxOneWindowsButton;
      case "dpad":
        return XboxOneDpad;
      case "lanalog":
        return XboxOneLeftStick;
      case "ranalog":
        return XboxOneRightStick;
      case "a":
        return XboxOneAButton;
      case "b":
        return XboxOneBButton;
      case "x":
        return XboxOneXButton;
      case "y":
        return XboxOneYButton;
      case "lbump":
        return XboxOneLeftBumper;
      case "rbump":
        return XboxOneRightBumper;
      case "ltrig":
        return XboxOneLeftTrigger;
      case "rtrig":
        return XboxOneRightTrigger;
    }
  }

  getKeyImage(key) {
    switch (key) {
      case 'Enter':
        return EnterKey;
      case 'ShiftRight':
        return ShiftKey;
      case 'ArrowRight':
        return ArrowRightKey;
      case 'ArrowLeft':
        return ArrowLeftKey;
      case 'ArrowUp':
        return ArrowUpKey;
      case 'ArrowDown':
        return ArrowDownKey;
      case 'KeyZ':
        return ZKey;
      case 'KeyX':
        return XKey;
      case 'KeyC':
        return CKey;
      case 'KeyV':
        return VKey;
      case 'KeyA':
        return AKey;
      case 'KeyS':
        return SKey;
      case 'KeyD':
        return DKey;
      default:
        return "";
    }
  }

  renderKey(key, description) {
    return (
      <div key={key} className={styles['controls-screen-content-container-row']}>
        <div className={styles['controls-screen-content-container-column']}>
          <img className={styles['controls-gamepad-button']} src={this.getKeyImage(key)} alt=""></img>
        </div>
        <div className={styles['controls-screen-content-container-column']}>
          {description}
        </div>
      </div>
    );
  }

  renderControl(control, description) {
    return (
      <div className={styles['controls-screen-content-container-row']}>
        <div className={styles['controls-screen-content-container-column']}>
          <img className={styles['controls-gamepad-button']} src={this.getGamepadImage(control)} alt=""></img>
        </div>
        <div className={styles['controls-screen-content-container-column']}>
          {description}
        </div>
      </div>
    );
  }
}
