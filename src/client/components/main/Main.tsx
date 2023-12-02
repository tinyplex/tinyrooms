import React from 'react';
import {Room} from './room/Room';
import {Sidebar} from './sidebar/Sidebar';

export const Main = () => (
  <div id="main">
    <Sidebar />
    <Room />
  </div>
);
