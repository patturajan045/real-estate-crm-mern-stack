import { useState, useEffect } from 'react';

/**
 * Custom hook to detect responsive viewport dimensions & breakpoints
 * Breakpoints:
 * - isMobile: < 768px
 * - isTablet: 768px - 991px
 * - isDesktop: >= 992px
 */
export default function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width < 768;
  const isTablet = windowSize.width >= 768 && windowSize.width < 992;
  const isDesktop = windowSize.width >= 992;

  return {
    ...windowSize,
    isMobile,
    isTablet,
    isDesktop,
  };
}
