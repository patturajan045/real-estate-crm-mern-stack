import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value (e.g. search inputs or filter criteria)
 * @param {any} value Value to debounce
 * @param {number} delay Delay in milliseconds (default: 300ms)
 */
export default function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
