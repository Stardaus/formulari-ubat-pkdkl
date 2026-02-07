import React, { useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { trackSearch, trackButtonClick } from '../utils/analytics';

/**
 * SearchBar component provides a text input for users to search medications.
 * 
 * Uses Fuse.js for fuzzy searching across multiple fields.
 * Updates the search results state in the parent component.
 * Tracks search events and button clicks for analytics.
 *
 * @param {Object} props
 * @param {Array<Object>} props.data - The complete array of medication objects to search.
 * @param {Function} props.setSearchResults - State setter to update the filtered results.
 * @param {string} props.searchTerm - Current search input value.
 * @param {Function} props.setSearchTerm - State setter to update the search input value.
 */
function SearchBar({ data, setSearchResults, searchTerm, setSearchTerm }) {
  // Initialize Fuse.js with memoization to prevent expensive re-instantiation
  const fuse = useMemo(() => new Fuse(data, {
    keys: ["Generic Name", "Brand", "FUKKM System/Group", "Category"],
    threshold: 0.1, // Lower threshold = stricter matching
    limit: 10,      // Limit results for performance
  }), [data]);

  useEffect(() => {
    // Clear results if search term is empty
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }
    // Perform the search
    const results = fuse.search(searchTerm);
    setSearchResults(results);
    
    // Track the search term (debounce logic might be a good future improvement)
    trackSearch(searchTerm);
  }, [searchTerm, fuse, setSearchResults]);

  const handleClear = () => {
    trackButtonClick("clear_search");
    setSearchTerm("");
  };

  return (
    <div className="search-container">
      <input 
        id="searchBox"
        type="text" 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search for a drug..." 
      />
      {searchTerm && (
        <button id="clearSearchButton" onClick={handleClear} aria-label="Clear search" style={{ display: 'block' }}>✕</button>
      )}
    </div>
  );
}

export default SearchBar;
