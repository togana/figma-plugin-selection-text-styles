import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/app';

const rootElement = document.getElementById('app');

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
