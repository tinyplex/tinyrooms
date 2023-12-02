import {Auth} from './Auth';
import {Logo} from './Logo';
import React from 'react';

export const Header = () => (
  <header id="header">
    <Logo />
    <Auth />
  </header>
);
