import React, { useState, useEffect } from 'react';

/**
 * Header component that displays the application title and a dark mode toggle.
 * 
 * Manages the dark mode state using local storage to persist user preference.
 * Toggles the 'dark-mode' class on the document body.
 */
function Header() {
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark-mode'
  );

  useEffect(() => {
    // Apply or remove the dark-mode class based on state
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.removeItem('theme');
    }
  }, [isDarkMode]);

  return (
    <header>
      <h1>Formulari Ubat PKD Kuala Langat (unofficial)</h1>
      <button id="darkModeToggle" onClick={() => setIsDarkMode(!isDarkMode)}>
        <svg className="toggle-icon" width="40" height="20" viewBox="0 0 40 20">
          <rect className="toggle-bg" width="40" height="20" rx="10" />
          <circle className="toggle-circle" cx="10" cy="10" r="8" />
        </svg>
      </button>
    </header>
  );
}

export default Header;
