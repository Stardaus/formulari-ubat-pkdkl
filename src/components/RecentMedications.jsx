import React from 'react';
import { trackButtonClick } from '../utils/analytics';

/**
 * RecentMedications component displays a list of recently viewed medications.
 * 
 * Renders a horizontal list of clickable chips.
 * Allows the user to clear the history.
 *
 * @param {Object} props
 * @param {Array<Object>} props.medications - Array of recently viewed medication objects.
 * @param {Function} props.onSelect - Callback function when a recent item is clicked.
 * @param {Function} props.onClear - Callback function to clear the recent history.
 */
function RecentMedications({ medications, onSelect, onClear }) {
  if (medications.length === 0) return null;

  return (
    <div id="recent-medications-container">
      <div className="recent-header-wrapper">
        <h3>
          Recently Viewed
          <button 
            id="clearRecentButton" 
            onClick={onClear} 
            aria-label="Clear recently viewed"
          >
            ✕
          </button>
        </h3>
      </div>
      <div className="recent-items-wrapper">
        {medications.map((item, index) => (
          <div 
            key={index} 
            className="recent-item" 
            onClick={() => onSelect(item)}
          >
            {item["Generic Name"]}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentMedications;
