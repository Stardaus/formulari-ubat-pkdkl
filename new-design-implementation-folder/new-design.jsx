import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Moon, Sun, Pill, Clock, ChevronRight, 
  X, AlertTriangle, Info, ShieldAlert, Activity, Hash,
  Ban, Zap, FileText, Tag 
} from 'lucide-react';

// --- MOCK DATA / DATA FETCHING LOGIC ---
// In your actual app, replace this with your Google Sheets fetch logic (fetchSheet.js)
const MOCK_MEDICATIONS = [
  {
    id: '1',
    name: 'Acetylsalicylic Acid 100 mg & Glycine 45 mg Tablet',
    fukkmSystemGroup: 'Blood and Blood Forming Organs > Antithrombotic Agents',
    mdc: 'B01AC06-259-T10-01-XXX',
    neml: 'No',
    methodOfPurchase: 'Government Contract',
    prescriberCategory: 'B',
    indications: 'i) Prevention of myocardial infarct, stroke, vascular occlusion and deep vein thrombosis. ii) Transient ischaemic attacks',
    prescribingRestrictions: 'None',
    dosage: '1 tablet daily',
    adverseReaction: 'Nausea, vomiting, dyspepsia, GI ulceration, haematemesis, malaena. Occasionally hepatotoxicity',
    contraindications: 'Bleeding disorders. Hypersensitivity to salicylate',
    interactions: 'Alcohol, dipyridamole, metoclopramide, metoprolol, carbonic anhydrase inhibitors, corticosteroids, coumarin anticoagulants, sulphonylureas, methotrexate, phenytoin, valproic acid, probenecid, sulphinpyrazone',
    precautions: 'Dyspepsia, gastric mucosal lesions, haemorrhagic disorders, gout, intolerant to aspirin, renal or hepatic impairment, asthma and G6PD deficiency',
    isQuota: 'FALSE',
    malBrands: 'MAL20116021X'
  },
  {
    id: '2',
    name: 'Paracetamol 500 mg Tablet',
    fukkmSystemGroup: 'Nervous System > Analgesics',
    mdc: 'N02BE01-000-T10-01-XXX',
    neml: 'Yes',
    methodOfPurchase: 'Local Purchase',
    prescriberCategory: 'C',
    indications: 'Mild to moderate pain, fever.',
    prescribingRestrictions: 'None',
    dosage: 'Adults: 500mg - 1000mg every 4-6 hours up to a maximum of 4g daily.',
    adverseReaction: 'Rarely skin rashes, liver damage with overdose.',
    contraindications: 'Severe hepatic impairment.',
    interactions: 'Metoclopramide, domperidone, cholestyramine.',
    precautions: 'Use with caution in severe liver disease or chronic alcoholism.',
    isQuota: 'FALSE',
    malBrands: 'MAL19910243XZ'
  },
  {
    id: '3',
    name: 'Amoxicillin 250 mg Capsule',
    fukkmSystemGroup: 'Anti-infectives for Systemic Use > Antibacterials for Systemic Use',
    mdc: 'J01CA04-000-C10-01-XXX',
    neml: 'Yes',
    methodOfPurchase: 'Government Contract',
    prescriberCategory: 'B',
    indications: 'Bacterial infections (respiratory, ear, skin).',
    prescribingRestrictions: 'None',
    dosage: 'Adults: 250mg - 500mg every 8 hours.',
    adverseReaction: 'Nausea, vomiting, diarrhea, allergic reactions.',
    contraindications: 'Penicillin hypersensitivity.',
    interactions: 'Probenecid, oral contraceptives, allopurinol.',
    precautions: 'Check for penicillin allergy before prescribing. Renal impairment.',
    isQuota: 'FALSE',
    malBrands: 'MAL19880123A'
  }
];

