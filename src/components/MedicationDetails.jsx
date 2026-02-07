import React from 'react';
import { trackSelectItem } from '../utils/analytics';

/**
 * MedicationDetails component renders the full details of a selected medication.
 * 
 * Displays all available properties of the medication object.
 * Handles specific formatting for 'MAL_Brands' by creating external links.
 * 
 * @param {Object} props
 * @param {Object} props.medication - The medication object to display.
 * @param {Function} props.onBack - Callback function to return to the list view.
 */
function MedicationDetails({ medication, onBack }) {
  if (!medication) return null;

  const malBrands = medication.MAL_Brands 
    ? medication.MAL_Brands.split(",").map(b => b.trim()).filter(b => b !== "")
    : [];

  return (
    <div className={`drug-details-view ${medication.is_quota ? 'quota-details-view' : ''}`}>
      <button id="backButton" onClick={onBack}>Back to results</button>
      <h3>{medication["Generic Name"]}</h3>
      
      {Object.entries(medication).map(([key, value]) => {
        // Skip internal flags or empty keys
        if (key === "is_quota") return null;
        
        // Special handling for MAL Brands to create clickable links
        if (key === "MAL_Brands") {
          if (malBrands.length === 0) return null;
          return (
            <p key={key}>
              <strong>Brands Dispensed:</strong>{" "}
              {malBrands.map((brand, index) => (
                <React.Fragment key={brand}>
                  <a 
                    className="mal-brand-link" 
                    href={`https://quest3plus.bpfk.gov.my/pmo2/detail.php?type=product&id=${brand}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {brand}
                  </a>
                  {index < malBrands.length - 1 ? ", " : ""}
                </React.Fragment>
              ))}
            </p>
          );
        }
        
        // Render standard key-value pairs
        return (
          <p key={key}>
            <strong>{key}:</strong> {value}
          </p>
        );
      })}
    </div>
  );
}

export default MedicationDetails;
