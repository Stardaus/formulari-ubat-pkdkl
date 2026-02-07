import React, { useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { trackSearch, trackButtonClick } from '../utils/analytics';

function SearchBar({ data, setSearchResults, searchTerm, setSearchTerm }) {
  const fuse = useMemo(() => new Fuse(data, {
    keys: ["Generic Name", "Brand", "FUKKM System/Group", "Category"],
    threshold: 0.1,
    limit: 10,
  }), [data]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }
    const results = fuse.search(searchTerm);
    setSearchResults(results);
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
