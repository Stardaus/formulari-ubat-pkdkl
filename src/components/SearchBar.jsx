import React from 'react';
import { Search, X } from 'lucide-react';

/**
 * SearchBar component for filtering medications.
 */
function SearchBar({ searchQuery, setSearchQuery }) {
  return (
    <section className="space-y-4">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
          <Search size={22} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by generic name..."
          className="w-full pl-12 pr-12 py-4 bg-stone-50 dark:bg-gray-900 border border-stone-200 dark:border-gray-800 rounded-2xl shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-500/50 transition-all placeholder:text-gray-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        )}
      </div>
    </section>
  );
}

export default SearchBar;