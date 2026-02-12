import React from 'react';
import { Pill, Info, Sun, Moon } from 'lucide-react';

/**
 * Header component that displays the application title and a dark mode toggle.
 */
function Header({ theme, toggleTheme, setShowDisclaimer }) {
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-stone-100/70 dark:bg-gray-950/70 border-b border-stone-200/50 dark:border-gray-800/50 transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 min-h-[4rem] flex items-center justify-between">
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
  );
}

export default Header;