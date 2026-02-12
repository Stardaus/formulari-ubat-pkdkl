# **Implementation Plan: UI Redesign & Refactoring**

This document outlines the step-by-step process to cleanly adopt the new modern, minimalist design into the existing project structure.

## **Phase 1: Prerequisites & Setup**

1. **Install Dependencies:** The new design relies on lucide-react for modern iconography.  
   npm install lucide-react

2. **Verify Tailwind CSS Setup:** Ensure Tailwind CSS is configured properly in vite.config.js and/or tailwind.config.js.  
3. **Clean up style.css:** Since the new design uses Tailwind utility classes exclusively, remove conflicting custom CSS in src/styles/style.css, leaving only the core Tailwind directives:  
   @tailwind base;  
   @tailwind components;  
   @tailwind utilities;

## **Phase 2: Connect Your Real Data**

Ensure the data parser maps the CSV columns to the exact camelCase keys used in the new UI components.

1. **Update src/utils/parser.js or src/hooks/useMedicationData.js:**  
   Map the incoming Google Sheets data to match this structure:  
   * id  
   * name  
   * fukkmSystemGroup  
   * mdc  
   * neml  
   * methodOfPurchase  
   * prescriberCategory  
   * indications  
   * prescribingRestrictions  
   * dosage  
   * adverseReaction  
   * contraindications  
   * interactions  
   * precautions  
   * isQuota  
   * malBrands

## **Phase 3: Component Migration (Refactoring)**

Distribute the new monolithic design into the existing src/components/ folder:

1. **src/components/Header.jsx**  
   * Extract the \<header\> block.  
   * **Props needed:** theme, toggleTheme, setShowDisclaimer.  
2. **src/components/SearchBar.jsx**  
   * Extract the \<section\> containing the input field and search icon.  
   * **Props needed:** searchQuery, setSearchQuery.  
3. **src/components/RecentMedications.jsx**  
   * Extract the "Welcome" hero banner and the Recent Lookups grid.  
   * **Props needed:** recentMeds, handleClearRecents, handleSelectMed.  
4. **src/components/MedicationList.jsx**  
   * Move the MedicationCard component here.  
   * Map through filteredMeds to render the list.  
   * **Props needed:** filteredMeds, handleSelectMed.  
5. **src/components/MedicationDetails.jsx**  
   * Replace old code with the MedicationDetailsModal and DetailSection components.  
   * **Props needed:** med (selected medication object), onClose.  
6. **src/components/DisclaimerModal.jsx**  
   * Replace old code with the new DisclaimerModal component.  
   * **Props needed:** isOpen, onClose.

## **Phase 4: Update the Main Orchestrator (src/App.jsx)**

Rewrite src/App.jsx to act purely as the state manager, combining the real data hook with the newly separated components.

import React, { useState, useEffect, useMemo } from 'react';  
import useMedicationData from './hooks/useMedicationData';

// Import newly updated components  
import Header from './components/Header';  
import SearchBar from './components/SearchBar';  
import MedicationList from './components/MedicationList';  
import RecentMedications from './components/RecentMedications';  
import MedicationDetails from './components/MedicationDetails';  
import DisclaimerModal from './components/DisclaimerModal';

export default function App() {  
  // 1\. Fetch real data  
  const { medications, loading, error } \= useMedicationData();   
    
  // 2\. Application State  
  const \[searchQuery, setSearchQuery\] \= useState('');  
  const \[selectedMed, setSelectedMed\] \= useState(null);  
  const \[showDisclaimer, setShowDisclaimer\] \= useState(true);  
  const \[recentMeds, setRecentMeds\] \= useState(\[\]);  
    
  // Theme logic...  
  // LocalStorage recent meds logic...  
  // Filter logic (useMemo)...  
    
  return (  
    \<div className={\`min-h-screen transition-colors duration-300 ${theme \=== 'dark' ? 'dark' : ''}\`}\>  
       {/\* Background layers (Dot pattern & Glow) \*/}  
         
       \<div className="relative z-10 flex flex-col min-h-screen"\>  
          \<DisclaimerModal isOpen={showDisclaimer} onClose={() \=\> setShowDisclaimer(false)} /\>  
          {selectedMed && \<MedicationDetails med={selectedMed} onClose={() \=\> setSelectedMed(null)} /\>}  
            
          \<Header theme={theme} toggleTheme={toggleTheme} setShowDisclaimer={setShowDisclaimer} /\>  
            
          \<main className="flex-grow max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 pb-24"\>  
             \<SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} /\>  
               
             {loading && \<LoadingSpinner /\>}  
               
             {\!loading && searchQuery && (  
               \<MedicationList filteredMeds={filteredMeds} handleSelectMed={handleSelectMed} /\>  
             )}  
               
             {\!loading && \!searchQuery && (  
               \<RecentMedications recentMeds={recentMeds} handleSelectMed={handleSelectMed} handleClearRecents={handleClearRecents} /\>  
             )}  
          \</main\>  
       \</div\>  
    \</div\>  
  );  
}

## **Phase 5: Update Tests**

Because the DOM structure and CSS classes have completely changed, existing tests will need updating:

1. **Cypress UI Tests (tests/ui/medication\_display.cy.js):**  
   * Update generic DOM selections to match the new Tailwind classes or add specific data-testid attributes.  
   * Account for the new modal structure (fixed inset-0 overlays) rather than full-page transitions.  
2. **Jest Component Tests (tests/unit/SearchBar.test.jsx, etc.):**  
   * Update component imports and verify props match the refactored boundaries.  
   * Mock lucide-react icons if they cause issues in your testing environment.