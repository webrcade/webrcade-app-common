import React, { Component } from "react";

import * as LOG from '../../../log';
import { AppRegistry } from '../../../apps';
import { isDev } from '../../../util';

import styles from './style.scss'

export class AppScreen extends Component {

  constructor() {
    super();

    this.frameRetryId = null;
  }

  MAX_LOAD_TIME = 10 * 1000;

  clearRefreshTimout() {
    const { frameRetryId } = this;

    if (frameRetryId != null) {
      clearTimeout(frameRetryId);
      this.frameRetryId = null;
    }
  }

  messageListener = e => {
    if (e.data === 'appLoaded') {
      LOG.info("app loaded message received.")
      this.clearRefreshTimout();
    }
  }

  componentDidMount() {
    const { frameRef } = this.props;
    const { MAX_LOAD_TIME } = this;

    window.addEventListener("message", this.messageListener);

    this.frameRetryId = setTimeout(() => {
      if (frameRef.current && !isDev()) {
        LOG.info("attempting to reload frame, exceeded wait timeout: " + MAX_LOAD_TIME);
        frameRef.current.contentDocument.location.reload();
      }
    }, MAX_LOAD_TIME);
  }

  componentWillUnmount() {
    window.removeEventListener("message", this.messageListener);

    this.clearRefreshTimout();
  }

  render() {
    const { app, context, frameRef } = this.props;
    const reg = AppRegistry.instance;

    return (
      <div className="webrcade-app">
        {
          // eslint-disable-next-line
        }<iframe
          ref={frameRef}
          style={!isDev() ? { display: "none" } : {}}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="autoplay; gamepad"
          src={reg.getLocation(app, context)} />
      </div>
    )
  }
};
