import React, { useEffect } from 'react';
import { 
  Pill, Tag, FileText, AlertTriangle, X, 
  Activity, Hash, Ban, Zap, ShieldAlert, ExternalLink 
} from 'lucide-react';

/**
 * MedicationDetails component that displays detailed information about a selected medication in a modal.
 */
function MedicationDetails({ med, onClose }) {
  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => document.body.style.overflow = 'unset';
  }, []);

  if (!med) return null;

  // Helper to render MAL Brand links
  const renderMalLinks = () => {
    if (!med.malBrands || med.malBrands === 'None' || med.malBrands === '-') return null;
    
    // Split by comma or semicolon and trim
    const brands = med.malBrands.split(/[,;]/).map(b => b.trim()).filter(Boolean);
    
    if (brands.length === 0) return null;

    return (
      <div className="mt-4 pt-4 border-t border-stone-200 dark:border-gray-800">
        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <ExternalLink size={12} /> External Reference (Quest3+)
        </h3>
        <div className="flex flex-wrap gap-2">
          {brands.map((brand, idx) => (
            <a
              key={idx}
              href={`https://quest3plus.bpfk.gov.my/pmo2/detail.php?type=product&id=${brand}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors border border-indigo-100 dark:border-indigo-500/20 shadow-sm"
            >
              {brand}
            </a>
          ))}
        </div>
      </div>
    );
  };

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
                {med.isQuota && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-amber-100 dark:bg-amber-900/30 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                    <AlertTriangle size={10} /> Quota Item
                  </span>
                )}
              </div>
              
              {renderMalLinks()}
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

/**
 * DetailSection sub-component for individual sections of medication details.
 */
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

export default MedicationDetails;