import React, { useState, useEffect, useRef } from 'react';
import { Pill, Hash, Tag, Search, ChevronRight } from 'lucide-react';

const BATCH_SIZE = 20;

/**
 * MedicationList component that displays search results with infinite scroll.
 */
function MedicationList({ filteredMeds, handleSelectMed }) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const loaderRef = useRef(null);

  // Reset visible count when filtered results change (e.g., new search query)
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [filteredMeds]);

  // Infinite scroll logic using Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredMeds.length) {
          setVisibleCount((prev) => prev + BATCH_SIZE);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [visibleCount, filteredMeds.length]);

  const visibleMeds = filteredMeds.slice(0, visibleCount);

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-1">
        Results ({filteredMeds.length})
      </h2>
      {filteredMeds.length > 0 ? (
        <div className="space-y-2">
          {visibleMeds.map(med => (
            <MedicationCard key={med.id} med={med} onClick={() => handleSelectMed(med)} />
          ))}
          
          {/* Intersection Observer Sentinel */}
          {visibleCount < filteredMeds.length && (
            <div ref={loaderRef} className="py-8 flex justify-center">
              <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          )}
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
  );
}

/**
 * MedicationCard sub-component for individual medication items.
 */
function MedicationCard({ med, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-stone-50 dark:bg-gray-900 border rounded-2xl cursor-pointer hover:shadow-md transition-all duration-200 gap-4 ${
        med.isQuota 
          ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.1)] dark:border-yellow-500/50 bg-yellow-50/30 dark:bg-yellow-900/10 hover:border-yellow-500' 
          : 'border-stone-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`mt-1 p-2.5 rounded-xl group-hover:scale-110 transition-transform ${
          med.isQuota
            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
            : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
        }`}>
          <Pill size={22} strokeWidth={2} />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className={`text-lg font-bold group-hover:transition-colors leading-tight ${
              med.isQuota
                ? 'text-yellow-900 dark:text-yellow-100 group-hover:text-yellow-700 dark:group-hover:text-yellow-300'
                : 'text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
            }`}>
              {med.name}
            </h3>
            {med.isQuota && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500 text-white shadow-sm">
                QUOTA
              </span>
            )}
            {med.prescriberCategory && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                med.isQuota
                  ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
                  : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
              }`}>
                Cat {med.prescriberCategory}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {med.mdc && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-stone-200/70 dark:bg-gray-800 text-xs font-medium text-stone-700 dark:text-gray-300">
                <Tag size={12} /> {med.mdc}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className={`hidden sm:flex items-center transition-colors pl-4 border-l ${
        med.isQuota
          ? 'text-yellow-400 group-hover:text-yellow-500 border-yellow-100 dark:border-yellow-900/30'
          : 'text-gray-400 group-hover:text-indigo-500 border-gray-100 dark:border-gray-800'
      }`}>
        <ChevronRight size={24} />
      </div>
    </div>
  );
}

export default MedicationList;