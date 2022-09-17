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
            <object type="image/svg+xml" className={styles['status-screen-content-image']} data={LoaderImage}/>
          </div>
          <div className={styles['status-screen-content-text']}>{message}</div>
        </div>
      </div>
    );
  }
}
