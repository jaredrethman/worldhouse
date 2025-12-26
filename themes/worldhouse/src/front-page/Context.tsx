import React, { createContext, useState, useEffect, useContext } from 'react';

export const ThemeContext = createContext<{
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}>({
  isDarkMode: false,
  toggleDarkMode: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = window.localStorage.getItem('dark-mode') as 'true' | 'false';
    return savedMode === 'true' || false;
  });

  useEffect(() => {
    window.localStorage.setItem('dark-mode', isDarkMode ? 'true' : 'false');
    document.body.className = isDarkMode ? 'dark-mode' : '';
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};