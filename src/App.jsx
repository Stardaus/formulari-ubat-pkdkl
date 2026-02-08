import React, { useState, useEffect, useMemo } from 'react';
import { useMedicationData } from './hooks/useMedicationData';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import MedicationList from './components/MedicationList';
import MedicationDetails from './components/MedicationDetails';
import RecentMedications from './components/RecentMedications';
import Footer from './components/Footer';
import DisclaimerModal from './components/DisclaimerModal';
import { trackPageView } from './utils/analytics';

/**
 * Main App component.
 * 
 * Orchestrates the entire application state including:
 * - Data fetching (via custom hook)
 * - Search results and filtering
 * - Navigation between list and details views
 * - Recent medications history (persisted in localStorage)
 * - UI notifications (Service Worker updates)
 * - Analytics tracking
 */
function App() {
  // --- Data State ---
  const { data, loading, error } = useMedicationData();
  
  // --- UI State ---
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [recentMedications, setRecentMedications] = useState(
    JSON.parse(localStorage.getItem('recentMedications')) || []
  );
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState(null); // 'all', 'quota', or null
  const [view, setView] = useState('list'); // 'list' or 'details'
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);

  // --- Derived State ---
  const displayResults = useMemo(() => {
    if (activeFilter === 'all') {
      return data.map(item => ({ item }));
    }
    if (activeFilter === 'quota') {
      return data.filter(item => item.is_quota).map(item => ({ item }));
    }
    return searchResults;
  }, [activeFilter, data, searchResults]);

  // --- Effects ---

  /**
   * Effect to track page views via Google Analytics.
   * Tracks virtual page views when switching between List and Details views.
   */
  useEffect(() => {
    trackPageView(view === 'details' ? `/drug/${selectedMedication?.['Generic Name']}` : '/');
  }, [view, selectedMedication]);

  /**
   * Effect to listen for Service Worker updates.
   * Sets the notification state when a 'NEW_DATA_AVAILABLE' message is received.
   */
  useEffect(() => {
    const handleMessage = (event) => {
      console.log("App received message:", event.data);
      if (event.data && event.data.type === 'NEW_DATA_AVAILABLE') {
        setShowUpdateNotification(true);
      }
    };

    const handleAppUpdate = () => {
      console.log("New app version detected via event.");
      setShowUpdateNotification(true);
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleMessage);
    }
    window.addEventListener('NEW_APP_VERSION', handleAppUpdate);

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      }
      window.removeEventListener('NEW_APP_VERSION', handleAppUpdate);
    };
  }, []);

  // --- Handlers ---

  /**
   * Refreshes the page to load the new service worker and data.
   */
  const handleRefresh = () => {
    localStorage.setItem('lastManualRefresh', Date.now());
    window.location.reload();
  };

  /**
   * Selects a medication to view its details.
   * Updates the 'Recent Medications' list in local storage.
   * 
   * @param {Object} med - The medication object selected.
   */
  const handleSelectMedication = (med) => {
    setSelectedMedication(med);
    setView('details');
    
    // Update recent medications list (Limit to top 5)
    const updatedRecent = [
      med,
      ...recentMedications.filter(m => m['Generic Name'] !== med['Generic Name'])
    ].slice(0, 5);
    setRecentMedications(updatedRecent);
    localStorage.setItem('recentMedications', JSON.stringify(updatedRecent));
  };

  /**
   * Navigates back to the medication list view.
   */
  const handleBack = () => {
    setView('list');
    setSelectedMedication(null);
  };

  /**
   * Clears the recently viewed medications history.
   */
  const handleClearRecent = () => {
    setRecentMedications([]);
    localStorage.removeItem('recentMedications');
  };

  if (loading) return <div className="loading">Loading medications...</div>;
  if (error) return <div className="error">Error loading data.</div>;

  return (
    <div className="app-container">
      <Header />
      <main>
        {view === 'list' ? (
          <>
            <SearchBar 
              data={data} 
              setSearchResults={setSearchResults} 
              searchTerm={searchTerm}
              setSearchTerm={(term) => {
                setSearchTerm(term);
                if (term.trim() !== '') setActiveFilter(null);
              }}
            />
            <RecentMedications 
              medications={recentMedications} 
              onSelect={handleSelectMedication}
              onClear={handleClearRecent}
            />
            {/* Filter Buttons */}
            <div className="button-group">
               <button 
                 id="showAllButton"
                 className={activeFilter === 'all' ? 'active' : ''}
                 onClick={() => {
                   if (activeFilter === 'all') {
                     setActiveFilter(null);
                   } else {
                     setActiveFilter('all');
                     setSearchTerm('');
                   }
                 }}
               >
                 {activeFilter === 'all' ? 'Hide All Medications' : 'Show All Medications'}
               </button>
               <button 
                 id="showQuotaButton"
                 className={activeFilter === 'quota' ? 'active' : ''}
                 onClick={() => {
                   if (activeFilter === 'quota') {
                     setActiveFilter(null);
                   } else {
                     setActiveFilter('quota');
                     setSearchTerm('');
                   }
                 }}
               >
                 {activeFilter === 'quota' ? 'Hide Quota Medications' : 'Show Quota Medications'}
               </button>
            </div>
            <MedicationList 
              results={displayResults} 
              onSelect={handleSelectMedication} 
              searchTerm={searchTerm}
            />
          </>
        ) : (
          <MedicationDetails 
            medication={selectedMedication} 
            onBack={handleBack} 
          />
        )}
      </main>
      <Footer onOpenDisclaimer={() => setIsDisclaimerOpen(true)} />
      {isDisclaimerOpen && (
        <DisclaimerModal onClose={() => setIsDisclaimerOpen(false)} />
      )}
      {showUpdateNotification && (
        <div className="update-notification">
          <div className="update-text-container">
            <div className="marquee-content">
              <span>New medication data available! Please refresh to update your list. &nbsp;&nbsp;&nbsp;&nbsp;</span>
              <span>New medication data available! Please refresh to update your list. &nbsp;&nbsp;&nbsp;&nbsp;</span>
            </div>
          </div>
          <button id="refresh-button" onClick={handleRefresh}>Refresh Now</button>
        </div>
      )}
    </div>
  );
}

export default App;
