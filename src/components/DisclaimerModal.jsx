import React from 'react';

/**
 * DisclaimerModal component displays important legal and medical disclaimers.
 * 
 * Renders as a modal overlay with a close button.
 *
 * @param {Object} props
 * @param {Function} props.onClose - Callback function to close the modal.
 */
function DisclaimerModal({ onClose }) {
  return (
    <div id="disclaimer-modal" className="modal" style={{ display: 'block' }}>
      <div className="modal-content">
        <span className="close-button" onClick={onClose}>&times;</span>
        <h2>Important: Medical Information Disclaimer</h2>
        <p>This District Drug Catalogue application is intended for use only by qualified and licensed healthcare professionals as a supplementary reference tool. It is not a substitute for professional clinical judgment, diagnosis, or treatment. While every effort is made to ensure the accuracy and timeliness of the information regarding formularies, brands, and quotas, the data may not be exhaustive and is subject to change without notice. Users must independently verify all critical information—including but not limited to drug indications, dosages, contraindications, and contract details—with official sources such as the latest Formulary Ubat KKM (FUKKM), pharmacy department circulars, and other clinical guidelines before making any prescribing decisions. The developers and administrators of this application accept no responsibility or liability for any errors, omissions, or for any clinical outcomes resulting from the use of this information.</p>
      </div>
    </div>
  );
}

export default DisclaimerModal;
