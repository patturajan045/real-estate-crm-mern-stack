import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import cmsService from '../services/cmsService';

const CmsContext = createContext();

export function CmsProvider({ children }) {
  const [contentMap, setContentMap] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      const res = await cmsService.getContent();
      if (res.status === 'success' && res.data) {
        setContentMap(res.data);
      }
    } catch (err) {
      console.warn('Could not load CMS content, using defaults:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const t = useCallback(
    (key, fallback = '') => {
      return contentMap[key] !== undefined && contentMap[key] !== null ? contentMap[key] : fallback;
    },
    [contentMap]
  );

  return (
    <CmsContext.Provider value={{ contentMap, t, refreshContent: fetchContent, loading }}>
      {children}
    </CmsContext.Provider>
  );
}

export function useCms() {
  const context = useContext(CmsContext);
  if (!context) {
    throw new Error('useCms must be used within a CmsProvider');
  }
  return context;
}
