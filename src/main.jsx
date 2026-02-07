import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/style.css';

/**
 * Entry point of the React application.
 * 
 * Responsible for:
 * 1. Mounting the root React component (App).
 * 2. Registering the Service Worker for offline capabilities and background updates.
 */

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}

// React Root Rendering
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
