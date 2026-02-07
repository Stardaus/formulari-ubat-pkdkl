import React from 'react';

/**
 * Footer component that renders the bottom section of the page.
 * 
 * Contains the Disclaimer link button.
 *
 * @param {Object} props
 * @param {Function} props.onOpenDisclaimer - Callback function to open the Disclaimer modal.
 */
function Footer({ onOpenDisclaimer }) {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); onOpenDisclaimer(); }} 
          className="button"
        >
          Disclaimer
        </a>
      </div>
    </footer>
  );
}

export default Footer;
