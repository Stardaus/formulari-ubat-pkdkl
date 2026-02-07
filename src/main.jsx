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

      // Check for updates periodically
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content is available; please refresh.
                console.log('New app version available. Notifying user...');
                window.dispatchEvent(new CustomEvent('NEW_APP_VERSION'));
              }
            }
          };
        }
      };
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });

  // Listen for the controllerchange event (triggered by skipWaiting)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('Service Worker controller changed. Reloading might be needed.');
  });
}

// React Root Rendering
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