export default function App() {
  // --- STATE ---
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMed, setSelectedMed] = useState(null);
  const [recentMeds, setRecentMeds] = useState([]);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  
  // Theme state: Initialize from system preference or local storage
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app-theme');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // --- EFFECTS ---
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

  // Load Data
  useEffect(() => {
    // Simulate API/Sheet fetching delay
    const timer = setTimeout(() => {
      setMedications(MOCK_MEDICATIONS);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Load Recents from LocalStorage
  useEffect(() => {
    const savedRecents = localStorage.getItem('recent-meds');
    if (savedRecents) {
      try {
        setRecentMeds(JSON.parse(savedRecents));
      } catch (e) {
        console.error("Failed to parse recents", e);
      }
    }
  }, []);

  // --- HANDLERS ---
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

  // --- DERIVED DATA ---
  const filteredMeds = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return medications.filter(med => 
      (med.name && med.name.toLowerCase().includes(query)) || 
      (med.fukkmSystemGroup && med.fukkmSystemGroup.toLowerCase().includes(query)) ||
      (med.indications && med.indications.toLowerCase().includes(query))
    );
  }, [searchQuery, medications]);

  // --- RENDERERS ---
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
          
          {/* --- MODALS --- */}
          <DisclaimerModal 
            isOpen={showDisclaimer} 
            onClose={() => setShowDisclaimer(false)} 
          />
          
          {selectedMed && (
            <MedicationDetailsModal 
              med={selectedMed} 
              onClose={() => setSelectedMed(null)} 
            />
          )}

          {/* --- HEADER --- */}
          <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-stone-100/70 dark:bg-gray-950/70 border-b border-stone-200/50 dark:border-gray-800/50 transition-colors">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-sm">
                  <Pill size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-lg font-bold leading-none tracking-tight">Formulari Ubat</h1>
                  <p className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-1">PKD Kuala Langat</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowDisclaimer(true)}
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Disclaimer Info"
                >
                  <Info size={20} />
                </button>
                <button 
                  onClick={toggleTheme} 
                  className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Toggle Theme"
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
            </div>
          </header>

          {/* --- MAIN CONTENT --- */}
          <main className="flex-grow max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8 pb-24">
            
            {/* Search Section */}
            <section className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors">
                  <Search size={22} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search medications, categories, or indications..."
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

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium animate-pulse">Loading formulary data...</p>
              </div>
            )}

            {/* Search Results */}
            {!loading && searchQuery && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-1">
                  Results ({filteredMeds.length})
                </h2>
                {filteredMeds.length > 0 ? (
                  <div className="space-y-2">
                    {filteredMeds.map(med => (
                      <MedicationCard key={med.id} med={med} onClick={() => handleSelectMed(med)} />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center bg-stone-50 dark:bg-gray-900 rounded-2xl border border-stone-200 dark:border-gray-800 border-dashed">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-stone-200 dark:bg-gray-800 mb-4">
                      <Search size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-gray-900 dark:text-gray-100 font-medium">No medications found</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Try adjusting your search terms.</p>
                  </div>
                )}
              </section>
            )}

            {/* Idle State / Recent Medications */}
            {!loading && !searchQuery && (
              <section className="space-y-6 animate-in fade-in duration-500">
                
                {/* Introduction Hero (Only shows when not searching) */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                  <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-2">Welcome to PKD KL Formulary</h2>
                    <p className="text-indigo-100 max-w-md text-sm leading-relaxed">
                      Quickly search and reference approved medications, dosages, and indications. Designed for fast access in clinical settings.
                    </p>
                  </div>
                </div>

                {recentMeds.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pl-1">
                      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Clock size={16} /> Recent Lookups
                      </h2>
                      <button 
                        onClick={handleClearRecents}
                        className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {recentMeds.map(med => (
                        <div 
                          key={med.id}
                          onClick={() => handleSelectMed(med)}
                          className="flex items-center justify-between p-4 bg-stone-50 dark:bg-gray-900 border border-stone-200 dark:border-gray-800 rounded-2xl cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm hover:shadow-md group"
                        >
                          <div className="flex flex-col overflow-hidden">
                            <span className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{med.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{med.fukkmSystemGroup}</span>
                          </div>
                          <ChevronRight size={18} className="text-gray-400 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function MedicationCard({ med, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-stone-50 dark:bg-gray-900 border border-stone-200 dark:border-gray-800 rounded-2xl cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-200 gap-4"
    >
      <div className="flex items-start gap-4">
        <div className="mt-1 p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:scale-110 transition-transform">
          <Pill size={22} strokeWidth={2} />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
              {med.name}
            </h3>
            {med.prescriberCategory && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                Cat {med.prescriberCategory}
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {med.fukkmSystemGroup}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-stone-200/70 dark:bg-gray-800 text-xs font-medium text-stone-700 dark:text-gray-300">
              <Hash size={12} /> {med.dosage?.length > 30 ? med.dosage.substring(0, 30) + '...' : med.dosage}
            </span>
            {med.mdc && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-stone-200/70 dark:bg-gray-800 text-xs font-medium text-stone-700 dark:text-gray-300">
                <Tag size={12} /> {med.mdc}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="hidden sm:flex items-center text-gray-400 group-hover:text-indigo-500 transition-colors pl-4 border-l border-gray-100 dark:border-gray-800">
        <ChevronRight size={24} />
      </div>
    </div>
  );
}

function MedicationDetailsModal({ med, onClose }) {
  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => document.body.style.overflow = 'unset';
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-stone-50 dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200 dark:border-gray-800 bg-stone-100/50 dark:bg-gray-950/50">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl mt-1">
              <Pill size={24} strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{med.name}</h2>
                {med.prescriberCategory && (
                  <span className="px-2 py-1 rounded-md text-xs font-bold bg-indigo-600 text-white shadow-sm">
                    Cat {med.prescriberCategory}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{med.fukkmSystemGroup}</p>
              
              {/* Meta Tags */}
              <div className="flex flex-wrap gap-2 mt-3">
                {med.mdc && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-stone-200/70 dark:bg-gray-800 text-[11px] font-medium text-stone-700 dark:text-gray-400">
                    <Tag size={10} /> MDC: {med.mdc}
                  </span>
                )}
                {med.neml === 'Yes' && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-[11px] font-medium text-blue-700 dark:text-blue-300">
                    <FileText size={10} /> NEML
                  </span>
                )}
                {med.methodOfPurchase && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-stone-200/70 dark:bg-gray-800 text-[11px] font-medium text-stone-700 dark:text-gray-400">
                    {med.methodOfPurchase}
                  </span>
                )}
                {med.isQuota === 'TRUE' && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-amber-100 dark:bg-amber-900/30 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                    <AlertTriangle size={10} /> Quota Item
                  </span>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-stone-100 dark:bg-gray-800 rounded-full border border-stone-200 dark:border-gray-700 transition-colors shadow-sm self-start"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          <DetailSection 
            icon={<Activity size={18} />} 
            title="Indications" 
            content={med.indications} 
            bgColor="bg-emerald-50 dark:bg-emerald-500/10"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />
          <DetailSection 
            icon={<Hash size={18} />} 
            title="Dosage" 
            content={med.dosage} 
            bgColor="bg-blue-50 dark:bg-blue-500/10"
            iconColor="text-blue-600 dark:text-blue-400"
          />
          <DetailSection 
            icon={<AlertTriangle size={18} />} 
            title="Adverse Reactions" 
            content={med.adverseReaction} 
            bgColor="bg-orange-50 dark:bg-orange-500/10"
            iconColor="text-orange-600 dark:text-orange-400"
          />
          <DetailSection 
            icon={<Ban size={18} />} 
            title="Contraindications" 
            content={med.contraindications} 
            bgColor="bg-red-50 dark:bg-red-500/10"
            iconColor="text-red-600 dark:text-red-400"
          />
          <DetailSection 
            icon={<Zap size={18} />} 
            title="Interactions" 
            content={med.interactions} 
            bgColor="bg-purple-50 dark:bg-purple-500/10"
            iconColor="text-purple-600 dark:text-purple-400"
          />
          <DetailSection 
            icon={<ShieldAlert size={18} />} 
            title="Precautions" 
            content={med.precautions} 
            bgColor="bg-amber-50 dark:bg-amber-500/10"
            iconColor="text-amber-600 dark:text-amber-400"
          />
          <DetailSection 
            icon={<FileText size={18} />} 
            title="Prescribing Restrictions" 
            content={med.prescribingRestrictions && med.prescribingRestrictions !== 'None' ? med.prescribingRestrictions : null} 
            bgColor="bg-gray-100 dark:bg-gray-800"
            iconColor="text-gray-600 dark:text-gray-400"
          />
        </div>

      </div>
    </div>
  );
}

function DetailSection({ icon, title, content, bgColor, iconColor }) {
  if (!content) return null;
  return (
    <div className="space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
        <span className={`p-1.5 rounded-lg ${bgColor} ${iconColor}`}>
          {icon}
        </span>
        {title}
      </h3>
      <div className="pl-9">
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
          {content}
        </p>
      </div>
    </div>
  );
}

function DisclaimerModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-md"></div>
      
      <div className="relative w-full max-w-md bg-stone-50 dark:bg-gray-900 rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} strokeWidth={2} />
        </div>
        
        <h2 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-4">
          Medical Disclaimer
        </h2>
        
        <div className="text-gray-600 dark:text-gray-300 text-sm space-y-3 mb-8 text-center leading-relaxed">
          <p>
            The information provided in this application is strictly for <strong>educational and reference purposes</strong>.
          </p>
          <p>
            It is not intended to substitute for professional medical advice, diagnosis, or treatment. Always verify dosages and guidelines with official medical resources before prescribing.
          </p>
        </div>
        
        <button 
          onClick={onClose}
          className="w-full py-3.5 px-4 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold rounded-xl transition-colors shadow-sm"
        >
          I Understand & Agree
        </button>
      </div>
    </div>
  );
}