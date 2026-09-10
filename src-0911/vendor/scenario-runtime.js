/* Shim for the vendored scenario chunks. The original build imported these four
   bindings out of its own app bundle; importing that bundle here would boot a second
   copy of the old site, so they are supplied directly instead.
     r / R -> React        g -> CJS default-interop helper
     c     -> createRoot   u -> the scenario clock this app provides */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { useScenarioTime } from '../components/scenario-time.jsx';

const getDefaultExportFromCjs = (m) =>
  m && m.__esModule && Object.prototype.hasOwnProperty.call(m, 'default') ? m.default : m;

export { React as r, React as R, getDefaultExportFromCjs as g, createRoot as c, useScenarioTime as u };
