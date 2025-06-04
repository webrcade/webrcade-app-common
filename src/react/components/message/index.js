import React, { Component } from "react";

import styles from './style.scss'

export class Message extends Component {
  constructor() {
    super();
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  render() {
    return (
      <div id={styles['message-container']} className={styles['message-container']}>
        <div
          id={styles['snackbar']}
          className={styles['message']}
          onClick={() => hideMessage()}
        />
      </div>
    );
  }
};

let timeoutId = -1;
let anchorId = null;

export function setMessageAnchorId(id) {
  anchorId = id;
}

export function showMessage(message, addConsoleMessage = true, isError = true, timeout = null) {
  const container = document.getElementById(styles['message-container']);
  const el = document.getElementById(styles['snackbar']);

  if (anchorId) {
    const parentEl = document.getElementById(anchorId);
    if (parentEl) {
      const rect = parentEl.getBoundingClientRect();
      container.style.position = 'absolute';
      container.style.top = ((rect.top < 0 ? 0 : rect.top) + window.scrollY) + "px";
      container.style.left = "50%";
    }
  }

  if (el) {
    el.innerHTML = (message ? (message + "").replaceAll("\n", "<br/>") : "Unknown error") + (addConsoleMessage ? "<br/><br/>See console log for details." : "");
    el.classList.add(styles['show']);
    el.classList.remove(styles['hide']);
    if (timeoutId > 0) {
      window.clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(() => hideMessage(), timeout ? timeout : (isError ? 5000 : 2000));
  }
}

export function hideMessage() {
  const el = document.getElementById(styles['snackbar']);
  if (el) {
    window.setTimeout(() => {
      el.classList.add(styles['hide']);
      el.classList.remove(styles['show']);
    }, 0);
  }
}

