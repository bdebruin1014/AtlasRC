import React from 'react';
import ReactDOM from 'react-dom/client';
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

const root = document.getElementById('root');

function renderApp() {
  try {
    // Dynamic import ensures any top-level module errors are caught
    import('./App').then(({ default: App }) => {
      ReactDOM.createRoot(root).render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    }).catch((err) => {
      console.error('Failed to load App module:', err);
      showFallback(err);
    });
  } catch (err) {
    console.error('Failed to initialize App:', err);
    showFallback(err);
  }
}

function showFallback(err) {
  if (root) {
    root.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui,sans-serif;background:#f9fafb;padding:20px">
        <div style="text-align:center;max-width:500px">
          <h1 style="font-size:24px;font-weight:bold;color:#111827;margin-bottom:8px">Atlas</h1>
          <p style="color:#6b7280;margin-bottom:16px">The application failed to load. Please try again.</p>
          <p style="color:#ef4444;font-size:13px;margin-bottom:16px;word-break:break-word">${err?.message || 'Unknown error'}</p>
          <button onclick="location.reload()" style="padding:8px 24px;background:#3b82f6;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px">Reload Page</button>
        </div>
      </div>
    `;
  }
}

renderApp();
