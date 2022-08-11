import React from "react";
import { LoaderImage } from "../../../images";
import { Screen } from '../../components/screen'

import styles from './style.scss'

export class StatusScreen extends Screen {
  constructor() {
    super();
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  render() {
    const { message } = this.props;

    return (
      <div className={styles['status-screen']}>
        <div className={styles['status-screen-content']}>
          <div>
            <img className={styles['status-screen-content-image']} src={LoaderImage}/>
          </div>
          <div className={styles['status-screen-content-text']}>{message}</div>
        </div>
      </div>
    );
  }
}
