import React from 'react';

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
