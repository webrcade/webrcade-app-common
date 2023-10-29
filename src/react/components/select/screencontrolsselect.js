import React from 'react';

import { Select } from "."
import { Resources } from '../../../resources';
import { TEXT_IDS } from '../../../resources';
import { SCREEN_CONTROLS } from '../../../app';

export function ScreenControlsSelect(props) {
  const {addDefault, onPad, value, onChange, selectRef } = props;

  const opts = [];
  if (addDefault) {
    opts.push({ value: SCREEN_CONTROLS.SC_AUTO, label: Resources.getText(TEXT_IDS.SC_AUTO)});
  }
  opts.push({ value: SCREEN_CONTROLS.SC_ON, label: Resources.getText(TEXT_IDS.SC_ON)});
  
  return (
    <Select
      ref={selectRef}
      options={opts}
      onChange={value => onChange(value)}
      value={value}
      onPad={e => onPad(e)}
    />
  )
}
