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
  ControlKey,
  EnterKey,
  ShiftKey,
  AKey,
  CKey,
  DKey,
  SKey,
  VKey,
  XKey,
  ZKey,
  QKey,
  WKey,
  IKey,
  JKey,
  KKey,
  LKey,
  TKey,
  RKey,
  EKey,
  SpaceKey,
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
      case 'ControlLeft':
        return ControlKey;
      case 'ShiftRight':
        return ShiftKey;
      case 'ShiftLeft':
        return ShiftKey;
      case 'Space':
        return SpaceKey;
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
      case 'KeyQ':
        return QKey;
      case 'KeyW':
        return WKey;
      case 'KeyI':
        return IKey;
      case 'KeyJ':
        return JKey;
      case 'KeyK':
        return KKey;
      case 'KeyL':
        return LKey;
      case 'KeyT':
        return TKey;
      case 'KeyR':
        return RKey;
      case 'KeyE':
        return EKey;
      default:
        return "";
    }
  }

  renderKey(key, description) {
    return (
      <div key={key} className={styles['controls-screen-row']}>
        <div className={styles['controls-screen-column']}>
          <img className={styles['controls-gamepad-button']} src={this.getKeyImage(key)} alt=""></img>
        </div>
        <div className={styles['controls-screen-column']}>
          {description}
        </div>
      </div>
    );
  }

  renderControl(control, description) {
    return (
      <div className={styles['controls-screen-row']}>
        <div className={styles['controls-screen-column']}>
          <img className={styles['controls-gamepad-button']} src={this.getGamepadImage(control)} alt=""></img>
        </div>
        <div className={styles['controls-screen-column']}>
          {description}
        </div>
      </div>
    );
  }
}
