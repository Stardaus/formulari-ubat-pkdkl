import { useState, useEffect } from 'react';
import { fetchAndParseSheet } from '../utils/fetchSheet';

/**
 * URL for the main Google Sheet containing medication data.
 * This should be the 'published to web' CSV link.
 */
const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTFA9lhUhdSk7L_t0XnGtGzrIMw1g9EXrNjmRfaBaQ8naqAy7ua8r_lpeth-LPQQS2pOMlKKSbvYQuB/pub?gid=1786132140&single=true&output=csv";

/**
 * Custom React Hook to fetch and manage the medication data state.
 * 
 * @returns {Object} An object containing:
 *   - data {Array<Object>}: The array of parsed medication objects.
 *   - loading {boolean}: True while data is being fetched, false otherwise.
 *   - error {Error|null}: Error object if fetching failed, null otherwise.
 */
export function useMedicationData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initiate the fetch operation on component mount
    fetchAndParseSheet(GOOGLE_SHEET_CSV_URL)
      .then((allData) => {
        setData(allData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []); // Empty dependency array ensures this runs only once on mount

  return { data, loading, error };
}

