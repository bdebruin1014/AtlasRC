import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Suppress known third-party library warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
      args[0]?.includes?.('UNSAFE_componentWillMount') ||
          args[0]?.includes?.('v7_startTransition') ||
              args[0]?.includes?.('v7_relativeSplatPath')
                ) {
                    return;
                      }
                        originalWarn(...args);
                        };

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
