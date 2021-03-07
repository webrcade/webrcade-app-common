import React, { Component } from "react";
import { UrlUtil } from '../../util';
import { AppProps } from '../../app';
import { isDev } from '../../dev'

import styles from './style.scss'

export class WebrcadeApp extends Component {
  constructor() {
    super();

    this.state = {
      mode: this.ModeEnum.LOADING
    };

    this.exited = false;
  }

  ModeEnum = {
    LOADING: "loading",
    LOADED: "loaded"
  }

  componentDidMount() {
    // Avoid the white flash
    if (!isDev()) {
      try {
        window.frameElement.style.display = 'block';
      } catch(e) {
        console.log('error attempting to make application visible: ' + e)
      }
    }

    console.log(window.location.search);
    const propsEncoded = UrlUtil.getParam(
      window.location.search, AppProps.RP_PROPS);
    if (propsEncoded) {
      this.appProps = AppProps.decode(propsEncoded);
    } else {
      this.appProps = {};
    }
  }

  renderLoading() {
    return (<div className={styles.loading}>Loading...</div>);
  }

  exit(error) {
    if (error) {
      console.log(error);
    }
    if (!this.exited) {
      if (error) {
        alert(error);
      }
      this.exited = true;
      window.history.back();
    }
  }
}

