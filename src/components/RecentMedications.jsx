import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';

/**
 * RecentMedications component that displays a welcome banner and a list of recently viewed medications.
 */
function RecentMedications({ recentMeds, handleClearRecents, handleSelectMed }) {
  return (
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
                className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all shadow-sm hover:shadow-md group ${
                  med.isQuota
                    ? 'bg-yellow-50/30 dark:bg-yellow-900/10 border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.1)] dark:border-yellow-500/50 hover:border-yellow-500'
                    : 'bg-stone-50 dark:bg-gray-900 border-stone-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
              >
                <div className="flex flex-col overflow-hidden">
                  <span className={`font-semibold truncate transition-colors ${
                    med.isQuota
                      ? 'text-yellow-900 dark:text-yellow-100 group-hover:text-yellow-700 dark:group-hover:text-yellow-300'
                      : 'text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                  }`}>
                    {med.name}
                  </span>
                </div>
                <ChevronRight size={18} className={`transition-colors flex-shrink-0 ${
                  med.isQuota ? 'text-yellow-400 group-hover:text-yellow-500' : 'text-gray-400 group-hover:text-indigo-500'
                }`} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default RecentMedications;