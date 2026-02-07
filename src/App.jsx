import React, { useState, useEffect } from 'react';
import { useMedicationData } from './hooks/useMedicationData';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import MedicationList from './components/MedicationList';
import MedicationDetails from './components/MedicationDetails';
import RecentMedications from './components/RecentMedications';
import Footer from './components/Footer';
import DisclaimerModal from './components/DisclaimerModal';
import { trackPageView } from './utils/analytics';

function App() {
  const { data, loading, error } = useMedicationData();
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [recentMedications, setRecentMedications] = useState(
    JSON.parse(localStorage.getItem('recentMedications')) || []
  );
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('list'); // 'list' or 'details'
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);

  useEffect(() => {
    trackPageView(view === 'details' ? `/drug/${selectedMedication?.['Generic Name']}` : '/');
  }, [view, selectedMedication]);

  useEffect(() => {
    const handleMessage = (event) => {
      console.log("App received message:", event.data);
      if (event.data && event.data.type === 'NEW_DATA_AVAILABLE') {
        setShowUpdateNotification(true);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleMessage);
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      }
    };
  }, []);

  const handleRefresh = () => {
    localStorage.setItem('lastManualRefresh', Date.now());
    window.location.reload();
  };

  const handleSelectMedication = (med) => {
    setSelectedMedication(med);
    setView('details');
    
    // Update recent medications
    const updatedRecent = [
      med,
      ...recentMedications.filter(m => m['Generic Name'] !== med['Generic Name'])
    ].slice(0, 5);
    setRecentMedications(updatedRecent);
    localStorage.setItem('recentMedications', JSON.stringify(updatedRecent));
  };

  const handleBack = () => {
    setView('list');
    setSelectedMedication(null);
  };

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
              setSearchTerm={setSearchTerm}
            />
            <RecentMedications 
              medications={recentMedications} 
              onSelect={handleSelectMedication}
              onClear={handleClearRecent}
            />
            <div className="button-group">
               <button onClick={() => setSearchResults(data.map(item => ({ item })))}>
                 Show All Medications
               </button>
               <button onClick={() => setSearchResults(data.filter(item => item.is_quota).map(item => ({ item })))}>
                 Show Quota Medications
               </button>
            </div>
            <MedicationList 
              results={searchResults} 
              onSelect={handleSelectMedication} 
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
