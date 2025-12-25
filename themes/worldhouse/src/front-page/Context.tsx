import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext<{
  darkMode: boolean;
  toggleDarkMode: () => void;
}>({
  darkMode: false,
  toggleDarkMode: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('dark-mode') as 'true' | 'false';
    return savedMode === 'true' || false;
  });

  useEffect(() => {
    localStorage.setItem('dark-mode', darkMode ? 'true' : 'false');
    document.body.className = darkMode ? 'dark-mode' : '';
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};