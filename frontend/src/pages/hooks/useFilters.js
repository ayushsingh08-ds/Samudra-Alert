// src/pages/hooks/useFilters.js
import { useState, useMemo, useRef, useEffect } from "react";

export function useFilters(data = []) {
  const [filters, setFilters] = useState({
    q: "",
    riskLevels: ["High", "Medium", "Low"],
    source: "all",
    startDate: null,
    endDate: null
  });
  
  const [searchInput, setSearchInput] = useState(filters.q);
  const searchDebounceRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    
    searchDebounceRef.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, q: searchInput }));
    }, 300);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchInput]);

  const filtered = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data.filter(item => {
      // Text search
      if (filters.q) {
        const searchTerm = filters.q.toLowerCase();
        const searchFields = [
          item.id || "",
          item.source || "",
          item.details?.note || "",
          item.details?.platform || "",
          item.details?.officerId || "",
          item.category || ""
        ].join(" ").toLowerCase();
        
        if (!searchFields.includes(searchTerm)) {
          return false;
        }
      }

      // Risk level filter
      if (!filters.riskLevels.includes(item.category)) {
        return false;
      }

      // Source filter
      if (filters.source !== "all" && item.source !== filters.source) {
        return false;
      }

      // Date range filter
      if (filters.startDate && item.timestamp < filters.startDate) {
        return false;
      }
      if (filters.endDate && item.timestamp > filters.endDate) {
        return false;
      }

      return true;
    });
  }, [data, filters]);

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      q: "",
      riskLevels: ["High", "Medium", "Low"],
      source: "all",
      startDate: null,
      endDate: null
    });
    setSearchInput("");
  };

  return {
    filtered,
    filters,
    updateFilters,
    resetFilters,
    searchInput,
    setSearchInput
  };
}
