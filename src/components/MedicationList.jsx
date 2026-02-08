import React from 'react';

/**
 * MedicationList component renders a list of search results.
 * 
 * Displays key details like Generic Name, Category, and Group.
 * Highlights quota items visually.
 *
 * @param {Object} props
 * @param {Array<Object>} props.results - Array of Fuse.js result objects (containing an 'item' property).
 * @param {Function} props.onSelect - Callback function triggered when a medication is clicked.
 * @param {string} props.searchTerm - Current search term.
 */
function MedicationList({ results, onSelect, searchTerm }) {
  if (results.length === 0) {
    if (searchTerm && searchTerm.trim() !== "") {
      return (
        <div id="results-container">
          <p>No results found.</p>
        </div>
      );
    }
    return null;
  }

  return (
    <div id="results-container">
      {results.map((result, index) => {
        const { item } = result;
        const isQuota = item.is_quota;
        
        return (
          <div 
            key={index}
            className={`result-item ${isQuota ? 'quota-item' : ''}`} 
            onClick={() => onSelect(item)}
          >
            <h3>{item["Generic Name"]}</h3>
            <p><strong>Category:</strong> {item.Category}</p>
            <p><strong>Group:</strong> {item["FUKKM System/Group"]}</p>
            {isQuota && (
              <p className="quota-status"><strong>This is a Quota Item.</strong></p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default MedicationList;
