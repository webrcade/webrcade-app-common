import React, { Component } from "react";

import { WebrcadeContext } from '../../context/webrcadecontext.js'
import { ImageButton } from "../image-button";

export class FileButton extends ImageButton {
  constructor() {
    super();

    this.fileInputRef = React.createRef();
  }

  onClick = e => {
    const { onClick } = this.props;
    if (onClick) onClick();
    const { fileInputRef } = this;
    fileInputRef.current.click();
  }

  render() {
    const { fileInputRef } = this;
    const { onFileSelect } = this.props;

    return (
      <div>
        {super.render()}
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={onFileSelect}
        />
      </div>
    );
  }
};

FileButton.contextType = WebrcadeContext;
