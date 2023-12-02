import {APP_NAME} from '../../../config';
import React from 'react';

export const Logo = () => (
  <div id="logo">
    <img src="/favicon.svg" alt="TinyBase logo" />
    <h1>{APP_NAME}</h1>
    <a
      className="what"
      href="https://github.com/tinyplex/tinyrooms"
      title="A local-first app demo, using TinyBase and PartyKit."
      target="_blank"
      rel="noreferrer"
    />
  </div>
);
