import React from 'react';

import { Select } from "."
import { Resources } from '../../../resources';
import { TEXT_IDS } from '../../../resources';
import { SCREEN_SIZES } from '../../../settings';

export function ScreenSizeSelect(props) {
  const {addDefault, onPad, value, onChange, selectRef } = props;

  const opts = [];
  if (addDefault) {
    opts.push({ value: SCREEN_SIZES.SS_DEFAULT, label: Resources.getText(TEXT_IDS.SS_DEFAULT)});
  }
  opts.push({ value: SCREEN_SIZES.SS_NATIVE, label: Resources.getText(TEXT_IDS.SS_NATIVE)});
  opts.push({ value: SCREEN_SIZES.SS_16_9, label: Resources.getText(TEXT_IDS.SS_16_9)});
  opts.push({ value: SCREEN_SIZES.SS_FILL, label: Resources.getText(TEXT_IDS.SS_FILL)});

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
