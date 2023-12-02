import {APP_NAME} from '../config';
import {App} from './App';
import React from 'react';
import ReactDOM from 'react-dom/client';

window.addEventListener('load', async () => {
  document.title = APP_NAME;

  ReactDOM.createRoot(document.getElementById('app')!).render(<App />);

  await navigator.serviceWorker.register('/worker.js', {
    scope: location.origin,
  });
});
