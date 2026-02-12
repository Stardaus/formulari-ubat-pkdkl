import React, { useState, useEffect, useMemo } from 'react';
import { useMedicationData } from './hooks/useMedicationData';

// Import newly updated components
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import MedicationList from './components/MedicationList';
import RecentMedications from './components/RecentMedications';
import MedicationDetails from './components/MedicationDetails';
import DisclaimerModal from './components/DisclaimerModal';

/**
 * Main App component.
 */
export default function App() {
  // --- Data Fetching ---
  const { data: medications, loading, error } = useMedicationData();
  
  // --- Application State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(null); // 'all' or 'quota'
  const [selectedMed, setSelectedMed] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(() => {
    return localStorage.getItem('disclaimer-agreed') !== 'true';
  });
  const [recentMeds, setRecentMeds] = useState(() => {
    const saved = localStorage.getItem('recent-meds');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse recents", e);
        return [];
      }
    }
    return [];
  });
  
  // Theme state: Initialize from system preference or local storage
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app-theme');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [newDataAvailable, setNewDataAvailable] = useState(false);

  // --- Effects ---
  // Listen for Service Worker messages
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleMessage = (event) => {
        if (event.data && event.data.type === 'NEW_DATA_AVAILABLE') {
          console.log('New data available message received in App');
          setNewDataAvailable(true);
        }
      };

      navigator.serviceWorker.addEventListener('message', handleMessage);
      
      // Also listen for app updates (code changes)
      const handleAppUpdate = () => {
        console.log('New app version event received in App');
        setNewDataAvailable(true);
      };
      window.addEventListener('NEW_APP_VERSION', handleAppUpdate);

      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
        window.removeEventListener('NEW_APP_VERSION', handleAppUpdate);
      };
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  // --- Handlers ---
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleSelectMed = (med) => {
    setSelectedMed(med);
    
    // Update Recent list
    setRecentMeds(prev => {
      const filtered = prev.filter(m => m.id !== med.id);
      const updated = [med, ...filtered].slice(0, 5); // Keep last 5
      localStorage.setItem('recent-meds', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearRecents = () => {
    setRecentMeds([]);
    localStorage.removeItem('recent-meds');
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      setActiveFilter(null);
    }
  };

  const toggleFilter = (filter) => {
    if (activeFilter === filter) {
      setActiveFilter(null);
    } else {
      setActiveFilter(filter);
      setSearchQuery('');
    }
  };

  // --- Filter Logic ---
  const displayMeds = useMemo(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return medications.filter(med => 
        med.name && med.name.toLowerCase().includes(query)
      );
    }
    
    if (activeFilter === 'all') {
      return medications;
    }
    
    if (activeFilter === 'quota') {
      return medications.filter(med => med.isQuota);
    }
    
    return [];
  }, [searchQuery, activeFilter, medications]);

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 dark:bg-gray-950 text-red-600">
      <div className="text-center p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-xl">
        <h2 className="text-xl font-bold mb-2">Error loading data</h2>
        <p>{error.message}</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen relative bg-stone-100 text-stone-900 dark:bg-gray-950 dark:text-gray-100 font-sans selection:bg-indigo-500/30">
        
        {/* --- ELEGANT PATTERNED BACKGROUND --- */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          {/* Subtle Dot Matrix Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#a8a29e_1px,transparent_1px)] dark:bg-[radial-gradient(#4b5563_1px,transparent_1px)] [background-size:24px_24px] opacity-40 dark:opacity-20"></div>
          {/* Soft Mesh Gradient Glow */}
          <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[80%] max-w-[800px] h-[50vh] bg-indigo-500/15 dark:bg-indigo-500/10 blur-[100px] rounded-full"></div>
        </div>

        {/* Content Wrapper to sit above the background */}
        <div className="relative z-10 flex flex-col min-h-screen">
          
          <DisclaimerModal 
            isOpen={showDisclaimer} 
            onClose={() => {
              setShowDisclaimer(false);
              localStorage.setItem('disclaimer-agreed', 'true');
            }} 
          />
          
          {selectedMed && (
            <MedicationDetails 
              med={selectedMed} 
              onClose={() => setSelectedMed(null)} 
            />
          )}

          <Header 
            theme={theme} 
            toggleTheme={toggleTheme} 
            setShowDisclaimer={() => setShowDisclaimer(true)} 
          />

          {newDataAvailable && (
            <div 
              className="sticky z-20 w-full bg-indigo-600 text-white py-3 px-4 shadow-lg animate-in slide-in-from-top duration-300"
              style={{ top: `calc(4rem + var(--sat, 0px))` }}
            >
              <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
                  </div>
                  <p className="text-sm font-bold tracking-tight">New formulary data available!</p>
                </div>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-1.5 bg-white text-indigo-600 text-xs font-black rounded-lg hover:bg-indigo-50 transition-colors shadow-sm uppercase"
                >
                  Refresh Now
                </button>
              </div>
            </div>
          )}
          
          <main className="flex-grow max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 pb-24">
             <div className="space-y-4">
                <SearchBar searchQuery={searchQuery} setSearchQuery={handleSearchChange} />
                
                {/* Quick Filters */}
                <div className="flex flex-wrap gap-2 px-1">
                   <button 
                     onClick={() => toggleFilter('all')}
                     className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                       activeFilter === 'all' 
                         ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                         : 'bg-white/50 dark:bg-gray-900/50 border-stone-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-indigo-300 dark:hover:border-indigo-700'
                     }`}
                   >
                     Show All
                   </button>
                   <button 
                     onClick={() => toggleFilter('quota')}
                     className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                       activeFilter === 'quota' 
                         ? 'bg-yellow-500 border-yellow-500 text-white shadow-md' 
                         : 'bg-white/50 dark:bg-gray-900/50 border-stone-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-yellow-300 dark:hover:border-yellow-700'
                     }`}
                   >
                     Quota Items
                   </button>
                </div>
             </div>
               
             {loading && <LoadingSpinner />}
               
             {!loading && (searchQuery || activeFilter) && (
               <MedicationList filteredMeds={displayMeds} handleSelectMed={handleSelectMed} />
             )}
               
             {!loading && !searchQuery && !activeFilter && (
               <RecentMedications 
                 recentMeds={recentMeds} 
                 handleSelectMed={handleSelectMed} 
                 handleClearRecents={handleClearRecents} 
               />
             )}
          </main>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple LoadingSpinner component.
 */
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium animate-pulse">Loading formulary data...</p>
    </div>
  );
}