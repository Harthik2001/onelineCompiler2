// client/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import MainApp from './App';
import { ThemeProvider } from './context/ThemeContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  </React.StrictMode>
);