import {useUiOnline, useUiUsername} from '../../../stores/UiStore';
import React from 'react';

export const Status = () => (
  <div id="status">
    <p>
      {useUiUsername() ? 'authenticated' : 'anonymous'}
      {' & '}
      {useUiOnline() ? 'online' : 'offline'}
    </p>
  </div>
);
