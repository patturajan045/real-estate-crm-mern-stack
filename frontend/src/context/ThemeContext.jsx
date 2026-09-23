import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('crm_theme') || 'dark';
  });

  const applyTheme = (newTheme) => {
    localStorage.setItem('crm_theme', newTheme);
    document.documentElement.setAttribute('data-bs-theme', newTheme);
    document.documentElement.classList.toggle('theme-dark', newTheme === 'dark');
    document.documentElement.classList.toggle('theme-light', newTheme === 'light');
    window.dispatchEvent(new CustomEvent('crm:theme-change', { detail: { theme: newTheme } }));
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeState(nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
