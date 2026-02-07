import { useState, useEffect } from 'react';
import { fetchAndParseSheet } from '../utils/fetchSheet';

const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTFA9lhUhdSk7L_t0XnGtGzrIMw1g9EXrNjmRfaBaQ8naqAy7ua8r_lpeth-LPQQS2pOMlKKSbvYQuB/pub?gid=1786132140&single=true&output=csv";

export function useMedicationData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAndParseSheet(GOOGLE_SHEET_CSV_URL)
      .then((allData) => {
        setData(allData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
}
