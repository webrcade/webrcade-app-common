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
      <div className={styles['message-container']}>
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

export function showMessage(message, addConsoleMessage = true) {
  const el = document.getElementById(styles['snackbar']);
  if (el) {
    el.innerHTML = message.replaceAll("\n", "<br/>") + ( addConsoleMessage ? "<br/><br/>See console log for details." : "");
    el.classList.add(styles['show']);
    el.classList.remove(styles['hide']);
    if (timeoutId > 0) {
      window.clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(() => hideMessage(), 5000);
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

