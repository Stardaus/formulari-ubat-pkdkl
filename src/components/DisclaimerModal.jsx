import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * DisclaimerModal component that displays a medical disclaimer to the user.
 */
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

export default DisclaimerModal;