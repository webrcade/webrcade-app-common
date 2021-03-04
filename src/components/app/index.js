import React, { Component } from "react";
import { UrlUtil } from '../../util';
import { AppProps } from '../../app';

import styles from './style.scss'

export class WebrcadeApp extends Component {
  constructor() {
    super();

    this.state = {
      mode: this.ModeEnum.LOADING
    };
  }

  ModeEnum = {
    LOADING: "loading",
    LOADED: "loaded"
  }

  componentDidMount() {
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
}

