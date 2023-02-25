import React from "react";
import { Component } from "react";

import { EditorTab } from '../'

import styles from './fields-style.scss'

export class FieldRow extends Component {
  render() {
    const { children } = this.props;
    return (
      <div className={styles['fields-screen-row']}>
        {children}
      </div>
    )
  }
}

export class FieldLabel extends Component {
  render() {
    const { children } = this.props;
    return (
      <div className={styles['fields-screen-label']}>
        {children}
      </div>
    )
  }
}

export class FieldControl extends Component {
  render() {
    const { children } = this.props;
    return (
      <div className={styles['fields-screen-control']}>
        {children}
      </div>
    )
  }
}

export class FieldSpan extends Component {
  render() {
    const { children } = this.props;
    return (
      <div className={styles['fields-screen-span']}>
        {children}
      </div>
    )
  }
}

export class FieldsTab extends EditorTab {
}
